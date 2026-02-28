
create or replace function public.get_tool_avg_rating(tool_uuid uuid)
returns table(avg_rating numeric, total_ratings bigint)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(avg(rating)::numeric(3,2), 0) as avg_rating,
         count(*) as total_ratings
  from public.ratings
  where tool_id = tool_uuid;
$$;
