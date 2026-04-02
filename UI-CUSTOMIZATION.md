# PointCode UI 自定义指南

## 配置文件位置

所有配置文件都在项目的 `config/` 目录下：

```
openclaude-cn/
├── config/
│   ├── custom-theme.json    # 主题颜色配置
│   └── ui-customization.json # UI行为配置
├── src/
├── dist/
└── ...
```

## 快速开始

### 1. 安装依赖

```bash
cd openclaude-cn
bun install
```

### 2. 构建项目

```bash
bun run build
```

### 3. 生成配置文件

```bash
# 生成主题配置
bun run theme:generate

# 生成UI配置
bun run ui:generate
```

### 4. 运行PointCode

**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
./start.sh
```

**或使用bun:**
```bash
bun run dev
```

## 主题配置 (config/custom-theme.json)

### 颜色格式

#### RGB格式
```json
"claude": "rgb(215, 119, 87)"
```

#### ANSI颜色名称
```json
"claude": "ansi:red",
"text": "ansi:whiteBright"
```

### 主题继承

```json
{
  "extends": "dark",
  "colors": {
    "claude": "rgb(255, 100, 50)"
  }
}
```

基础主题:
- `dark` - 默认深色主题
- `light` - 浅色主题
- `dark-ansi` - ANSI深色主题
- `light-ansi` - ANSI浅色主题

### 核心颜色属性

| 属性 | 描述 | 默认值 |
|------|------|--------|
| `claude` | 品牌颜色 | `rgb(215,119,87)` |
| `text` | 文本颜色 | `rgb(255,255,255)` |
| `success` | 成功消息 | `rgb(78,186,101)` |
| `error` | 错误消息 | `rgb(255,107,128)` |
| `warning` | 警告消息 | `rgb(255,193,7)` |

## UI配置 (config/ui-customization.json)

### 消息显示选项

```json
{
  "messages": {
    "showTimestamp": true,
    "showTokenCount": true,
    "maxHeight": 50,
    "wordWrap": true
  }
}
```

### 状态栏选项

```json
{
  "statusLine": {
    "showModel": true,
    "showCost": true,
    "showTokens": true,
    "showGitBranch": true,
    "position": "bottom"
  }
}
```

### 性能选项

```json
{
  "performance": {
    "fpsLimit": 60,
    "reduceAnimations": false
  }
}
```

## 示例主题

### 赛博朋克主题

```json
{
  "extends": "dark",
  "colors": {
    "claude": "rgb(255, 0, 128)",
    "text": "rgb(0, 255, 255)",
    "success": "rgb(0, 255, 128)",
    "error": "rgb(255, 0, 64)",
    "warning": "rgb(255, 255, 0)"
  }
}
```

### 森林主题

```json
{
  "extends": "dark",
  "colors": {
    "claude": "rgb(139, 195, 74)",
    "text": "rgb(200, 230, 200)",
    "success": "rgb(76, 175, 80)",
    "error": "rgb(244, 67, 54)"
  }
}
```

## 命令参考

```bash
# 安装依赖
bun install

# 构建项目
bun run build

# 生成配置文件
bun run theme:generate    # 生成主题配置
bun run ui:generate       # 生成UI配置

# 运行PointCode
bun run dev               # 默认运行
./start.bat               # Windows启动脚本
./start.sh                # Linux/Mac启动脚本

# 使用不同模型
CLAUDE_CODE_USE_OPENAI=1 OPENAI_BASE_URL=http://localhost:11434/v1 OPENAI_MODEL=model-name node dist/cli.mjs

# 类型检查
bun run typecheck
```

## 重置配置

删除配置文件即可重置：

```bash
rm config/custom-theme.json
rm config/ui-customization.json
```

然后重新生成：

```bash
bun run theme:generate
bun run ui:generate
```
