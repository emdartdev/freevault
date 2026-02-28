
-- Create app_role enum
create type public.app_role as enum ('admin', 'user');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "Public profiles are viewable" on public.profiles
  for select to anon using (true);

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function for role checks
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone" on public.categories
  for select using (true);

create policy "Admins can manage categories" on public.categories
  for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Tools table
create table public.tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text not null,
  full_description text,
  category_id uuid references public.categories(id) on delete set null,
  website_url text not null,
  cover_image text,
  logo_image text,
  shared_enabled boolean not null default false,
  shared_email text,
  shared_password text,
  status text not null default 'published' check (status in ('published', 'draft')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tools enable row level security;

create policy "Published tools are viewable by everyone" on public.tools
  for select using (status = 'published' or public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage tools" on public.tools
  for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Ratings table
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tool_id uuid references public.tools(id) on delete cascade not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now(),
  unique (user_id, tool_id)
);

alter table public.ratings enable row level security;

create policy "Ratings are viewable by everyone" on public.ratings
  for select using (true);

create policy "Authenticated users can rate" on public.ratings
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update own rating" on public.ratings
  for update to authenticated using (auth.uid() = user_id);

create policy "Admins can delete ratings" on public.ratings
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to get average rating for a tool
create or replace function public.get_tool_avg_rating(tool_uuid uuid)
returns table(avg_rating numeric, total_ratings bigint)
language sql
stable
as $$
  select coalesce(avg(rating)::numeric(3,2), 0) as avg_rating,
         count(*) as total_ratings
  from public.ratings
  where tool_id = tool_uuid;
$$;
