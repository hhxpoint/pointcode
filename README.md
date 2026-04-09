<div align="center">

# 🚀 PointCode

**下一代 AI 编程助手 CLI 工具**

[![npm version](https://img.shields.io/npm/v/pointcode.svg?style=flat-square)](https://www.npmjs.com/package/pointcode)
[![npm downloads](https://img.shields.io/npm/dm/pointcode.svg?style=flat-square)](https://www.npmjs.com/package/pointcode)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/bun-1.3.11-fbf8ec.svg?style=flat-square&logo=bun)](https://bun.sh/)

⚡ 一行命令安装 · 🎨 完全可定制 · 🤖 多模型支持

</div>

---

## 📦 一键安装

> **前提条件**: 需要安装 Node.js v20.0.0 或更高版本

### 🌐 全球用户（推荐）

```bash
npm install -g pointcode
```

### 🐧 Linux / macOS

```bash
curl -fsSL https://raw.githubusercontent.com/hhxpoint/pointcode/main/scripts/install.sh | bash
```

### 🪟 Windows PowerShell

```powershell
iwr https://raw.githubusercontent.com/hhxpoint/pointcode/main/scripts/install.ps1 -useb | iex
```

### 🎯 免安装体验

```bash
npx pointcode
```

---

## 🎯 快速开始

安装完成后，直接运行：

```bash
pointcode
```

### 首次使用配置

```bash
# 配置 API 密钥
/model key sk-your-api-key

# 选择模型
/model
```

---

## 🌟 特性亮点

<div align="center">

| 🎨 自定义 UI | 🤖 多模型支持 | ⚡ 高性能 |
|:---:|:---:|:---:|
| 完全可定制的主题和界面 | 支持 DeepSeek、通义千问、智谱 GLM 等 | 基于 Bun 构建，启动速度快 |

| 🔒 安全可靠 | 📦 开箱即用 | 🌍 全球部署 |
|:---:|:---:|:---:|
| 权限控制，安全沙箱 | 一行命令安装，零配置启动 | npm 全球 CDN 分发 |

</div>

---

## 📊 系统要求

| 组件 | 最低版本 | 推荐版本 |
|------|---------|---------|
| **Node.js** | v20.0.0 | v22.x LTS |
| **npm** | v10.0.0 | v10.8.2+ |
| **Bun** (开发) | v1.0.0 | v1.3.11+ |
| **操作系统** | Windows 10 / macOS 10.15+ / Linux | 任意现代系统 |

### 检查环境

```bash
# 检查 Node.js 版本
node -v  # 应 >= v20.0.0

# 检查 npm 版本
npm -v

# 检查 Bun (可选，仅开发需要)
bun -v
```

---

## 🤖 支持的 AI 模型

### 国产大模型

| 服务商 | 模型 | 描述 | 状态 |
|--------|------|------|------|
| **DeepSeek** | `deepseek-chat` | 通用对话 | ✅ |
| **DeepSeek** | `deepseek-reasoner` | 推理增强 | ✅ |
| **通义千问** | `qwen3.5-plus` | 高性能 | ✅ |
| **通义千问** | `qwen3.5-flash` | 快速响应 | ✅ |
| **智谱 GLM** | `glm-5` | 通用模型 | ✅ |
| **智谱 GLM** | `glm-5-turbo` | 快速版本 | ✅ |
| **小米 MiMo** | `mimo-v2-pro` | 专业版 | ✅ |
| **小米 MiMo** | `mimo-v2-flash` | 快速版 | ✅ |
| **OpenRouter** | `google/gemma-4-31b-it:free` | Gemma 4 31B 免费模型 | ✅ |

### 本地模型 (Ollama)

```bash
# 使用 Ollama 本地模型
CLAUDE_CODE_USE_OPENAI=1 OPENAI_BASE_URL=http://localhost:11434/v1 OPENAI_MODEL=qwen2.5:7b pointcode
```

支持模型：
- `qwen2.5:7b` - 代码能力强
- `llama3.2:3b` - 轻量快速
- `codellama:7b` - 专用代码模型

### OpenRouter (Gemma)

```bash
# 方式 1：直接环境变量启动
CLAUDE_CODE_USE_OPENAI=1 OPENAI_BASE_URL=https://openrouter.ai/api/v1 OPENAI_MODEL=google/gemma-4-31b-it:free OPENAI_API_KEY=sk-or-... pointcode

# 方式 2：使用内置脚本
OPENAI_API_KEY=sk-or-... bun run dev:openrouter
```

也可以在应用内使用 provider 命令：

```bash
/provider key openrouter <your-openrouter-key>
/provider set openrouter
/model
```

---

## 🎨 主题定制

### 快速切换主题

```bash
# 生成主题配置
bun run theme:generate

# 查看主题文件位置
bun run theme:open
```

### 示例主题

**🌃 赛博朋克**
```json
{
  "extends": "dark",
  "colors": {
    "claude": "rgb(255, 0, 128)",
    "text": "rgb(0, 255, 255)",
    "success": "rgb(0, 255, 128)",
    "error": "rgb(255, 0, 64)"
  }
}
```

**🌲 森林**
```json
{
  "extends": "dark",
  "colors": {
    "claude": "rgb(139, 195, 74)",
    "text": "rgb(200, 230, 200)"
  }
}
```

**🌊 海洋**
```json
{
  "extends": "dark",
  "colors": {
    "claude": "rgb(33, 150, 243)",
    "text": "rgb(227, 242, 253)"
  }
}
```

---

## 🛠️ 开发指南

### 克隆项目

```bash
git clone https://github.com/hhxpoint/pointcode.git
cd pointcode
```

### 安装依赖

```bash
bun install
```

### 构建项目

```bash
bun run build
```

### 开发模式

```bash
# 标准开发
bun run dev

# 快速模式 (Ollama + 轻量模型)
bun run dev:fast

# 使用特定模型
bun run dev:deepseek    # DeepSeek
bun run dev:dashscope   # 通义千问
bun run dev:zhipu       # 智谱 GLM
bun run dev:ollama      # Ollama 本地
```

---

## 📁 项目结构

```
pointcode/
├── 📦 bin/                     # CLI 入口
│   └── pointcode
├── 📦 dist/                    # 构建输出
│   └── cli.mjs
├── 📁 config/                  # 配置文件
│   ├── custom-theme.json       # 主题配置
│   └── ui-customization.json   # UI 配置
├── 📁 scripts/                 # 构建/安装脚本
│   ├── build.ts
│   ├── install.sh              # Linux/Mac 安装脚本
│   └── install.ps1             # Windows 安装脚本
├── 📁 src/                     # 源代码
│   ├── components/             # UI 组件
│   ├── screens/                # 页面组件
│   ├── ink/                    # Ink 渲染器
│   └── utils/                  # 工具函数
├── 📄 package.json
├── 📄 README.md
└── 📄 DEPLOYMENT.md            # 部署文档
```

---

## 🔧 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `CLAUDE_CODE_USE_OPENAI` | 启用 OpenAI 兼容模式 | `1` |
| `OPENAI_BASE_URL` | API 基础 URL | `https://api.deepseek.com` |
| `OPENAI_MODEL` | 模型名称 | `deepseek-chat` |
| `OPENAI_API_KEY` | API 密钥 | `sk-xxx` |

---

## 📝 常用命令

| 命令 | 说明 |
|------|------|
| `npm install -g pointcode` | 全局安装 |
| `pointcode` | 启动 PointCode |
| `npx pointcode` | 免安装运行 |
| `bun run build` | 构建项目 |
| `bun run dev` | 开发模式 |
| `bun run theme:generate` | 生成主题配置 |
| `bun run ui:generate` | 生成 UI 配置 |

---

## ❓ 常见问题

### 安装失败

**问题**: `npm install -g pointcode` 失败

**解决**:
```bash
# Linux/Mac 可能需要 sudo
sudo npm install -g pointcode

# 或者修改 npm 全局目录权限
sudo chown -R $(whoami) $(npm config get prefix)
```

### 命令不存在

**问题**: 安装后 `pointcode` 命令找不到

**解决**:
```bash
# 检查 npm 全局目录是否在 PATH 中
echo $(npm config get prefix)/bin

# Linux/Mac 添加到 PATH
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 模型配置

**问题**: 如何切换模型

**解决**:
```bash
# 在 PointCode 内部
/model key sk-your-key
/model
```

---

## 🔗 相关链接

- [GitHub 仓库](https://github.com/hhxpoint/pointcode)
- [npm 包页面](https://www.npmjs.com/package/pointcode)
- [作者主页](https://github.com/hhxpoint)
- [部署文档](DEPLOYMENT.md)

---

## 📄 许可证

MIT License © 2026 [hhxpoint](https://github.com/hhxpoint)

---

<div align="center">

**👏 感谢使用 PointCode!**

[开始使用](#-快速开始) · [报告问题](https://github.com/hhxpoint/pointcode/issues) · [提出建议](https://github.com/hhxpoint/pointcode/discussions)

</div>
