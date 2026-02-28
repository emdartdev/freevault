import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string | null;
  category_id: string | null;
  website_url: string;
  cover_image: string | null;
  logo_image: string | null;
  shared_enabled: boolean;
  shared_email: string | null;
  shared_password: string | null;
  status: string;
  featured: boolean;
  created_at: string;
  categories?: { id: string; name: string; slug: string } | null;
  avg_rating?: number;
  total_ratings?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export const useTools = (categorySlug?: string, search?: string) => {
  return useQuery({
    queryKey: ['tools', categorySlug, search],
    queryFn: async () => {
      let query = supabase
        .from('tools')
        .select('*, categories(id, name, slug)')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (categorySlug) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch ratings for each tool
      const toolsWithRatings = await Promise.all(
        (data || []).map(async (tool: any) => {
          const { data: ratingData } = await supabase.rpc('get_tool_avg_rating', {
            tool_uuid: tool.id,
          });
          const rd = ratingData?.[0];
          return {
            ...tool,
            avg_rating: rd?.avg_rating ?? 0,
            total_ratings: rd?.total_ratings ?? 0,
          };
        })
      );

      return toolsWithRatings as Tool[];
    },
  });
};

export const useToolBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['tool', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*, categories(id, name, slug)')
        .eq('slug', slug)
        .single();
      if (error) throw error;

      const { data: ratingData } = await supabase.rpc('get_tool_avg_rating', {
        tool_uuid: data.id,
      });
      const rd = ratingData?.[0];

      return {
        ...data,
        avg_rating: rd?.avg_rating ?? 0,
        total_ratings: rd?.total_ratings ?? 0,
      } as Tool;
    },
    enabled: !!slug,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useUserRating = (toolId: string, userId?: string) => {
  return useQuery({
    queryKey: ['rating', toolId, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('tool_id', toolId)
        .eq('user_id', userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId && !!toolId,
  });
};

export const useRateTool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ toolId, userId, rating }: { toolId: string; userId: string; rating: number }) => {
      const { data: existing } = await supabase
        .from('ratings')
        .select('id')
        .eq('tool_id', toolId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('ratings')
          .update({ rating })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ratings')
          .insert({ tool_id: toolId, user_id: userId, rating });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['tool'] });
      queryClient.invalidateQueries({ queryKey: ['rating'] });
    },
  });
};

// Admin hooks
export const useAllTools = () => {
  return useQuery({
    queryKey: ['admin-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*, categories(id, name, slug)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Tool[];
    },
  });
};

export const useCreateTool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tool: Omit<Tool, 'id' | 'created_at' | 'categories' | 'avg_rating' | 'total_ratings'>) => {
      const { data, error } = await supabase.from('tools').insert(tool).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
};

export const useUpdateTool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...tool }: Partial<Tool> & { id: string }) => {
      const { categories, avg_rating, total_ratings, ...updateData } = tool as any;
      const { data, error } = await supabase.from('tools').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['tool'] });
    },
  });
};

export const useDeleteTool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { name: string; slug: string; icon?: string }) => {
      const { data, error } = await supabase.from('categories').insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};
