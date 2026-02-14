import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from './useAuth'

async function fetchCompletions(userId) {
  const { data, error } = await supabase
    .from('level_completions')
    .select('level, score_percentage, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
  if (error) throw error
  // Por nivel, quedarse solo con el mejor score
  return data.reduce((acc, row) => {
    if (!acc[row.level] || row.score_percentage > acc[row.level].score_percentage) {
      acc[row.level] = row
    }
    return acc
  }, {})
}

export function useLevelCompletions() {
  const { user } = useAuth()
  const userId = computed(() => user.value?.id)

  const query = useQuery({
    queryKey: ['level_completions', userId],
    queryFn: () => fetchCompletions(userId.value),
    enabled: computed(() => !!userId.value)
  })

  return {
    completions: computed(() => query.data.value ?? {}),
    isLoading: query.isLoading
  }
}
