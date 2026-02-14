import { supabase } from '@/lib/supabaseClient'

export async function recordActivityResult(result) {
  const { error } = await supabase.from('activity_results').insert(result)
  if (error) {
    console.warn('No se pudo guardar resultado, UX continua:', error.message)
    return { ok: false }
  }
  return { ok: true }
}

export async function recordLevelCompletion({ userId, level, score }) {
  const { error } = await supabase.from('level_completions').insert({
    user_id: userId,
    level,
    score_percentage: score.percentage,
    correct_count: score.correct,
    total_count: score.total
  })
  if (error) {
    console.warn('No se pudo guardar completion de nivel:', error.message)
    return { ok: false }
  }
  return { ok: true }
}
