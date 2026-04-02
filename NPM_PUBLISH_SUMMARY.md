# PointCode npm 发布总结

## 发布信息

- **包名**: `pointcode`
- **版本**: `0.1.0`
- **发布时间**: 2026-04-02
- **发布账号**: hhxpoint (2948136468@qq.com)

## 发布流程

### 1. 前置条件

```bash
# 确保已登录 npm
npm login

# 或使用 Granular Access Token（推荐，可绕过 2FA）
# 在 ~/.npmrc 中配置:
//registry.npmjs.org/:_authToken=npm_xxx
```

### 2. 构建并发布

```bash
# 方式一：直接发布（会自动执行 prepack 脚本）
npm publish --access public

# 方式二：先构建再发布
npm run build
npm publish --access public
```

### 3. 验证发布

```bash
# 查看包信息
npm view pointcode

# 访问 npm 页面
https://www.npmjs.com/package/pointcode
```

## 遇到的问题及解决方案

### 问题 1: 双因素认证错误

**错误信息**:
```
npm error 403 403 Forbidden - PUT https://registry.npmjs.org/pointcode - 
Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

**解决方案**:
1. 访问 https://www.npmjs.com/settings/hhxpoint/tokens
2. 创建 **Granular Token**，权限选择 **Publish**
3. 勾选 **Bypass 2FA** 选项
4. 将 token 添加到 `~/.npmrc`:
   ```
   //registry.npmjs.org/:_authToken=npm_xxx
   ```

### 问题 2: package.json 自动修正警告

**警告信息**:
```
npm warn publish npm auto-corrected some errors in your package.json when publishing.
Please run "npm pkg fix" to address these errors.
npm warn publish "bin[pointcode]" script name was cleaned
```

**说明**: npm 会自动清理 bin 脚本名称中的特殊字符，不影响发布。如需修复可运行:
```bash
npm pkg fix
```

## 项目结构

```
pointcode/
├── bin/                    # 可执行脚本入口
│   ├── pointcode          # 主入口
│   ├── openclaude         # OpenClaude 入口
│   └── import-specifier.mjs
├── dist/                   # 构建输出
│   └── cli.mjs            # 打包后的 CLI
├── scripts/                # 构建和工具脚本
│   └── build.ts           # 构建脚本
├── src/                    # 源代码
├── package.json
└── README.md
```

## 发布配置 (package.json)

```json
{
  "name": "pointcode",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "pointcode": "./bin/pointcode"
  },
  "files": [
    "bin/",
    "dist/cli.mjs",
    "README.md"
  ],
  "scripts": {
    "build": "bun run scripts/build.ts",
    "prepack": "npm run build"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

## 关键要点

1. **prepack 脚本**: 发布前自动执行 `npm run build`，确保输出最新构建
2. **files 字段**: 控制发布到 npm 的文件，避免包含不必要的源码
3. **bin 字段**: 定义全局安装后可用的命令
4. **访问令牌**: 使用 Granular Token + Bypass 2FA 可避免每次发布都需要 2FA 验证码

## 后续发布新版本

```bash
# 1. 更新版本号 (选择其一)
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0

# 2. 发布
npm publish --access public
```

## 相关链接

- npm 包页面: https://www.npmjs.com/package/pointcode
- Token 管理: https://www.npmjs.com/settings/hhxpoint/tokens
- 安全设置: https://www.npmjs.com/settings/hhxpoint/security
