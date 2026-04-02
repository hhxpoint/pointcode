import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  createProfileFile,
  type ProfileEnv,
  type ProfileFile,
} from './providerProfile.js'
import { isEnvTruthy } from './envUtils.js'

const PROFILE_FILENAME = '.openclaude-profile.json'

const OPENAI_PROFILE_KEYS: ReadonlyArray<keyof ProfileEnv> = [
  'OPENAI_BASE_URL',
  'OPENAI_MODEL',
  'OPENAI_API_KEY',
  'CODEX_API_KEY',
  'CHATGPT_ACCOUNT_ID',
  'CODEX_ACCOUNT_ID',
]

const GEMINI_PROFILE_KEYS: ReadonlyArray<keyof ProfileEnv> = [
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'GEMINI_BASE_URL',
]

const SUPPORTED_PROFILE_TYPES = new Set<ProfileFile['profile']>([
  'openai',
  'ollama',
  'codex',
  'gemini',
])

export function getProviderProfilePath(cwd: string = process.cwd()): string {
  return resolve(cwd, PROFILE_FILENAME)
}

export function hasPersistedProviderProfile(
  cwd: string = process.cwd(),
): boolean {
  return existsSync(getProviderProfilePath(cwd))
}

export function loadPersistedProviderProfile(
  cwd: string = process.cwd(),
): ProfileFile | null {
  const profilePath = getProviderProfilePath(cwd)
  if (!existsSync(profilePath)) {
    return null
  }

  try {
    const parsed = JSON.parse(readFileSync(profilePath, 'utf8')) as ProfileFile
    if (!SUPPORTED_PROFILE_TYPES.has(parsed.profile) || !parsed.env) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function assignEnvValue(
  processEnv: NodeJS.ProcessEnv,
  key: keyof ProfileEnv,
  value: string | undefined,
): void {
  if (value) {
    processEnv[key] = value
    return
  }

  delete processEnv[key]
}

function clearProfileEnvKeys(
  processEnv: NodeJS.ProcessEnv,
  keys: ReadonlyArray<keyof ProfileEnv>,
): void {
  for (const key of keys) {
    delete processEnv[key]
  }
}

export function applyProviderProfileToProcessEnv(
  profile: ProfileFile,
  processEnv: NodeJS.ProcessEnv = process.env,
): void {
  clearProfileEnvKeys(processEnv, OPENAI_PROFILE_KEYS)
  clearProfileEnvKeys(processEnv, GEMINI_PROFILE_KEYS)

  if (profile.profile === 'gemini') {
    delete processEnv.CLAUDE_CODE_USE_OPENAI
    processEnv.CLAUDE_CODE_USE_GEMINI = '1'

    for (const key of GEMINI_PROFILE_KEYS) {
      assignEnvValue(processEnv, key, profile.env[key])
    }
    return
  }

  delete processEnv.CLAUDE_CODE_USE_GEMINI
  processEnv.CLAUDE_CODE_USE_OPENAI = '1'

  for (const key of OPENAI_PROFILE_KEYS) {
    assignEnvValue(processEnv, key, profile.env[key])
  }
}

export function shouldLoadProviderProfileFromDisk(
  processEnv: NodeJS.ProcessEnv = process.env,
): boolean {
  if (processEnv.ANTHROPIC_API_KEY) {
    return false
  }

  return !(
    isEnvTruthy(processEnv.CLAUDE_CODE_USE_OPENAI) ||
    isEnvTruthy(processEnv.CLAUDE_CODE_USE_GEMINI) ||
    isEnvTruthy(processEnv.CLAUDE_CODE_USE_BEDROCK) ||
    isEnvTruthy(processEnv.CLAUDE_CODE_USE_VERTEX) ||
    isEnvTruthy(processEnv.CLAUDE_CODE_USE_FOUNDRY)
  )
}

export function loadProviderProfileIntoProcessEnvIfNeeded(
  cwd: string = process.cwd(),
  processEnv: NodeJS.ProcessEnv = process.env,
): ProfileFile | null {
  if (!shouldLoadProviderProfileFromDisk(processEnv)) {
    return null
  }

  const profile = loadPersistedProviderProfile(cwd)
  if (!profile) {
    return null
  }

  applyProviderProfileToProcessEnv(profile, processEnv)
  return profile
}

export function saveOpenAIProviderProfile(
  env: ProfileEnv,
  cwd: string = process.cwd(),
): ProfileFile {
  const profile = createProfileFile('openai', env)
  writeFileSync(
    getProviderProfilePath(cwd),
    JSON.stringify(profile, null, 2),
    'utf8',
  )
  return profile
}
