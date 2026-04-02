/**
 * Generate a sample UI customization configuration file
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get the project root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

const sampleConfig = {
  "$schema": "OpenClaude UI Customization Configuration",
  "disableShimmer": false,
  "spinnerChars": ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  "spinnerInterval": 80,
  "messages": {
    "showTimestamp": false,
    "showTokenCount": false,
    "maxHeight": 50,
    "wordWrap": true
  },
  "input": {
    "showLineNumbers": false,
    "tabSize": 2,
    "vimModeDefault": false
  },
  "statusLine": {
    "showModel": true,
    "showCost": true,
    "showTokens": true,
    "showGitBranch": true,
    "position": "bottom"
  },
  "diff": {
    "showLineNumbers": true,
    "contextLines": 3,
    "syntaxHighlight": true
  },
  "dialogs": {
    "animationSpeed": "normal",
    "showBorders": true,
    "borderStyle": "round"
  },
  "performance": {
    "fpsLimit": 60,
    "gpuAcceleration": false,
    "reduceAnimations": false
  },
  "_documentation": {
    "description": "UI customization configuration for OpenClaude CLI",
    "instructions": [
      "1. Edit any value to customize the UI behavior",
      "2. Save this file and restart OpenClaude to see changes",
      "3. Set values to null to use defaults"
    ],
    "options": {
      "disableShimmer": "Set to true to disable shimmer effects (reduces CPU usage)",
      "spinnerChars": "Array of characters for loading spinner animation",
      "spinnerInterval": "Milliseconds between spinner frames",
      "messages.showTimestamp": "Show timestamp on each message",
      "messages.showTokenCount": "Show token count on messages",
      "messages.maxHeight": "Maximum height for a single message (lines)",
      "messages.wordWrap": "Wrap long lines in messages",
      "input.showLineNumbers": "Show line numbers in input area",
      "input.tabSize": "Number of spaces per tab",
      "input.vimModeDefault": "Enable vim mode by default",
      "statusLine.showModel": "Show model name in status line",
      "statusLine.showCost": "Show session cost in status line",
      "statusLine.showTokens": "Show token usage in status line",
      "statusLine.showGitBranch": "Show git branch in status line",
      "statusLine.position": "Position of status line: 'top' or 'bottom'",
      "diff.showLineNumbers": "Show line numbers in diff view",
      "diff.contextLines": "Number of context lines around changes",
      "diff.syntaxHighlight": "Enable syntax highlighting in diffs",
      "dialogs.animationSpeed": "Dialog animation speed: 'slow', 'normal', 'fast'",
      "dialogs.showBorders": "Show borders around dialogs",
      "dialogs.borderStyle": "Border style: 'single', 'double', 'round', 'bold'",
      "performance.fpsLimit": "Maximum FPS (0 = unlimited)",
      "performance.gpuAcceleration": "Enable GPU acceleration if available",
      "performance.reduceAnimations": "Reduce animations for better performance"
    }
  }
}

export function generateSampleUICustomization(): void {
  const configDir = join(PROJECT_ROOT, 'config')
  const configPath = join(configDir, 'ui-customization.json')

  // Create directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  // Don't overwrite existing file
  if (existsSync(configPath)) {
    console.log(`UI customization already exists at: ${configPath}`)
    console.log('Delete it first if you want to regenerate the sample.')
    return
  }

  writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2), 'utf-8')
  console.log(`✓ Sample UI customization created at: ${configPath}`)
  console.log('\nEdit this file to customize your CLI UI behavior.')
  console.log('Restart PointCode after making changes.')
}

// Run if called directly
if (require.main === module) {
  generateSampleUICustomization()
}
