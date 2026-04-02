#!/usr/bin/env node
/**
 * PointCode 快速启动入口
 * 用法: bun run pointcode [args...]
 * 
 * 首次使用: 显示模型选择，保存配置到 .openclaude-profile.json
 * 后续使用: 读取配置直接启动
 * 
 * 设置 OPENCLAUDE_MODEL 环境变量可跳过选择:
 *   OPENCLAUDE_MODEL=deepseek-chat bun run pointcode
 */

import { spawn } from 'node:child_process'
import * as readline from 'node:readline'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PROFILE_PATH = resolve(process.cwd(), '.openclaude-profile.json')

interface ModelOption {
  id: string
  name: string
  provider: string
  baseUrl: string
  requiresKey: boolean
}

const MODELS: ModelOption[] = [
  { id: 'deepseek-chat', name: 'DeepSeek-V3.2 (Chat)', provider: 'deepseek', baseUrl: 'https://api.deepseek.com', requiresKey: true },
  { id: 'deepseek-reasoner', name: 'DeepSeek-V3.2 (Reasoner)', provider: 'deepseek', baseUrl: 'https://api.deepseek.com', requiresKey: true },
  { id: 'qwen3.5-plus', name: 'Qwen3.5 Plus', provider: 'dashscope', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', requiresKey: true },
  { id: 'qwen3.5-flash', name: 'Qwen3.5 Flash', provider: 'dashscope', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', requiresKey: true },
  { id: 'glm-5', name: 'GLM-5', provider: 'zhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4/', requiresKey: true },
  { id: 'mimo-v2-pro', name: 'MiMo-V2 Pro', provider: 'mimo', baseUrl: 'https://api.xiaomimimo.com/v1', requiresKey: true },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', baseUrl: 'https://api.openai.com/v1', requiresKey: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', baseUrl: 'https://api.openai.com/v1', requiresKey: true },
  { id: 'llama3.1:8b', name: 'Llama 3.1 8B (本地)', provider: 'ollama', baseUrl: 'http://localhost:11434/v1', requiresKey: false },
  { id: 'qwen2.5-coder:7b', name: 'Qwen2.5 Coder 7B (本地)', provider: 'ollama', baseUrl: 'http://localhost:11434/v1', requiresKey: false },
]

function loadProfile(): Record<string, any> | null {
  try {
    if (existsSync(PROFILE_PATH)) {
      return JSON.parse(readFileSync(PROFILE_PATH, 'utf8'))
    }
  } catch {}
  return null
}

function saveProfile(model: ModelOption, apiKey: string | null): void {
  const env: Record<string, string> = {
    CLAUDE_CODE_USE_OPENAI: '1',
    OPENAI_BASE_URL: model.baseUrl,
    OPENAI_MODEL: model.id,
  }
  if (apiKey) {
    env.OPENAI_API_KEY = apiKey
  }
  const profile = { profile: 'openai', env, createdAt: new Date().toISOString() }
  writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf8')
}

function ask(rl: readline.Interface, q: string): Promise<string> {
  return new Promise(resolve => rl.question(q, resolve))
}

async function selectModel(rl: readline.Interface): Promise<ModelOption> {
  console.log('')
  console.log('  ╔══════════════════════════════════════════════╗')
  console.log('  ║         PointCode - 选择 AI 模型             ║')
  console.log('  ╚══════════════════════════════════════════════╝')
  console.log('')
  console.log('  [云端模型]')
  MODELS.filter(m => m.provider !== 'ollama').forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.name} (${m.provider})`)
  })
  console.log('')
  console.log('  [本地模型 - Ollama]')
  const cloudCount = MODELS.filter(m => m.provider !== 'ollama').length
  MODELS.filter(m => m.provider === 'ollama').forEach((m, i) => {
    console.log(`  ${cloudCount + i + 1}. ${m.name}`)
  })
  console.log('')
  const choice = await ask(rl, `  选择 (1-${MODELS.length}) [1]: `)
  const idx = parseInt(choice || '1', 10) - 1
  return MODELS[idx] || MODELS[0]!
}

async function getApiKey(rl: readline.Interface, model: ModelOption): Promise<string | null> {
  if (!model.requiresKey) return null
  console.log('')
  const key = await ask(rl, `  ${model.provider} API Key: `)
  if (!key.trim()) {
    console.error('  ✗ API Key 不能为空')
    process.exit(1)
  }
  return key.trim()
}

async function launch(args: string[]): Promise<void> {
  const distPath = resolve(process.cwd(), 'dist', 'cli.mjs')
  if (!existsSync(distPath)) {
    console.log('  构建中...')
    await runCmd('bun run build')
  }
  console.log('  启动 PointCode...\n')
  const child = spawn('node', [distPath, ...args], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  child.on('close', code => process.exit(code ?? 0))
}

function runCmd(cmd: string): Promise<number> {
  return new Promise(resolve => {
    const c = spawn(cmd, { cwd: process.cwd(), stdio: 'inherit', shell: true })
    c.on('close', code => resolve(code ?? 1))
  })
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  // 环境变量直接指定模型
  const envModel = process.env.OPENCLAUDE_MODEL
  if (envModel) {
    const model = MODELS.find(m => m.id === envModel)
    if (model) {
      if (model.requiresKey && !process.env.OPENAI_API_KEY) {
        console.error(`OPENAI_API_KEY required for ${envModel}`)
        process.exit(1)
      }
      process.env.CLAUDE_CODE_USE_OPENAI = '1'
      process.env.OPENAI_BASE_URL = model.baseUrl
      process.env.OPENAI_MODEL = model.id
      await launch(args)
      return
    }
  }

  // 已有配置文件，直接启动
  const profile = loadProfile()
  if (profile?.env) {
    Object.assign(process.env, profile.env)
    await launch(args)
    return
  }

  // 首次使用，选择模型
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const model = await selectModel(rl)
    const apiKey = await getApiKey(rl, model)
    saveProfile(model, apiKey)
    console.log(`\n  ✓ 已选择: ${model.name}\n`)
    rl.close()
    Object.assign(process.env, {
      CLAUDE_CODE_USE_OPENAI: '1',
      OPENAI_BASE_URL: model.baseUrl,
      OPENAI_MODEL: model.id,
      ...(apiKey ? { OPENAI_API_KEY: apiKey } : {}),
    })
    await launch(args)
  } catch (e) {
    rl.close()
    process.exit(1)
  }
}

await main()
