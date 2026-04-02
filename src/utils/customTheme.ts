import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

/**
 * Get the project root directory
 */
function getProjectRoot(): string {
  // For ES modules, get the directory of the current file
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  // Go up from src/utils to project root
  return join(__dirname, '..', '..')
}

/**
 * Custom theme configuration file path
 * Config files are stored in the project's config/ directory
 */
export function getCustomThemePath(): string {
  return join(getProjectRoot(), 'config', 'custom-theme.json')
}

/**
 * Custom theme JSON structure
 * Users can override any color from the base theme
 */
export interface CustomThemeConfig {
  /** Base theme to extend from (default: 'dark') */
  extends?: ThemeName
  /** Color overrides - any Theme property */
  colors?: Partial<Theme>
}

/**
 * Load custom theme from config file
 * Returns null if no custom theme exists or on error
 */
export function loadCustomTheme(): CustomThemeConfig | null {
  try {
    const themePath = getCustomThemePath()
    if (!existsSync(themePath)) {
      return null
    }
    const content = readFileSync(themePath, 'utf-8')
    const config = JSON.parse(content) as CustomThemeConfig
    return config
  } catch {
    return null
  }
}

/**
 * Apply custom theme overrides to a base theme
 */
export function applyCustomTheme(baseThemeName: ThemeName): Theme {
  const customConfig = loadCustomTheme()
  if (!customConfig) {
    return getTheme(baseThemeName)
  }

  const baseTheme = getTheme(customConfig.extends || baseThemeName)
  
  if (!customConfig.colors) {
    return baseTheme
  }

  // Merge custom colors with base theme
  return {
    ...baseTheme,
    ...customConfig.colors,
  }
}

/**
 * Check if a custom theme is configured
 */
export function hasCustomTheme(): boolean {
  return loadCustomTheme() !== null
}

/**
 * Get the effective theme name (considering custom theme's extends)
 */
export function getEffectiveThemeName(baseThemeName: ThemeName): ThemeName {
  const customConfig = loadCustomTheme()
  if (!customConfig) {
    return baseThemeName
  }
  return customConfig.extends || baseThemeName
}
