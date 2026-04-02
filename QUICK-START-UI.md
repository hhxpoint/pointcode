# OpenClaude UI 自定义快速开始

## 1. 安装和构建

```bash
cd openclaude-cn
bun install
bun run build
```

## 2. 生成配置文件

```bash
# 生成主题配置
bun run theme:generate

# 生成UI配置
bun run ui:generate
```

## 3. 编辑配置文件

### 主题配置 (`~/.claude/custom-theme.json`)

修改颜色值：
```json
{
  "extends": "dark",
  "colors": {
    "claude": "rgb(255, 100, 50)",  // 修改Claude品牌色
    "text": "rgb(240, 240, 240)",   // 修改文本颜色
    "success": "rgb(100, 255, 100)" // 修改成功消息颜色
  }
}
```

### UI配置 (`~/.claude/ui-customization.json`)

启用时间戳和token计数：
```json
{
  "messages": {
    "showTimestamp": true,
    "showTokenCount": true
  },
  "statusLine": {
    "showModel": true,
    "showCost": true
  }
}
```

## 4. 运行OpenClaude

```bash
# 使用默认配置运行
bun run dev

# 或使用特定模型
bun run dev:deepseek
bun run dev:dashscope
bun run dev:ollama
```

## 5. 验证更改

1. 重启OpenClaude
2. 检查颜色是否生效
3. 检查UI行为是否改变

## 常用颜色修改

### 修改Claude品牌色
```json
"claude": "rgb(255, 0, 128)"  // 粉色
```

### 修改文本颜色
```json
"text": "rgb(200, 200, 200)"  // 浅灰色
```

### 修改成功/错误颜色
```json
"success": "rgb(0, 255, 0)",  // 绿色
"error": "rgb(255, 0, 0)"     // 红色
```

## 性能优化

### 减少动画
```json
{
  "disableShimmer": true,
  "performance": {
    "fpsLimit": 30,
    "reduceAnimations": true
  }
}
```

### 使用ANSI颜色
```json
{
  "extends": "dark-ansi"
}
```

## 故障排除

### 配置不生效
1. 检查JSON格式是否正确
2. 确认文件路径：`~/.claude/custom-theme.json`
3. 重启OpenClaude
4. 检查控制台错误

### 重置配置
```bash
# 删除配置文件
rm ~/.claude/custom-theme.json
rm ~/.claude/ui-customization.json
```

## 更多信息

详细文档请参考 [UI-CUSTOMIZATION.md](UI-CUSTOMIZATION.md)
