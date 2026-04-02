import chalk from 'chalk';
import * as React from 'react';
import { useState } from 'react';
import type { CommandResultDisplay } from '../../commands.js';
import TextInput from '../../components/TextInput.js';
import { ModelPicker } from '../../components/ModelPicker.js';
import { COMMON_HELP_ARGS, COMMON_INFO_ARGS } from '../../constants/xml.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { type AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS, logEvent } from '../../services/analytics/index.js';
import { Box, Text } from '../../ink.js';
import { useAppState, useSetAppState } from '../../state/AppState.js';
import type { AppState } from '../../state/AppState.js';
import type { LocalJSXCommandCall } from '../../types/command.js';
import type { EffortLevel } from '../../utils/effort.js';
import { isBilledAsExtraUsage } from '../../utils/extraUsage.js';
import { clearFastModeCooldown, isFastModeAvailable, isFastModeEnabled, isFastModeSupportedByModel } from '../../utils/fastMode.js';
import { MODEL_ALIASES } from '../../utils/model/aliases.js';
import { checkOpus1mAccess, checkSonnet1mAccess } from '../../utils/model/check1mAccess.js';
import { getDefaultMainLoopModelSetting, isOpus1mMergeEnabled, renderDefaultModelSetting, switchOpenAIModel } from '../../utils/model/model.js';
import { getAPIProvider } from '../../utils/model/providers.js';
import { isModelAllowed } from '../../utils/model/modelAllowlist.js';
import { validateModel } from '../../utils/model/validateModel.js';
import { saveApiKey } from '../../utils/auth.js';
import { applyProviderProfileToProcessEnv, saveOpenAIProviderProfile } from '../../utils/providerSetup.js';
import { getCNProviderList } from '../../utils/cnProviders.js';

function clearThirdPartyProviderFlags(): void {
  delete process.env.CLAUDE_CODE_USE_OPENAI;
  delete process.env.CLAUDE_CODE_USE_GEMINI;
  delete process.env.CLAUDE_CODE_USE_BEDROCK;
  delete process.env.CLAUDE_CODE_USE_VERTEX;
  delete process.env.CLAUDE_CODE_USE_FOUNDRY;
}

function isAnthropicFamilyModel(model: string | null | undefined): boolean {
  if (!model) {
    return false;
  }
  const normalized = model.toLowerCase();
  return normalized.includes('opus') || normalized.includes('sonnet') || normalized.includes('haiku') || normalized.includes('claude');
}

function resolveBaseUrlForModel(model: string | null | undefined): string | undefined {
  if (!model) {
    return process.env.OPENAI_BASE_URL;
  }
  const provider = getCNProviderList().find(item => item.models.some(m => m.id === model));
  if (provider) {
    return provider.baseUrl;
  }
  return process.env.OPENAI_BASE_URL;
}
async function saveModelApiKey(value: string, onDone: (result?: string, options?: {
  display?: CommandResultDisplay;
}) => void, modelValue?: string | null): Promise<void> {
  try {
    if (isAnthropicFamilyModel(modelValue) || /^sk-ant/i.test(value)) {
      clearThirdPartyProviderFlags();
      await saveApiKey(value);
      process.env.ANTHROPIC_API_KEY = value;
      delete process.env.OPENAI_API_KEY;
      onDone('API key saved. You can now run /model to choose a model and start using PointCode.', {
        display: 'system'
      });
      return;
    }

    const openAIModel = modelValue ?? process.env.OPENAI_MODEL ?? 'qwen3.5-plus';
    const openAIBaseUrl = resolveBaseUrlForModel(openAIModel) ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const profile = saveOpenAIProviderProfile({
      OPENAI_BASE_URL: openAIBaseUrl,
      OPENAI_MODEL: openAIModel,
      OPENAI_API_KEY: value
    });
    applyProviderProfileToProcessEnv(profile);
    process.env.CLAUDE_CODE_USE_OPENAI = '1';
    delete process.env.ANTHROPIC_API_KEY;
    await saveApiKey(value);
    onDone('API key saved. You can now run /model to choose a model and start using PointCode.', {
      display: 'system'
    });
  } catch (error) {
    onDone(`Failed to save API key: ${(error as Error).message}`, {
      display: 'system'
    });
  }
}
function EnterApiKeyAndSave({
  onDone,
  modelValue
}: {
  onDone: (result?: string, options?: {
    display?: CommandResultDisplay;
  }) => void;
  modelValue?: string | null;
}): React.ReactNode {
  const terminalSize = useTerminalSize();
  const [apiKey, setApiKey] = useState('');
  const [cursorOffset, setCursorOffset] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  function saveAndClose(input: string): void {
    const value = input.trim();
    if (!value) {
      setErrorText('API key cannot be empty.');
      return;
    }
    void saveModelApiKey(value, onDone, modelValue);
  }

  return <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="column">
        <Text bold={true}>Configure API key</Text>
        <Text dimColor={true}>Paste your API key and press Enter. You can cancel with Esc.</Text>
      </Box>
      {errorText && <Box marginBottom={1}>
          <Text color="error">{errorText}</Text>
        </Box>}
      <TextInput value={apiKey} onChange={value => {
      if (errorText) {
        setErrorText(null);
      }
      setApiKey(value);
    }} onPaste={value => {
      if (errorText) {
        setErrorText(null);
      }
      setApiKey(value);
    }} onSubmit={saveAndClose} focus={true} placeholder="sk-..." mask="*" columns={Math.max(50, terminalSize.columns)} cursorOffset={cursorOffset} onChangeCursorOffset={setCursorOffset} showCursor={true} />
    </Box>;
}

function ModelPickerWrapper(t0: {
  onDone: (result?: string, options?: {
    display?: CommandResultDisplay;
  }) => void;
}) {
  const {
    onDone
  } = t0;
  const mainLoopModel = useAppState(_temp) as string | null;
  const mainLoopModelForSession = useAppState(_temp2) as string | null;
  const isFastMode = useAppState(_temp3) as boolean;
  const setAppState = useSetAppState();
  const [pendingSelection, setPendingSelection] = useState<{
    model: string | null;
    effort: EffortLevel | undefined;
  } | null>(null);

  function applyModelAndClose(model: string | null, effort: EffortLevel | undefined, includeKeySavedPrefix = false): void {
    setAppState(prev => ({
      ...prev,
      mainLoopModel: model,
      mainLoopModelForSession: null
    }));

    let message = `${includeKeySavedPrefix ? 'API key saved. ' : ''}Set model to ${chalk.bold(renderModelLabel(model))}`;
    if (effort !== undefined) {
      message = message + ` with ${chalk.bold(effort)} effort`;
    }

    let wasFastModeToggledOn = undefined;
    if (isFastModeEnabled()) {
      clearFastModeCooldown();
      if (!isFastModeSupportedByModel(model) && isFastMode) {
        setAppState(_temp4);
        wasFastModeToggledOn = false;
      } else if (isFastModeSupportedByModel(model) && isFastModeAvailable() && isFastMode) {
        message = message + ' · Fast mode ON';
        wasFastModeToggledOn = true;
      }
    }

    if (isBilledAsExtraUsage(model, wasFastModeToggledOn === true, isOpus1mMergeEnabled())) {
      message = message + ' · Billed as extra usage';
    }
    if (wasFastModeToggledOn === false) {
      message = message + ' · Fast mode OFF';
    }

    onDone(message);
  }

  function handleCancel(): void {
    logEvent('tengu_model_command_menu', {
      action: 'cancel' as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
    });
    const displayModel = renderModelLabel(mainLoopModel);
    onDone(`Kept model as ${chalk.bold(displayModel)}`, {
      display: 'system'
    });
  }

  function handleSelect(model: string | null, effort: EffortLevel | undefined): void {
    logEvent('tengu_model_command_menu', {
      action: model as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
      from_model: mainLoopModel as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
      to_model: model as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
    });

    if (model === '__custom__') {
      onDone('Custom model placeholder selected. Run /model <model-name> (for example: /model qwen3.5-plus).', {
        display: 'system'
      });
      return;
    }

    let selectedModel = model;
    if (selectedModel !== null && !isAnthropicFamilyModel(selectedModel)) {
      selectedModel = switchOpenAIModel(selectedModel);
    }

    if (selectedModel !== null) {
      setPendingSelection({
        model: selectedModel,
        effort
      });
      return;
    }

    applyModelAndClose(selectedModel, effort);
  }

  const showFastModeNotice = isFastModeEnabled() && isFastMode && isFastModeSupportedByModel(mainLoopModel) && isFastModeAvailable();

  if (pendingSelection) {
    return <EnterApiKeyAndSave modelValue={pendingSelection.model} onDone={(result, options) => {
      if (!result || !result.startsWith('API key saved')) {
        onDone(result, options);
        return;
      }
      applyModelAndClose(pendingSelection.model, pendingSelection.effort, true);
    }} />;
  }

  return <ModelPicker initial={mainLoopModel} sessionModel={mainLoopModelForSession} onSelect={handleSelect} onCancel={handleCancel} isStandaloneCommand={true} showFastModeNotice={showFastModeNotice} headerText="Select a model. After selection, enter an API key to confirm." />;
}
function _temp4(prev_0: AppState): AppState {
  return {
    ...prev_0,
    fastMode: false
  };
}
function _temp3(s_1: AppState): boolean {
  return s_1.fastMode;
}
function _temp2(s_0: AppState): string | null {
  return s_0.mainLoopModelForSession;
}
function _temp(s: AppState): string | null {
  return s.mainLoopModel;
}
function SetModelAndClose({
  args,
  onDone
}: {
  args: string;
  onDone: (result?: string, options?: {
    display?: CommandResultDisplay;
  }) => void;
}): React.ReactNode {
  const isFastMode = useAppState((s: AppState) => s.fastMode);
  const setAppState = useSetAppState();
  const model = args === 'default' ? null : args;
  React.useEffect(() => {
    async function handleModelChange(): Promise<void> {
      if (model && !isModelAllowed(model)) {
        onDone(`Model '${model}' is not available. Your organization restricts model selection.`, {
          display: 'system'
        });
        return;
      }

      // @[MODEL LAUNCH]: Update check for 1M access.
      if (model && isOpus1mUnavailable(model)) {
        onDone(`Opus 4.6 with 1M context is not available for your account.#extended-context-with-1m`, {
          display: 'system'
        });
        return;
      }
      if (model && isSonnet1mUnavailable(model)) {
        onDone(`Sonnet 4.6 with 1M context is not available for your account. Learn more: https://code.claude.com/docs/en/model-config#extended-context-with-1m`, {
          display: 'system'
        });
        return;
      }

      // Skip validation for default model
      if (!model) {
        setModel(null);
        return;
      }

      const missingOpenAIKeyTip = getMissingOpenAIKeyTip();
      if (missingOpenAIKeyTip) {
        onDone(missingOpenAIKeyTip, {
          display: 'system'
        });
        return;
      }

      if (model === '__custom__') {
        onDone("Custom model placeholder selected. Run /model <model-name> (for example: /model qwen3.5-plus).", {
          display: 'system'
        });
        return;
      }

      // Skip validation for known aliases - they're predefined and should work
      if (isKnownAlias(model)) {
        setModel(model);
        return;
      }

      // Validate and set custom model
      try {
        // Don't use parseUserSpecifiedModel for non-aliases since it lowercases the input
        // and model names are case-sensitive
        const {
          valid,
          error: error_0
        } = await validateModel(model);
        if (valid) {
          const modelToSet = getAPIProvider() === 'openai' ? switchOpenAIModel(model) : model;
          setModel(modelToSet);
        } else {
          onDone(error_0 || `Model '${model}' not found`, {
            display: 'system'
          });
        }
      } catch (error) {
        onDone(`Failed to validate model: ${(error as Error).message}`, {
          display: 'system'
        });
      }
    }
    function setModel(modelValue: string | null): void {
      setAppState(prev => ({
        ...prev,
        mainLoopModel: modelValue,
        mainLoopModelForSession: null
      }));
      let message = `Set model to ${chalk.bold(renderModelLabel(modelValue))}`;
      let wasFastModeToggledOn = undefined;
      if (isFastModeEnabled()) {
        clearFastModeCooldown();
        if (!isFastModeSupportedByModel(modelValue) && isFastMode) {
          setAppState(prev_0 => ({
            ...prev_0,
            fastMode: false
          }));
          wasFastModeToggledOn = false;
          // Do not update fast mode in settings since this is an automatic downgrade
        } else if (isFastModeSupportedByModel(modelValue) && isFastMode) {
          message += ` · Fast mode ON`;
          wasFastModeToggledOn = true;
        }
      }
      if (isBilledAsExtraUsage(modelValue, wasFastModeToggledOn === true, isOpus1mMergeEnabled())) {
        message += ` · Billed as extra usage`;
      }
      if (wasFastModeToggledOn === false) {
        // Fast mode was toggled off, show suffix after extra usage billing
        message += ` · Fast mode OFF`;
      }
      onDone(message);
    }
    void handleModelChange();
  }, [model, onDone, setAppState]);
  return null;
}
function isKnownAlias(model: string): boolean {
  return (MODEL_ALIASES as readonly string[]).includes(model.toLowerCase().trim());
}
function isOpus1mUnavailable(model: string): boolean {
  const m = model.toLowerCase();
  return !checkOpus1mAccess() && !isOpus1mMergeEnabled() && m.includes('opus') && m.includes('[1m]');
}
function isSonnet1mUnavailable(model: string): boolean {
  const m = model.toLowerCase();
  // Warn about Sonnet and Sonnet 4.6, but not Sonnet 4.5 since that had
  // a different access criteria.
  return !checkSonnet1mAccess() && (m.includes('sonnet[1m]') || m.includes('sonnet-4-6[1m]'));
}
function isLocalProviderUrl(baseUrl: string | undefined): boolean {
  if (!baseUrl) return false;
  try {
    const parsed = new URL(baseUrl);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  } catch {
    return false;
  }
}
function getMissingOpenAIKeyTip(): string | undefined {
  if (getAPIProvider() !== 'openai') {
    return undefined;
  }
  if (process.env.OPENAI_API_KEY) {
    return undefined;
  }
  if (isLocalProviderUrl(process.env.OPENAI_BASE_URL)) {
    return undefined;
  }
  return "OpenAI API key is missing. Run /model key <api_key> (or set OPENAI_API_KEY), then retry /model.";
}
function ShowModelAndClose(t0: {
  onDone: (result?: string) => void;
}) {
  const {
    onDone
  } = t0;
  const mainLoopModel = useAppState(_temp7) as string | null;
  const mainLoopModelForSession = useAppState(_temp8) as string | null;
  const effortValue = useAppState(_temp9) as AppState['effortValue'];
  const displayModel = renderModelLabel(mainLoopModel);
  const effortInfo = effortValue !== undefined ? ` (effort: ${effortValue})` : "";
  if (mainLoopModelForSession) {
    onDone(`Current model: ${chalk.bold(renderModelLabel(mainLoopModelForSession))} (session override from plan mode)\nBase model: ${displayModel}${effortInfo}`);
  } else {
    onDone(`Current model: ${displayModel}${effortInfo}`);
  }
  return null;
}
function _temp9(s_1: AppState): AppState['effortValue'] {
  return s_1.effortValue;
}
function _temp8(s_0: AppState): string | null {
  return s_0.mainLoopModelForSession;
}
function _temp7(s: AppState): string | null {
  return s.mainLoopModel;
}
export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  args = args?.trim() || '';
  const missingOpenAIKeyTip = getMissingOpenAIKeyTip();
  if (!args && missingOpenAIKeyTip) {
    return <EnterApiKeyAndSave onDone={onDone} />;
  }
  if (args.toLowerCase().startsWith('sk-')) {
    args = `key ${args}`;
  }
  if (args.toLowerCase() === 'key') {
    return <EnterApiKeyAndSave onDone={onDone} />;
  }
  if (args.toLowerCase().startsWith('key ')) {
    const apiKey = args.slice(4).trim();
    if (!apiKey) {
      onDone('Usage: /model key <api_key>', {
        display: 'system'
      });
      return;
    }
    await saveModelApiKey(apiKey, onDone);
    return;
  }
  if (COMMON_INFO_ARGS.includes(args)) {
    logEvent('tengu_model_command_inline_help', {
      args: args as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
    });
    return <ShowModelAndClose onDone={onDone} />;
  }
  if (COMMON_HELP_ARGS.includes(args)) {
    onDone('Run /model to open the model selection menu, /model [modelName] to set the model, or /model key <api_key> to save your API key.', {
      display: 'system'
    });
    return;
  }
  if (args) {
    logEvent('tengu_model_command_inline', {
      args: args as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
    });
    return <SetModelAndClose args={args} onDone={onDone} />;
  }
  return <ModelPickerWrapper onDone={onDone} />;
};
function renderModelLabel(model: string | null): string {
  const rendered = renderDefaultModelSetting(model ?? getDefaultMainLoopModelSetting());
  return model === null ? `${rendered} (default)` : rendered;
}
