async function requestAuth(path, options) {
  try {
    return await fetch(path, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not reach the account service. Please try again.');
  }
}

async function readAccount(response, errorMessage) {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || errorMessage);
  if (typeof data?.username !== 'string' || !data.username) throw new Error(errorMessage);
  return data;
}

export async function restoreAccount(signal) {
  const response = await requestAuth('/api/user/me', { signal });
  if (response.status === 401) return null;
  return readAccount(response, 'Could not check your session.');
}

export async function submitCredentials(action, username, password) {
  const response = await requestAuth(`/api/auth/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const errorMessage = action === 'register' ? 'Could not create your account.' : 'Could not log in.';
  return readAccount(response, errorMessage);
}

export async function endSession() {
  const response = await requestAuth('/api/auth/logout', { method: 'DELETE' });
  if (!response.ok) throw new Error('Could not log out. Please try again.');
}
