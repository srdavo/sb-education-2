import { useQuery } from '@tanstack/vue-query'
import { supabase } from '@/lib/supabaseClient'

async function fetchLevels() {
  const { data, error } = await supabase
    .from('levels')
    .select('id, label, description')
    .order('sort_order')
  if (error) throw error
  return data
}

export function useLevels() {
  return useQuery({
    queryKey: ['levels'],
    queryFn: fetchLevels,
    staleTime: Infinity
  })
}
