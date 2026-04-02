const MODEL_FETCH_TIMEOUT_MS = 3_000

type OpenAIModelsResponse = {
  data?: Array<{
    id?: unknown
  }>
}

function buildModelsUrl(baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return new URL('models', normalizedBaseUrl).toString()
}

export async function fetchAvailableModels(): Promise<string[]> {
  const baseUrl = process.env.OPENAI_BASE_URL
  const apiKey = process.env.OPENAI_API_KEY
  if (!baseUrl || !apiKey) {
    return []
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), MODEL_FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(buildModelsUrl(baseUrl), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    })
    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as OpenAIModelsResponse
    if (!Array.isArray(payload.data)) {
      return []
    }

    return payload.data
      .map(model => (typeof model.id === 'string' ? model.id : null))
      .filter((id): id is string => id !== null)
  } catch {
    return []
  } finally {
    clearTimeout(timeoutId)
  }
}
