/**
 * Generate a sample custom theme configuration file
 * This script creates a template custom-theme.json file that users can modify
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get the project root directory (scripts/ is one level down from root)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

const sampleTheme = {
  "$schema": "OpenClaude Custom Theme Configuration",
  "extends": "dark",
  "colors": {
    "autoAccept": "rgb(175,135,255)",
    "bashBorder": "rgb(253,93,177)",
    "claude": "rgb(215,119,87)",
    "claudeShimmer": "rgb(235,159,127)",
    "permission": "rgb(177,185,249)",
    "permissionShimmer": "rgb(207,215,255)",
    "planMode": "rgb(72,150,140)",
    "ide": "rgb(71,130,200)",
    "promptBorder": "rgb(136,136,136)",
    "promptBorderShimmer": "rgb(166,166,166)",
    "text": "rgb(255,255,255)",
    "inverseText": "rgb(0,0,0)",
    "inactive": "rgb(153,153,153)",
    "inactiveShimmer": "rgb(193,193,193)",
    "subtle": "rgb(80,80,80)",
    "suggestion": "rgb(177,185,249)",
    "remember": "rgb(177,185,249)",
    "background": "rgb(0,204,204)",
    "success": "rgb(78,186,101)",
    "error": "rgb(255,107,128)",
    "warning": "rgb(255,193,7)",
    "merged": "rgb(175,135,255)",
    "warningShimmer": "rgb(255,223,57)",
    "diffAdded": "rgb(34,92,43)",
    "diffRemoved": "rgb(122,41,54)",
    "diffAddedDimmed": "rgb(71,88,74)",
    "diffRemovedDimmed": "rgb(105,72,77)",
    "diffAddedWord": "rgb(56,166,96)",
    "diffRemovedWord": "rgb(179,89,107)",
    "red_FOR_SUBAGENTS_ONLY": "rgb(220,38,38)",
    "blue_FOR_SUBAGENTS_ONLY": "rgb(37,99,235)",
    "green_FOR_SUBAGENTS_ONLY": "rgb(22,163,74)",
    "yellow_FOR_SUBAGENTS_ONLY": "rgb(202,138,4)",
    "purple_FOR_SUBAGENTS_ONLY": "rgb(147,51,234)",
    "orange_FOR_SUBAGENTS_ONLY": "rgb(234,88,12)",
    "pink_FOR_SUBAGENTS_ONLY": "rgb(219,39,119)",
    "cyan_FOR_SUBAGENTS_ONLY": "rgb(8,145,178)",
    "professionalBlue": "rgb(106,155,204)",
    "chromeYellow": "rgb(251,188,4)",
    "fastMode": "rgb(255,120,20)",
    "fastModeShimmer": "rgb(255,165,70)",
    "briefLabelYou": "rgb(122,180,232)",
    "briefLabelClaude": "rgb(215,119,87)",
    "userMessageBackground": "rgb(55, 55, 55)",
    "userMessageBackgroundHover": "rgb(70, 70, 70)",
    "messageActionsBackground": "rgb(44, 50, 62)",
    "selectionBg": "rgb(38, 79, 120)",
    "bashMessageBackgroundColor": "rgb(65, 60, 65)",
    "memoryBackgroundColor": "rgb(55, 65, 70)",
    "rate_limit_fill": "rgb(177,185,249)",
    "rate_limit_empty": "rgb(80,83,112)"
  },
  "_documentation": {
    "description": "Custom theme configuration for OpenClaude CLI",
    "instructions": [
      "1. Edit any color value using RGB format: rgb(r, g, b)",
      "2. Or use ANSI colors: ansi:red, ansi:blue, etc.",
      "3. Save this file and restart OpenClaude to see changes",
      "4. Set 'extends' to one of: dark, light, dark-ansi, light-ansi, dark-daltonized, light-daltonized"
    ],
    "color_keys": {
      "autoAccept": "Color for auto-accept mode indicator",
      "bashBorder": "Border color for bash/command output",
      "claude": "Main Claude brand color",
      "permission": "Color for permission prompts",
      "planMode": "Color for plan mode indicator",
      "promptBorder": "Border color for input prompt",
      "text": "Main text color",
      "inverseText": "Inverse text color (for highlights)",
      "inactive": "Color for inactive elements",
      "subtle": "Subtle/secondary text color",
      "suggestion": "Color for suggestions",
      "success": "Success message color",
      "error": "Error message color",
      "warning": "Warning message color",
      "diffAdded": "Color for added lines in diffs",
      "diffRemoved": "Color for removed lines in diffs"
    }
  }
}

export function generateSampleTheme(): void {
  const configDir = join(PROJECT_ROOT, 'config')
  const themePath = join(configDir, 'custom-theme.json')

  // Create directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  // Don't overwrite existing file
  if (existsSync(themePath)) {
    console.log(`Custom theme already exists at: ${themePath}`)
    console.log('Delete it first if you want to regenerate the sample.')
    return
  }

  writeFileSync(themePath, JSON.stringify(sampleTheme, null, 2), 'utf-8')
  console.log(`✓ Sample custom theme created at: ${themePath}`)
  console.log('\nEdit this file to customize your CLI colors.')
  console.log('Restart PointCode after making changes.')
}

// Run if called directly
if (require.main === module) {
  generateSampleTheme()
}
