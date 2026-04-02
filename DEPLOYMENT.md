# PointCode 一键部署实现总结

本文档详细说明了如何实现"一行命令安装 PointCode"，让用户无需下载源码即可使用。

---

## 实现效果

用户可以通过以下任一方式一键安装：

### Linux/Mac
```bash
curl -fsSL https://raw.githubusercontent.com/hhxpoint/pointcode/main/scripts/install.sh | bash
```

### Windows PowerShell
```powershell
iwr https://raw.githubusercontent.com/hhxpoint/pointcode/main/scripts/install.ps1 -useb | iex
```

### npm 全局安装
```bash
npm install -g pointcode
```

### npx 免安装使用
```bash
npx pointcode
```

---

## 当前状态

| 任务 | 状态 |
|------|------|
| GitHub 仓库创建 | ✅ 已完成 - https://github.com/hhxpoint/pointcode |
| 代码推送 | ✅ 已完成 |
| README 更新 | ✅ 已完成（专业版带图表） |
| 安装脚本 | ✅ 已完成 |
| npm 发布 | ⏳ 待完成（需要交互式登录） |

---

## 剩余步骤：发布到 npm

### 登录 npm

```bash
npm login
```

系统会提示输入：
- Username: 你的 npm 用户名
- Password: 你的 npm 密码
- Email: 你的邮箱

### 发布包

```bash
# 确保已构建
bun run build

# 发布到 npm
npm publish --access public
```

### 验证发布

```bash
# 测试 npx 运行
npx pointcode --version

# 测试全局安装
npm install -g pointcode
pointcode --version
```

---

## 实现步骤详解

### 步骤 1: 配置 package.json

确保 `package.json` 包含以下关键字段：

```json
{
  "name": "pointcode",
  "version": "0.1.0",
  "bin": {
    "pointcode": "./bin/pointcode"
  },
  "files": [
    "bin/",
    "dist/cli.mjs",
    "README.md"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

**说明：**
- `name`: npm 包名，用户通过这个名字安装
- `bin`: 指定可执行文件，`pointcode` 命令会指向 `./bin/pointcode`
- `files`: 发布到 npm 时包含的文件
- `publishConfig.access`: 设为 `public` 才能公开发布

### 步骤 2: 创建可执行文件

`bin/pointcode` 文件（已在项目中）：

```javascript
#!/usr/bin/env node

import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, '..', 'dist', 'cli.mjs')

if (existsSync(distPath)) {
  await import(pathToFileURL(distPath).href)
} else {
  console.error(`pointcode: dist/cli.mjs not found. Run 'bun run build' first.`)
  process.exit(1)
}
```

**注意：** Windows 下需要添加 `.cmd` 扩展名或使用其他方式处理。

### 步骤 3: 创建安装脚本

#### Linux/Mac 安装脚本 (scripts/install.sh)

```bash
#!/bin/bash
set -e

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误：Node.js 未安装"
    exit 1
fi

# 检查版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "错误：需要 Node.js v20+"
    exit 1
fi

# 安装
npm install -g pointcode

echo "✓ PointCode 安装成功!"
```

#### Windows 安装脚本 (scripts/install.ps1)

```powershell
# 检查 Node.js
try {
    $nodeVersion = node -v
} catch {
    Write-Host "错误：Node.js 未安装"
    exit 1
}

# 安装
npm install -g pointcode

Write-Host "✓ PointCode 安装成功!"
```

### 步骤 4: 发布到 npm

```bash
# 1. 登录 npm (首次需要)
npm login

# 2. 构建项目
bun run build

# 3. 发布
npm publish --access public
```

**注意：**
- 包名 `pointcode` 可能已被占用，需要使用唯一的名字
- 可以使用 scoped package: `@yourname/pointcode`

### 步骤 5: 更新 README

在 README 顶部添加一键安装命令，让用户第一眼就能看到。

---

## 完整工作流

```
┌─────────────────────────────────────────────────────────────┐
│                    开发者发布流程                            │
├─────────────────────────────────────────────────────────────┤
│  1. 修改代码                                                 │
│  2. bun run build                                            │
│  3. npm version patch  (更新版本号)                          │
│  4. npm publish --access public                              │
│  5. git push                                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    用户安装流程                              │
├─────────────────────────────────────────────────────────────┤
│  Linux/Mac:                                                  │
│    curl -fsSL .../install.sh | bash                          │
│                                                              │
│  Windows:                                                    │
│    iwr .../install.ps1 -useb | iex                           │
│                                                              │
│  或者：                                                      │
│    npm install -g pointcode                                  │
│    npx pointcode                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 注意事项

### 1. 包名冲突

如果 `pointcode` 已被注册，发布会失败。解决方案：

```bash
# 方案 A: 使用 scoped package
npm publish --access public
# 包名变为 @yourname/pointcode

# 方案 B: 修改 package.json 中的 name 字段
"name": "pointcode-cli"
```

### 2. 脚本执行权限 (Linux/Mac)

```bash
chmod +x scripts/install.sh
```

### 3. GitHub 仓库

要让 curl 命令工作，代码需要托管在 GitHub：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/pointcode.git
git push -u origin main
```

### 4. 版本管理

每次发布新版本：

```bash
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
npm publish
```

---

## 快速发布清单

- [ ] 确保 `package.json` 中 `bin` 字段正确
- [ ] 确保 `bin/pointcode` 文件存在且可执行
- [ ] 运行 `bun run build` 构建
- [ ] 运行 `npm login` 登录
- [ ] 运行 `npm publish --access public` 发布
- [ ] 测试 `npx pointcode` 是否工作
- [ ] 更新 README 中的安装说明
- [ ] 推送代码到 GitHub

---

## 故障排除

### 发布失败：包名已存在

```bash
# 修改 package.json
"name": "pointcode-cli"  # 或其他唯一名称
```

### 发布失败：403 Forbidden

确保登录了 npm：
```bash
npm login
```

### 安装后命令不存在

检查 npm 全局目录是否在 PATH 中：
```bash
# Linux/Mac
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Windows (PowerShell)
$env:Path += ";$(npm config get prefix)"
```

### 构建产物未包含

确保 `package.json` 的 `files` 字段包含 `dist/` 和 `bin/`。

---

## 参考链接

- [npm 可执行文件文档](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin)
- [npm 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [npx 文档](https://docs.npmjs.com/cli/v10/commands/npx)

---

## 总结

实现一键安装的核心要素：

1. **正确的 package.json 配置** - `bin` 字段指定入口
2. **可执行的入口文件** - `bin/pointcode` 带 shebang
3. **发布到 npm** - `npm publish --access public`
4. **安装脚本** - 方便用户通过 curl/PowerShell 一键安装
5. **清晰的文档** - README 中说明安装方法

完成以上步骤后，用户就可以通过一行命令安装和使用 PointCode 了！
