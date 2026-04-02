/**
 * PointCode UI Demo - Shows the UI without requiring API calls
 */

import React from 'react'
import inkRender from './ink/root.js'
import Box from './ink/components/Box.js'
import Text from './ink/components/Text.js'

function DemoApp() {
  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold color="cyan">
          ╔══════════════════════════════════════════╗
        </Text>
        <Text bold color="cyan">
          ║     PointCode - AI编程助手               ║
        </Text>
        <Text bold color="cyan">
          ║     可自定义UI的CLI工具                  ║
        </Text>
        <Text bold color="cyan">
          ╚══════════════════════════════════════════╝
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="green">
          ✓ UI自定义系统已启用
        </Text>
        <Text color="gray">
          配置文件: ./config/custom-theme.json
        </Text>
        <Text color="gray">
          UI配置: ./config/ui-customization.json
        </Text>
      </Box>

      <Box borderStyle="single" borderColor="yellow" padding={1} marginBottom={1}>
        <Text bold color="yellow">
          主题示例:
        </Text>
        <Box flexDirection="column" paddingLeft={2}>
          <Text>
            <Text color="red">●</Text> 红色{' '}
            <Text color="green">●</Text> 绿色{' '}
            <Text color="blue">●</Text> 蓝色{' '}
            <Text color="yellow">●</Text> 黄色{' '}
            <Text color="magenta">●</Text> 紫色{' '}
            <Text color="cyan">●</Text> 青色
          </Text>
        </Box>
      </Box>

      <Box borderStyle="round" borderColor="green" padding={1} marginBottom={1}>
        <Text bold color="green">
          命令示例:
        </Text>
        <Box flexDirection="column" paddingLeft={2}>
          <Text color="white">bun run theme:generate</Text>
          <Text color="gray">  生成主题配置文件</Text>
          <Text color="white">bun run ui:generate</Text>
          <Text color="gray">  生成UI配置文件</Text>
          <Text color="white">bun run dev</Text>
          <Text color="gray">  运行PointCode</Text>
        </Box>
      </Box>

      <Box borderStyle="single" borderColor="blue" padding={1}>
        <Text bold color="blue">
          支持的模型:
        </Text>
        <Box flexDirection="column" paddingLeft={2}>
          <Text color="white">• DeepSeek (deepseek-chat, deepseek-reasoner)</Text>
          <Text color="white">• 通义千问 (qwen3.5-plus, qwen3.5-flash)</Text>
          <Text color="white">• 智谱GLM (glm-5, glm-5-turbo)</Text>
          <Text color="white">• 小米MiMo (mimo-v2-pro, mimo-v2-flash)</Text>
          <Text color="white">• Ollama本地模型</Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">
          按 Ctrl+C 退出
        </Text>
      </Box>
    </Box>
  )
}

// Run the demo
inkRender(<DemoApp />)

// Handle cleanup
process.on('SIGINT', () => {
  process.exit(0)
})
