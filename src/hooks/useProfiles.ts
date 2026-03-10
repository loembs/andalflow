import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { UserRole } from '@/types';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export const useProfiles = () => {
  const enabled = !!supabase;

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, created_at')
        .order('full_name');
      if (error) throw new Error(error.message);
      return (data ?? []) as Profile[];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return { profiles, isLoading };
};
