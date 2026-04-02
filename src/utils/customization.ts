/**
 * Main customization module that loads all customizations
 */

import { loadCustomTheme, hasCustomTheme, getEffectiveThemeName } from './customTheme.js'
import { loadUICustomization, getUIConfigValue } from './uiCustomization.js'
import type { ThemeName, Theme } from './theme.js'
import type { UICustomizationConfig } from './uiCustomization.js'

export interface CustomizationState {
  theme: {
    name: ThemeName
    isCustom: boolean
    config: ReturnType<typeof loadCustomTheme>
  }
  ui: UICustomizationConfig
}

/**
 * Load all customizations
 */
export function loadAllCustomizations(baseThemeName: ThemeName): CustomizationState {
  return {
    theme: {
      name: getEffectiveThemeName(baseThemeName),
      isCustom: hasCustomTheme(),
      config: loadCustomTheme(),
    },
    ui: loadUICustomization(),
  }
}

/**
 * Check if any customizations are active
 */
export function hasCustomizations(): boolean {
  return hasCustomTheme() || hasUICustomization()
}

/**
 * Check if UI customization file exists
 */
export function hasUICustomization(): boolean {
  try {
    const { existsSync } = require('fs')
    const { getUICustomizationPath } = require('./uiCustomization.js')
    return existsSync(getUICustomizationPath())
  } catch {
    return false
  }
}

/**
 * Get customization summary for display
 */
export function getCustomizationSummary(): string[] {
  const summary: string[] = []
  
  if (hasCustomTheme()) {
    const themeConfig = loadCustomTheme()
    if (themeConfig) {
      const colorCount = Object.keys(themeConfig.colors || {}).length
      summary.push(`Custom theme: ${colorCount} color overrides`)
    }
  }
  
  if (hasUICustomization()) {
    const uiConfig = loadUICustomization()
    const options: string[] = []
    
    if (uiConfig.disableShimmer) options.push('shimmer disabled')
    if (uiConfig.messages?.showTimestamp) options.push('timestamps')
    if (uiConfig.messages?.showTokenCount) options.push('token counts')
    if (uiConfig.input?.vimModeDefault) options.push('vim mode')
    if (uiConfig.performance?.reduceAnimations) options.push('reduced animations')
    
    if (options.length > 0) {
      summary.push(`UI customization: ${options.join(', ')}`)
    }
  }
  
  return summary
}

// Re-export for convenience
export { loadCustomTheme, hasCustomTheme } from './customTheme.js'
export { loadUICustomization, getUIConfigValue } from './uiCustomization.js'
