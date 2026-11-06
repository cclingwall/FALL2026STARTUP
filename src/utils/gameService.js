async function requestGame(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not reach the game service. Please check your connection.');
  }
  if (response.status === 401) {
    throw new Error('Your session expired. Log in again to access saved results.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || 'The game service could not complete the request.');
  if (!data) throw new Error('The game service returned an invalid response.');
  return data;
}

export function submitAttempt(attempt) {
  const { mode, targetNote, guessedNote, targetOctave, responseTimeMs } = attempt;
  return requestGame('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, targetNote, guessedNote, targetOctave, responseTimeMs }),
  });
}

export const fetchPlayerStats = (signal) => requestGame('/api/stats', { signal });
export const fetchLeaderboard = (signal) => requestGame('/api/leaderboard', { signal });
