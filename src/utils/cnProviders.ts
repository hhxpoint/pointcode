/**
 * Chinese LLM provider presets for openclaude.
 * All providers are OpenAI-compatible — only baseUrl/model/key differ.
 * Data sourced from official API docs (2026-04).
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const PROVIDER_KEYS_PATH = join(homedir(), '.claude', 'provider-keys.json')

function normalizeSavedKeys(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )
}

export interface CNProviderPreset {
  id: string
  name: string        // Chinese display name
  nameEn: string      // English display name
  baseUrl: string
  requiresApiKey: boolean
  models: Array<{
    id: string
    name: string
    contextWindow: number
    reasoning: boolean  // supports reasoning/thinking
  }>
  defaultModel: string
  docUrl: string       // Official docs link
}

export const CN_PROVIDERS: Record<string, CNProviderPreset> = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    nameEn: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
    defaultModel: 'google/gemma-4-31b-it:free',
    docUrl: 'https://openrouter.ai/models/google/gemma-4-31b-it:free',
    models: [
      {
        id: 'google/gemma-4-31b-it:free',
        name: 'Gemma 4 31B (Free)',
        contextWindow: 131072,
        reasoning: true,
      },
      {
        id: 'google/gemma-3-27b-it:free',
        name: 'Gemma 3 27B (Free)',
        contextWindow: 131072,
        reasoning: true,
      },
    ],
  },
  dashscope: {
    id: 'dashscope',
    name: '通义千问 (Qwen)',
    nameEn: 'Qwen (DashScope)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    requiresApiKey: true,
    defaultModel: 'qwen3.5-plus',
    docUrl: 'https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope',
    models: [
      { id: 'qwen3.5-plus', name: 'Qwen3.5 Plus', contextWindow: 131072, reasoning: true },
      { id: 'qwen3.5-flash', name: 'Qwen3.5 Flash', contextWindow: 131072, reasoning: false },
    ],
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    nameEn: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    requiresApiKey: true,
    defaultModel: 'deepseek-chat',
    docUrl: 'https://api-docs.deepseek.com/',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3.2 (Chat)', contextWindow: 131072, reasoning: false },
      { id: 'deepseek-reasoner', name: 'DeepSeek-V3.2 (Reasoner)', contextWindow: 131072, reasoning: true },
    ],
  },
  zhipu: {
    id: 'zhipu',
    name: '智谱 GLM',
    nameEn: 'Zhipu GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
    requiresApiKey: true,
    defaultModel: 'glm-5',
    docUrl: 'https://docs.bigmodel.cn/cn/guide/develop/openai/introduction',
    models: [
      { id: 'glm-5', name: 'GLM-5', contextWindow: 131072, reasoning: true },
      { id: 'glm-5-turbo', name: 'GLM-5 Turbo', contextWindow: 131072, reasoning: false },
      { id: 'glm-4.7-flash', name: 'GLM-4.7 Flash (Free)', contextWindow: 32768, reasoning: false },
    ],
  },
  mimo: {
    id: 'mimo',
    name: '小米 MiMo',
    nameEn: 'Xiaomi MiMo',
    baseUrl: 'https://api.xiaomimimo.com/v1',
    requiresApiKey: true,
    defaultModel: 'mimo-v2-pro',
    docUrl: 'https://platform.xiaomimimo.com/',
    models: [
      { id: 'mimo-v2-pro', name: 'MiMo-V2 Pro', contextWindow: 1048576, reasoning: true },
      { id: 'mimo-v2-flash', name: 'MiMo-V2 Flash', contextWindow: 131072, reasoning: false },
      { id: 'mimo-v2-omni', name: 'MiMo-V2 Omni', contextWindow: 131072, reasoning: false },
    ],
  },
}

export function getCNProvider(id: string): CNProviderPreset | undefined {
  return CN_PROVIDERS[id]
}

export function getCNProviderList(): CNProviderPreset[] {
  return Object.values(CN_PROVIDERS)
}

export function loadSavedKeys(): Record<string, string> {
  try {
    const content = readFileSync(PROVIDER_KEYS_PATH, 'utf8')
    return normalizeSavedKeys(JSON.parse(content))
  } catch {
    return {}
  }
}

export function saveProviderKey(providerId: string, apiKey: string): void {
  if (!providerId || !apiKey) {
    return
  }

  const savedKeys = loadSavedKeys()
  savedKeys[providerId] = apiKey

  mkdirSync(dirname(PROVIDER_KEYS_PATH), { recursive: true })
  writeFileSync(PROVIDER_KEYS_PATH, JSON.stringify(savedKeys, null, 2), 'utf8')
}

export function getProviderKey(providerId: string): string | null {
  return loadSavedKeys()[providerId] ?? null
}

/**
 * Build environment variables for a Chinese provider profile.
 */
export function buildCNProviderEnv(providerId: string, options: {
  model?: string | null
  apiKey?: string | null
  savedKeys?: Record<string, string> | null
}): Record<string, string> | null {
  const preset = CN_PROVIDERS[providerId]
  if (!preset) return null

  const model = options.model || preset.defaultModel
  const apiKey = options.apiKey || options.savedKeys?.[providerId] || null

  if (preset.requiresApiKey && !apiKey) return null

  const env: Record<string, string> = {
    CLAUDE_CODE_USE_OPENAI: '1',
    OPENAI_BASE_URL: preset.baseUrl,
    OPENAI_MODEL: model,
  }

  if (apiKey) {
    env.OPENAI_API_KEY = apiKey
  }

  return env
}
