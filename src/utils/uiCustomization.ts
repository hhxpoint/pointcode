import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

/**
 * Get the project root directory
 */
function getProjectRoot(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return join(__dirname, '..', '..')
}

/**
 * Get UI customization config file path
 * Config files are stored in the project's config/ directory
 */
export function getUICustomizationPath(): string {
  return join(getProjectRoot(), 'config', 'ui-customization.json')
}
  /** Input area options */
  input?: {
    /** Show line numbers */
    showLineNumbers?: boolean
    /** Tab size for indentation */
    tabSize?: number
    /** Vim mode enabled by default */
    vimModeDefault?: boolean
  }
  /** Status line options */
  statusLine?: {
    /** Show model name */
    showModel?: boolean
    /** Show session cost */
    showCost?: boolean
    /** Show token usage */
    showTokens?: boolean
    /** Show git branch */
    showGitBranch?: boolean
    /** Position: 'top' or 'bottom' */
    position?: 'top' | 'bottom'
  }
  /** Diff display options */
  diff?: {
    /** Show line numbers in diffs */
    showLineNumbers?: boolean
    /** Context lines around changes */
    contextLines?: number
    /** Syntax highlighting */
    syntaxHighlight?: boolean
  }
  /** Dialog options */
  dialogs?: {
    /** Animation speed: 'slow', 'normal', 'fast' */
    animationSpeed?: 'slow' | 'normal' | 'fast'
    /** Show borders */
    showBorders?: boolean
    /** Border style */
    borderStyle?: 'single' | 'double' | 'round' | 'bold'
  }
  /** Performance options */
  performance?: {
    /** FPS limit (0 = unlimited) */
    fpsLimit?: number
    /** Enable GPU acceleration if available */
    gpuAcceleration?: boolean
    /** Reduce animations */
    reduceAnimations?: boolean
  }
}

const defaultConfig: UICustomizationConfig = {
  disableShimmer: false,
  spinnerChars: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  spinnerInterval: 80,
  messages: {
    showTimestamp: false,
    showTokenCount: false,
    maxHeight: 50,
    wordWrap: true,
  },
  input: {
    showLineNumbers: false,
    tabSize: 2,
    vimModeDefault: false,
  },
  statusLine: {
    showModel: true,
    showCost: true,
    showTokens: true,
    showGitBranch: true,
    position: 'bottom',
  },
  diff: {
    showLineNumbers: true,
    contextLines: 3,
    syntaxHighlight: true,
  },
  dialogs: {
    animationSpeed: 'normal',
    showBorders: true,
    borderStyle: 'round',
  },
  performance: {
    fpsLimit: 60,
    gpuAcceleration: false,
    reduceAnimations: false,
  },
}

/**
 * Get UI customization config file path
 */
export function getUICustomizationPath(): string {
  return join(getGlobalClaudeFile(), 'ui-customization.json')
}

/**
 * Load UI customization configuration
 */
export function loadUICustomization(): UICustomizationConfig {
  try {
    const configPath = getUICustomizationPath()
    if (!existsSync(configPath)) {
      return defaultConfig
    }
    const content = readFileSync(configPath, 'utf-8')
    const userConfig = JSON.parse(content) as Partial<UICustomizationConfig>
    
    // Deep merge with defaults
    return deepMerge(defaultConfig, userConfig) as UICustomizationConfig
  } catch {
    return defaultConfig
  }
}

/**
 * Get a specific config value
 */
export function getUIConfigValue<K extends keyof UICustomizationConfig>(
  key: K
): UICustomizationConfig[K] {
  const config = loadUICustomization()
  return config[key] ?? defaultConfig[key]
}

/**
 * Deep merge two objects
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) {
      continue
    }
    
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  
  return result
}

/**
 * Generate sample UI customization file
 */
export function generateSampleUICustomization(): UICustomizationConfig {
  return {
    disableShimmer: false,
    spinnerChars: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    spinnerInterval: 80,
    messages: {
      showTimestamp: true,
      showTokenCount: true,
      maxHeight: 100,
      wordWrap: true,
    },
    input: {
      showLineNumbers: false,
      tabSize: 4,
      vimModeDefault: false,
    },
    statusLine: {
      showModel: true,
      showCost: true,
      showTokens: true,
      showGitBranch: true,
      position: 'bottom',
    },
    diff: {
      showLineNumbers: true,
      contextLines: 5,
      syntaxHighlight: true,
    },
    dialogs: {
      animationSpeed: 'normal',
      showBorders: true,
      borderStyle: 'round',
    },
    performance: {
      fpsLimit: 30,
      gpuAcceleration: false,
      reduceAnimations: false,
    },
  }
}
