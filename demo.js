#!/usr/bin/env node

/**
 * PointCode UI Demo Runner
 */

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Import and run the demo
await import(join(__dirname, 'src', 'demo-ui.tsx'))
