import * as React from 'react'
import { useState } from 'react'
import type { CommandResultDisplay } from '../commands.js'
import TextInput from './TextInput.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import { Box, Text } from '../ink.js'
import { saveOpenAIProviderProfile, applyProviderProfileToProcessEnv } from '../utils/providerSetup.js'

type Step = 'url' | 'key' | 'model'

type Props = {
  onDone: (result?: string, options?: { display?: CommandResultDisplay }) => void
}

function clearThirdPartyProviderFlags(): void {
  delete process.env.CLAUDE_CODE_USE_GEMINI
  delete process.env.CLAUDE_CODE_USE_BEDROCK
  delete process.env.CLAUDE_CODE_USE_VERTEX
  delete process.env.CLAUDE_CODE_USE_FOUNDRY
}

export function EnterCustomEndpoint({ onDone }: Props): React.ReactNode {
  const terminalSize = useTerminalSize()
  const [step, setStep] = useState<Step>('url')
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [cursorOffset, setCursorOffset] = useState(0)
  const [errorText, setErrorText] = useState<string | null>(null)

  const columns = Math.max(50, terminalSize.columns)

  function handleUrlSubmit(value: string): void {
    const trimmed = value.trim()
    if (!trimmed) {
      setErrorText('Base URL cannot be empty.')
      return
    }
    try {
      new URL(trimmed)
    } catch {
      setErrorText('Invalid URL. Please enter a valid URL (e.g. https://api.example.com/v1).')
      return
    }
    setUrl(trimmed)
    setErrorText(null)
    setCursorOffset(0)
    setStep('key')
  }

  function handleKeySubmit(value: string): void {
    const trimmed = value.trim()
    if (!trimmed) {
      setErrorText('API key cannot be empty.')
      return
    }
    setApiKey(trimmed)
    setErrorText(null)
    setCursorOffset(0)
    setStep('model')
  }

  function handleModelSubmit(value: string): void {
    const trimmed = value.trim()
    if (!trimmed) {
      setErrorText('Model name cannot be empty.')
      return
    }

    clearThirdPartyProviderFlags()
    process.env.CLAUDE_CODE_USE_OPENAI = '1'

    const profile = saveOpenAIProviderProfile({
      OPENAI_BASE_URL: url,
      OPENAI_API_KEY: apiKey,
      OPENAI_MODEL: trimmed,
    })
    applyProviderProfileToProcessEnv(profile)

    onDone(`Custom endpoint configured.\n  URL:   ${url}\n  Model: ${trimmed}\nAPI key saved. Run /model to switch models.`, {
      display: 'system',
    })
  }

  function handleChange(value: string): void {
    if (errorText) setErrorText(null)
  }

  const stepConfig = {
    url: {
      title: 'Step 1/3: Enter API Base URL',
      placeholder: 'https://api.example.com/v1',
      mask: undefined as string | undefined,
      value: url,
      onSubmit: handleUrlSubmit,
    },
    key: {
      title: 'Step 2/3: Enter API Key',
      placeholder: 'sk-...',
      mask: '*',
      value: apiKey,
      onSubmit: handleKeySubmit,
    },
    model: {
      title: 'Step 3/3: Enter Model Name',
      placeholder: 'e.g. gpt-4o, qwen3.5-plus, deepseek-chat',
      mask: undefined as string | undefined,
      value: model,
      onSubmit: handleModelSubmit,
    },
  }

  const current = stepConfig[step]

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="column">
        <Text bold={true}>Configure Custom Endpoint</Text>
        <Text dimColor={true}>{current.title}</Text>
        <Text dimColor={true}>Press Enter to continue, Esc to cancel.</Text>
      </Box>
      {step === 'model' && (
        <Box marginBottom={1}>
          <Text dimColor={true}>URL: {url}</Text>
        </Box>
      )}
      {errorText && (
        <Box marginBottom={1}>
          <Text color="error">{errorText}</Text>
        </Box>
      )}
      <TextInput
        value={current.value}
        onChange={handleChange}
        onPaste={handleChange}
        onSubmit={current.onSubmit}
        focus={true}
        placeholder={current.placeholder}
        mask={current.mask}
        columns={columns}
        cursorOffset={cursorOffset}
        onChangeCursorOffset={setCursorOffset}
        showCursor={true}
      />
    </Box>
  )
}
