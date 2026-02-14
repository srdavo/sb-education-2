export function createSession({ userId, level, activities }) {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    level,
    queue: activities,
    current_index: 0,
    results: []
  }
}

export function advanceSession(session, result) {
  session.results.push(result)
  session.current_index++
}

export function isSessionComplete(session) {
  return session.current_index >= session.queue.length
}

export function getSessionScore(session) {
  const total = session.results.length
  const correct = session.results.filter(r => r.correct).length
  return { correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 }
}
