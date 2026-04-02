/**
 * Test script for customization system
 */

import { loadAllCustomizations, hasCustomizations, getCustomizationSummary } from './utils/customization.js'
import { applyCustomTheme, hasCustomTheme } from './utils/customTheme.js'
import { loadUICustomization } from './utils/uiCustomization.js'

console.log('Testing OpenClaude Customization System\n')

// Test 1: Check if custom theme is loaded
console.log('1. Custom Theme Test')
const hasTheme = hasCustomTheme()
console.log(`   Custom theme active: ${hasTheme}`)

if (hasTheme) {
  const theme = applyCustomTheme('dark')
  console.log(`   Claude color: ${theme.claude}`)
  console.log(`   Text color: ${theme.text}`)
}

// Test 2: Check UI customization
console.log('\n2. UI Customization Test')
const uiConfig = loadUICustomization()
console.log(`   Shimmer disabled: ${uiConfig.disableShimmer}`)
console.log(`   Show timestamps: ${uiConfig.messages?.showTimestamp}`)
console.log(`   Show token count: ${uiConfig.messages?.showTokenCount}`)
console.log(`   FPS limit: ${uiConfig.performance?.fpsLimit}`)

// Test 3: Check overall customization state
console.log('\n3. Overall Customization State')
const hasAny = hasCustomizations()
console.log(`   Any customizations active: ${hasAny}`)

const summary = getCustomizationSummary()
if (summary.length > 0) {
  console.log('   Summary:')
  summary.forEach(s => console.log(`     - ${s}`))
} else {
  console.log('   No customizations active')
}

// Test 4: Load all customizations
console.log('\n4. Full Customization State')
const state = loadAllCustomizations('dark')
console.log(`   Theme name: ${state.theme.name}`)
console.log(`   Theme is custom: ${state.theme.isCustom}`)
console.log(`   UI config keys: ${Object.keys(state.ui).join(', ')}`)

console.log('\n✓ All tests completed')
