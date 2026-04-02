// @ts-nocheck
/**
 * 国产模型配置向导 / Chinese LLM Provider Setup Wizard
 * Usage: bun run setup:cn
 */
import * as readline from 'node:readline'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getCNProviderList, buildCNProviderEnv, saveProviderKey } from '../src/utils/cnProviders.ts'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve))
}

async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════╗')
  console.log('║     OpenClaude 国产模型配置向导          ║')
  console.log('║     Chinese LLM Provider Setup           ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log('')

  // Step 1: Select provider
  const providers = getCNProviderList()
  console.log('选择 AI 服务商 (Select Provider):')
  console.log('')
  providers.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} ${p.nameEn !== p.name ? `(${p.nameEn})` : ''}`)
  })
  console.log(`  ${providers.length + 1}. Ollama (本地模型)`)
  console.log('')

  const providerChoice = await ask('输入序号 (Enter number): ')
  const providerIndex = parseInt(providerChoice, 10) - 1

  let env: Record<string, string>

  if (providerIndex === providers.length) {
    // Ollama
    const model = await ask('输入模型名称 (Model name, e.g. qwen2.5:72b): ')
    const baseUrl = await ask('Ollama 地址 (Base URL) [http://localhost:11434/v1]: ')
    env = {
      CLAUDE_CODE_USE_OPENAI: '1',
      OPENAI_BASE_URL: baseUrl.trim() || 'http://localhost:11434/v1',
      OPENAI_MODEL: model.trim(),
    }
  } else if (providerIndex >= 0 && providerIndex < providers.length) {
    const preset = providers[providerIndex]

    // Step 2: API Key
    let apiKey = ''
    if (preset.requiresApiKey) {
      console.log('')
      console.log(`获取 API Key: ${preset.docUrl}`)
      apiKey = await ask('输入 API Key: ')
      if (!apiKey.trim()) {
        console.error('错误: API Key 不能为空')
        process.exit(1)
      }
    }

    // Step 3: Select model
    console.log('')
    console.log('选择模型 (Select Model):')
    console.log('')
    preset.models.forEach((m, i) => {
      const tags = []
      if (m.reasoning) tags.push('推理')
      if (m.id === preset.defaultModel) tags.push('推荐')
      const tagStr = tags.length > 0 ? ` [${tags.join(', ')}]` : ''
      console.log(`  ${i + 1}. ${m.name} (${m.id})${tagStr}`)
    })
    console.log('')

    const modelChoice = await ask(`输入序号 (Enter number) [1]: `)
    const modelIndex = parseInt(modelChoice || '1', 10) - 1
    const selectedModel = preset.models[modelIndex] || preset.models[0]

    const result = buildCNProviderEnv(preset.id, {
      model: selectedModel.id,
      apiKey: apiKey.trim(),
    })

    if (!result) {
      console.error('配置失败')
      process.exit(1)
    }

    env = result
    if (preset.requiresApiKey) {
      saveProviderKey(preset.id, apiKey.trim())
    }
  } else {
    console.error('无效选择')
    process.exit(1)
  }

  // Save profile — use 'openai' as profile type and 'profile' as field name
  // to match providerProfile.ts ProfileFile format expected by provider-launch.ts
  const profile = {
    profile: 'openai',
    env,
    createdAt: new Date().toISOString(),
  }

  const outputPath = resolve(process.cwd(), '.openclaude-profile.json')
  writeFileSync(outputPath, JSON.stringify(profile, null, 2), 'utf8')

  console.log('')
  console.log('✓ 配置已保存 (Config saved)')
  console.log(`  文件: ${outputPath}`)
  console.log(`  模型: ${env.OPENAI_MODEL}`)
  console.log(`  地址: ${env.OPENAI_BASE_URL}`)
  console.log('')
  console.log('启动命令 (Start with):')
  console.log('  bun run dev:profile')
  console.log('')

  rl.close()
}

await main()
export {}
