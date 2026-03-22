const DEFAULT_TIMEOUT_MS = 12000;

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
}

export async function apiFetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers || {})
      }
    });

    const payload = await response.json().catch(() => ({}));

    return {
      response,
      payload
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The OmniToolset backend is taking too long to respond. Please try again.');
    }

    throw new Error('The OmniToolset backend could not be reached. Please try again.');
  } finally {
    clearTimeout(timeoutId);
  }
}
