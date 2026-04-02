import type { LocalCommandCall } from '../../types/command.js'
import {
  getCNProvider,
  getCNProviderList,
  getProviderKey,
  saveProviderKey,
} from '../../utils/cnProviders.js'
import {
  applyProviderProfileToProcessEnv,
  saveOpenAIProviderProfile,
} from '../../utils/providerSetup.js'
import { switchOpenAIModel } from '../../utils/model/model.js'
import { getAPIProvider } from '../../utils/model/providers.js'

function normalizeBaseUrl(baseUrl?: string): string | undefined {
  return baseUrl?.trim().replace(/\/+$/, '')
}

function getCurrentPreset() {
  const baseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL)
  if (!baseUrl) {
    return undefined
  }

  return getCNProviderList().find(
    provider => normalizeBaseUrl(provider.baseUrl) === baseUrl,
  )
}

function maskApiKey(apiKey: string | null | undefined): string {
  if (!apiKey) {
    return '\u672a\u914d\u7f6e'
  }

  if (apiKey.length <= 8) {
    return `${apiKey} (\u5df2\u914d\u7f6e)`
  }

  return `${apiKey.slice(0, 5)}...${apiKey.slice(-4)} (\u5df2\u914d\u7f6e)`
}

function getCurrentModel(context: Parameters<LocalCommandCall>[1]): string {
  const { mainLoopModelForSession, mainLoopModel } = context.getAppState()
  return (
    mainLoopModelForSession ??
    mainLoopModel ??
    process.env.OPENAI_MODEL ??
    '-'
  )
}

function getCurrentProviderLabel(): string {
  const apiProvider = getAPIProvider()
  if (apiProvider === 'openai') {
    return getCurrentPreset()?.name ?? '\u81ea\u5b9a\u4e49 OpenAI-Compatible'
  }
  if (apiProvider === 'gemini') {
    return 'Gemini'
  }
  if (apiProvider === 'bedrock') {
    return 'AWS Bedrock'
  }
  if (apiProvider === 'vertex') {
    return 'Google Vertex AI'
  }
  if (apiProvider === 'foundry') {
    return 'Azure Foundry'
  }
  return 'Anthropic'
}

function formatCurrentStatus(context: Parameters<LocalCommandCall>[1]): string {
  const apiProvider = getAPIProvider()
  const preset = getCurrentPreset()
  const currentModel = getCurrentModel(context)

  if (apiProvider !== 'openai') {
    return [
      `\u5f53\u524d\u670d\u52a1\u5546: ${getCurrentProviderLabel()}`,
      'Base URL:   -',
      `\u6a21\u578b:       ${currentModel}`,
      'API Key:    -',
      '',
      '\u5f53\u524d\u672a\u5904\u4e8e OpenAI provider \u6a21\u5f0f\uff0c\u8fd0\u884c /provider set <provider_id> \u53ef\u5207\u6362\u5230 CN provider\u3002',
    ].join('\n')
  }

  const apiKey =
    process.env.OPENAI_API_KEY ?? (preset ? getProviderKey(preset.id) : null)

  return [
    `\u5f53\u524d\u670d\u52a1\u5546: ${getCurrentProviderLabel()}`,
    `Base URL:   ${process.env.OPENAI_BASE_URL ?? '-'}`,
    `\u6a21\u578b:       ${currentModel}`,
    `API Key:    ${maskApiKey(apiKey)}`,
  ].join('\n')
}

function formatProviderList(): string {
  return getCNProviderList()
    .map(provider => {
      const keyStatus = getProviderKey(provider.id)
        ? '\u2713 \u5df2\u914d\u7f6e key'
        : '\u2717 \u672a\u914d\u7f6e key'
      const label = `${provider.name} (${provider.id})`
      return `  ${label.padEnd(28)} ${keyStatus}`
    })
    .join('\n')
}

function clearCompetingProviderFlags(): void {
  delete process.env.CLAUDE_CODE_USE_GEMINI
  delete process.env.CLAUDE_CODE_USE_BEDROCK
  delete process.env.CLAUDE_CODE_USE_VERTEX
  delete process.env.CLAUDE_CODE_USE_FOUNDRY
}

function usageText(): string {
  return [
    '\u7528\u6cd5:',
    '/provider',
    '/provider list',
    '/provider set <provider_id>',
    '/provider key <provider_id> <api_key>',
  ].join('\n')
}

export const call: LocalCommandCall = async (args, context) => {
  const tokens = args.trim().split(/\s+/).filter(Boolean)

  if (tokens.length === 0) {
    return {
      type: 'text',
      value: formatCurrentStatus(context),
    }
  }

  const [subcommand, ...rest] = tokens

  if (subcommand === 'list') {
    return {
      type: 'text',
      value: formatProviderList(),
    }
  }

  if (subcommand === 'set') {
    const providerId = rest[0]?.trim()
    if (!providerId || rest.length !== 1) {
      return {
        type: 'text',
        value: usageText(),
      }
    }

    const provider = getCNProvider(providerId)
    if (!provider) {
      return {
        type: 'text',
        value: `\u2717 \u672a\u77e5 provider: ${providerId}\n\u53ef\u7528 provider: ${getCNProviderList()
          .map(item => item.id)
          .join(', ')}`,
      }
    }

    const apiKey = getProviderKey(providerId)
    if (!apiKey) {
      return {
        type: 'text',
        value: `\u2717 ${provider.name} \u672a\u914d\u7f6e API Key\uff0c\u8bf7\u5148\u8fd0\u884c: /provider key ${providerId} <your-key>`,
      }
    }

    clearCompetingProviderFlags()
    process.env.CLAUDE_CODE_USE_OPENAI = '1'

    const actualModel = switchOpenAIModel(
      `${providerId}:${provider.defaultModel}`,
    )

    const profile = saveOpenAIProviderProfile({
      OPENAI_BASE_URL: provider.baseUrl,
      OPENAI_MODEL: actualModel,
      OPENAI_API_KEY: apiKey,
    })
    applyProviderProfileToProcessEnv(profile)

    context.setAppState(prev => ({
      ...prev,
      mainLoopModel: actualModel,
      mainLoopModelForSession: null,
    }))
    context.onChangeAPIKey()

    return {
      type: 'text',
      value: `\u2713 \u5df2\u5207\u6362\u5230 ${provider.name} (${actualModel})`,
    }
  }

  if (subcommand === 'key') {
    const providerId = rest[0]?.trim()
    const apiKey = rest.slice(1).join(' ').trim()

    if (!providerId || !apiKey) {
      return {
        type: 'text',
        value: usageText(),
      }
    }

    const provider = getCNProvider(providerId)
    if (!provider) {
      return {
        type: 'text',
        value: `\u2717 \u672a\u77e5 provider: ${providerId}\n\u53ef\u7528 provider: ${getCNProviderList()
          .map(item => item.id)
          .join(', ')}`,
      }
    }

    saveProviderKey(providerId, apiKey)

    if (getCurrentPreset()?.id === providerId) {
      const currentModel = getCurrentModel(context)
      const profile = saveOpenAIProviderProfile({
        OPENAI_BASE_URL: provider.baseUrl,
        OPENAI_MODEL:
          currentModel === '-' ? provider.defaultModel : currentModel,
        OPENAI_API_KEY: apiKey,
      })
      applyProviderProfileToProcessEnv(profile)
      context.onChangeAPIKey()
    }

    return {
      type: 'text',
      value: `\u2713 \u5df2\u4fdd\u5b58${provider.name}\u7684 API Key`,
    }
  }

  return {
    type: 'text',
    value: usageText(),
  }
}
