import React, { useMemo, useState } from 'react'
import { Box, Link, Text } from '../../ink.js'
import TextInput from '../TextInput.js'
import { Select, type OptionWithDescription } from '../CustomSelect/index.js'
import { PermissionDialog } from '../permissions/PermissionDialog.js'
import { gracefulShutdownSync } from '../../utils/gracefulShutdown.js'
import {
  buildCNProviderEnv,
  getCNProviderList,
  loadSavedKeys,
  saveProviderKey,
  type CNProviderPreset,
} from '../../utils/cnProviders.js'
import {
  applyProviderProfileToProcessEnv,
  loadPersistedProviderProfile,
  saveOpenAIProviderProfile,
} from '../../utils/providerSetup.js'

type Props = {
  onComplete(): void
}

type SetupStep = 'provider' | 'baseUrl' | 'apiKey' | 'model' | 'done'
type ProviderChoice = ReturnType<typeof getCNProviderList>[number]['id'] | 'custom' | 'ollama'

type PrefillState = {
  provider: ProviderChoice
  baseUrl: string
  apiKey: string
  model: string
  hasExistingProfile: boolean
}

const OLLAMA_BASE_URL = 'http://localhost:11434/v1'
const CUSTOM_PROVIDER: ProviderChoice = 'custom'
const OLLAMA_PROVIDER: ProviderChoice = 'ollama'
const DEFAULT_OLLAMA_MODEL = 'qwen2.5:14b'

function normalizeBaseUrl(baseUrl: string | undefined): string {
  return (baseUrl ?? '').trim().replace(/\/+$/, '')
}

function isLikelyOllamaBaseUrl(baseUrl: string | undefined): boolean {
  if (!baseUrl) {
    return false
  }

  try {
    const parsed = new URL(baseUrl)
    const localHost =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1'

    return localHost && (parsed.port === '11434' || parsed.pathname.startsWith('/v1'))
  } catch {
    return false
  }
}

function getProviderPreset(
  provider: ProviderChoice,
  presets: CNProviderPreset[],
): CNProviderPreset | undefined {
  return presets.find(preset => preset.id === provider)
}

function inferProviderChoice(
  baseUrl: string | undefined,
  presets: CNProviderPreset[],
): ProviderChoice {
  const normalized = normalizeBaseUrl(baseUrl)
  const preset = presets.find(
    item => normalizeBaseUrl(item.baseUrl) === normalized,
  )

  if (preset) {
    return preset.id
  }

  if (isLikelyOllamaBaseUrl(baseUrl)) {
    return OLLAMA_PROVIDER
  }

  return CUSTOM_PROVIDER
}

function getDefaultModelForProvider(
  provider: ProviderChoice,
  presets: CNProviderPreset[],
): string {
  if (provider === OLLAMA_PROVIDER) {
    return DEFAULT_OLLAMA_MODEL
  }

  if (provider === CUSTOM_PROVIDER) {
    return ''
  }

  return getProviderPreset(provider, presets)?.defaultModel ?? ''
}

function getInitialState(presets: CNProviderPreset[]): PrefillState {
  const savedKeys = loadSavedKeys()
  const profile = loadPersistedProviderProfile()

  if (!profile?.env?.OPENAI_BASE_URL) {
    const firstPreset = presets[0]
    return {
      provider: firstPreset?.id ?? CUSTOM_PROVIDER,
      baseUrl: firstPreset?.baseUrl ?? '',
      apiKey: savedKeys[firstPreset?.id ?? ''] ?? '',
      model: firstPreset?.defaultModel ?? '',
      hasExistingProfile: false,
    }
  }

  const provider = inferProviderChoice(profile.env.OPENAI_BASE_URL, presets)
  const preset = getProviderPreset(provider, presets)
  const baseUrl =
    provider === OLLAMA_PROVIDER
      ? profile.env.OPENAI_BASE_URL || OLLAMA_BASE_URL
      : provider === CUSTOM_PROVIDER
        ? profile.env.OPENAI_BASE_URL || ''
        : preset?.baseUrl || profile.env.OPENAI_BASE_URL || ''

  const apiKey =
    savedKeys[provider] ??
    profile.env.OPENAI_API_KEY ??
    ''

  const model =
    profile.env.OPENAI_MODEL ||
    getDefaultModelForProvider(provider, presets)

  return {
    provider,
    baseUrl,
    apiKey,
    model,
    hasExistingProfile: true,
  }
}

function InputCard(props: {
  label: string
  hint: string
  value: string
  placeholder: string
  mask?: string
  footer?: React.ReactNode
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onExit: () => void
}): React.ReactNode {
  const [cursorOffset, setCursorOffset] = useState(props.value.length)

  return (
    <Box flexDirection="column" gap={1}>
      <Text>{props.label}</Text>
      <Box borderStyle="round" borderDimColor marginY={1} paddingLeft={1}>
        <TextInput
          focus
          showCursor
          value={props.value}
          onChange={value => {
            props.onChange(value)
            setCursorOffset(value.length)
          }}
          onSubmit={props.onSubmit}
          onExit={props.onExit}
          placeholder={props.placeholder}
          columns={80}
          cursorOffset={cursorOffset}
          onChangeCursorOffset={setCursorOffset}
          mask={props.mask}
        />
      </Box>
      {props.footer}
      <Text dimColor>{props.hint}</Text>
    </Box>
  )
}

export function ProviderSetup({ onComplete }: Props): React.ReactNode {
  const presets = useMemo(() => getCNProviderList(), [])
  const initialState = useMemo(() => getInitialState(presets), [presets])

  const [step, setStep] = useState<SetupStep>('provider')
  const [provider, setProvider] = useState<ProviderChoice>(initialState.provider)
  const [baseUrl, setBaseUrl] = useState(initialState.baseUrl)
  const [apiKey, setApiKey] = useState(initialState.apiKey)
  const [model, setModel] = useState(initialState.model)
  const [error, setError] = useState<string | null>(null)

  const preset = getProviderPreset(provider, presets)
  const needsBaseUrl = provider === CUSTOM_PROVIDER || provider === OLLAMA_PROVIDER
  const requiresApiKey =
    provider === CUSTOM_PROVIDER || (preset?.requiresApiKey ?? false)
  const usesModelInput =
    provider === CUSTOM_PROVIDER || provider === OLLAMA_PROVIDER

  const providerOptions = useMemo<OptionWithDescription<ProviderChoice>[]>(
    () => [
      ...presets.map(item => ({
        label: `${item.nameEn}`,
        value: item.id,
        description: item.baseUrl,
      })),
      {
        label: 'Custom OpenAI-Compatible',
        value: CUSTOM_PROVIDER,
        description: '手动填写 Base URL、API Key 和 model',
      },
      {
        label: 'Ollama',
        value: OLLAMA_PROVIDER,
        description: '本地 OpenAI 兼容服务',
      },
    ],
    [presets],
  )

  const modelOptions = useMemo<OptionWithDescription<string>[]>(
    () =>
      (preset?.models ?? []).map(item => ({
        label: item.name,
        value: item.id,
        description: item.id,
      })),
    [preset],
  )

  function clearError(): void {
    if (error) {
      setError(null)
    }
  }

  function goToPreviousStep(): void {
    clearError()

    if (step === 'provider') {
      return
    }

    if (step === 'baseUrl') {
      setStep('provider')
      return
    }

    if (step === 'apiKey') {
      setStep(needsBaseUrl ? 'baseUrl' : 'provider')
      return
    }

    setStep(requiresApiKey ? 'apiKey' : needsBaseUrl ? 'baseUrl' : 'provider')
  }

  function exitWizard(): void {
    gracefulShutdownSync(0)
  }

  function handleProviderSelected(nextProvider: ProviderChoice): void {
    clearError()
    setProvider(nextProvider)

    const nextPreset = getProviderPreset(nextProvider, presets)
    const savedKeys = loadSavedKeys()

    if (nextProvider === OLLAMA_PROVIDER) {
      setBaseUrl(
        baseUrl && provider === OLLAMA_PROVIDER ? baseUrl : OLLAMA_BASE_URL,
      )
      if (!model || provider !== OLLAMA_PROVIDER) {
        setModel(model || DEFAULT_OLLAMA_MODEL)
      }
      setStep('baseUrl')
      return
    }

    if (nextProvider === CUSTOM_PROVIDER) {
      if (provider !== CUSTOM_PROVIDER) {
        setBaseUrl('')
      }
      if (provider !== CUSTOM_PROVIDER) {
        setModel('')
      }
      setApiKey(savedKeys[CUSTOM_PROVIDER] ?? apiKey)
      setStep('baseUrl')
      return
    }

    setBaseUrl(nextPreset?.baseUrl ?? '')
    setApiKey(savedKeys[nextProvider] ?? apiKey)
    if (!nextPreset?.models.some(item => item.id === model)) {
      setModel(nextPreset?.defaultModel ?? '')
    }
    setStep(nextPreset?.requiresApiKey ? 'apiKey' : 'model')
  }

  function validateBaseUrl(value: string): string | null {
    if (!value.trim()) {
      return 'Base URL 不能为空'
    }

    try {
      const parsed = new URL(value.trim())
      if (!parsed.protocol.startsWith('http')) {
        return 'Base URL 必须是 http 或 https'
      }
      return null
    } catch {
      return 'Base URL 格式不正确'
    }
  }

  function completeSetup(selectedModel: string): void {
    const trimmedModel = selectedModel.trim()
    const trimmedApiKey = apiKey.trim()
    const trimmedBaseUrl = baseUrl.trim()

    if (!trimmedModel) {
      setError('Model 不能为空')
      if (usesModelInput) {
        setStep('model')
      }
      return
    }

    let env: Record<string, string> | null = null

    if (provider === OLLAMA_PROVIDER) {
      const baseUrlError = validateBaseUrl(trimmedBaseUrl || OLLAMA_BASE_URL)
      if (baseUrlError) {
        setError(baseUrlError)
        setStep('baseUrl')
        return
      }

      env = {
        CLAUDE_CODE_USE_OPENAI: '1',
        OPENAI_BASE_URL: trimmedBaseUrl || OLLAMA_BASE_URL,
        OPENAI_MODEL: trimmedModel,
      }
    } else if (provider === CUSTOM_PROVIDER) {
      const baseUrlError = validateBaseUrl(trimmedBaseUrl)
      if (baseUrlError) {
        setError(baseUrlError)
        setStep('baseUrl')
        return
      }

      if (!trimmedApiKey) {
        setError('API Key 不能为空')
        setStep('apiKey')
        return
      }

      env = {
        CLAUDE_CODE_USE_OPENAI: '1',
        OPENAI_BASE_URL: trimmedBaseUrl,
        OPENAI_MODEL: trimmedModel,
        OPENAI_API_KEY: trimmedApiKey,
      }
    } else {
      env = buildCNProviderEnv(provider, {
        model: trimmedModel,
        apiKey: trimmedApiKey,
      })

      if (!env) {
        setError('当前 provider 缺少有效的 API Key')
        setStep('apiKey')
        return
      }
    }

    if (trimmedApiKey) {
      saveProviderKey(provider, trimmedApiKey)
    }

    const profile = saveOpenAIProviderProfile(env)
    applyProviderProfileToProcessEnv(profile)

    // Switch to a no-input "done" state so Ink releases stdin focus
    // before the main REPL mounts. Without this, TextInput/Select
    // listeners from the wizard can steal stdin from the REPL.
    setStep('done')
    setTimeout(() => onComplete(), 50)
  }

  function renderProviderStep(): React.ReactNode {
    return (
      <Box flexDirection="column" gap={1}>
        <Text>选择一个 provider。首次裸启动只会出现一次，之后会直接读取保存的 profile。</Text>
        <Select
          options={providerOptions}
          defaultFocusValue={provider}
          onChange={handleProviderSelected}
          onCancel={exitWizard}
          layout="compact-vertical"
        />
        <Text dimColor>Enter 确认 · Esc 退出</Text>
      </Box>
    )
  }

  function renderBaseUrlStep(): React.ReactNode {
    return (
      <InputCard
        label={
          provider === OLLAMA_PROVIDER
            ? '输入 Ollama Base URL'
            : '输入自定义 provider 的 Base URL'
        }
        value={baseUrl}
        placeholder={
          provider === OLLAMA_PROVIDER
            ? OLLAMA_BASE_URL
            : 'https://api.example.com/v1'
        }
        hint="Enter 下一步 · Esc 返回上一步"
        onChange={value => {
          clearError()
          setBaseUrl(value)
        }}
        onSubmit={value => {
          const nextBaseUrl = value.trim() || (provider === OLLAMA_PROVIDER ? OLLAMA_BASE_URL : '')
          const validationError = validateBaseUrl(nextBaseUrl)
          if (validationError) {
            setError(validationError)
            return
          }

          setBaseUrl(nextBaseUrl)
          setStep(requiresApiKey ? 'apiKey' : 'model')
        }}
        onExit={goToPreviousStep}
      />
    )
  }

  function renderApiKeyStep(): React.ReactNode {
    return (
      <InputCard
        label="输入 API Key"
        value={apiKey}
        placeholder="sk-..."
        hint="Enter 下一步 · Esc 返回上一步"
        mask="*"
        footer={
          preset?.docUrl ? (
            <Text dimColor>
              获取地址：<Link url={preset.docUrl}>{preset.docUrl}</Link>
            </Text>
          ) : null
        }
        onChange={value => {
          clearError()
          setApiKey(value)
        }}
        onSubmit={value => {
          if (!value.trim()) {
            setError('API Key 不能为空')
            return
          }

          setApiKey(value.trim())
          setStep('model')
        }}
        onExit={goToPreviousStep}
      />
    )
  }

  function renderModelStep(): React.ReactNode {
    if (usesModelInput) {
      return (
        <InputCard
          label="输入模型名称"
          value={model}
          placeholder={
            provider === OLLAMA_PROVIDER ? '例如 qwen2.5:14b' : '例如 deepseek-chat'
          }
          hint="Enter 完成配置 · Esc 返回上一步"
          onChange={value => {
            clearError()
            setModel(value)
          }}
          onSubmit={value => {
            setModel(value)
            completeSetup(value)
          }}
          onExit={goToPreviousStep}
        />
      )
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Text>选择模型</Text>
        <Select
          options={modelOptions}
          defaultFocusValue={model || preset?.defaultModel}
          onChange={value => {
            setModel(value)
            completeSetup(value)
          }}
          onCancel={goToPreviousStep}
          layout="compact-vertical"
        />
        <Text dimColor>Enter 完成配置 · Esc 返回上一步</Text>
      </Box>
    )
  }

  return (
    <PermissionDialog
      title="Provider Setup"
      subtitle="首次裸启动配置 OpenAI 兼容 provider"
      color="permission"
      titleColor="permission"
    >
      <Box flexDirection="column" gap={1} paddingTop={1}>
        {initialState.hasExistingProfile ? (
          <Text dimColor>检测到现有 profile，已按上次配置预填。</Text>
        ) : (
          <Text dimColor>未检测到可用 provider，完成向导后会继续正常启动。</Text>
        )}

        {error ? <Text color="error">{error}</Text> : null}

        {step === 'done'
          ? <Text color="green">配置完成，正在启动...</Text>
          : step === 'provider'
            ? renderProviderStep()
            : step === 'baseUrl'
              ? renderBaseUrlStep()
              : step === 'apiKey'
                ? renderApiKeyStep()
                : renderModelStep()}
      </Box>
    </PermissionDialog>
  )
}
