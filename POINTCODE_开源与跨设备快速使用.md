# PointCode 开源与跨设备快速使用指南

更新时间: 2026-04-02

## 目标

这份文档用于开源发布后，让任何人下载你的仓库，都可以:

1. 先进入 PointCode 界面（无需预先写入你的私钥）。
2. 在 CLI 内通过 `/model` 完成 API key 配置。
3. 选择模型后开始正常使用 agent。

## 你现在的默认行为

- 启动时不再强制要求 `OPENAI_API_KEY`。
- 进入 CLI 后，如果缺 key，执行 `/model` 会提示先设置 key。
- 支持命令:

```text
/model key <api_key>
```

保存后即可继续:

```text
/model
```

选择模型并开始使用。

## 开源到 GitHub 的推荐流程

### 1. 本地确认不含敏感信息

检查以下文件不要提交真实 key:

- `.openclaude-profile.json`
- `.env`
- `.env.*`

本项目当前 `.openclaude-profile.json` 已移除真实 key。

### 2. 发布仓库

```bash
git add .
git commit -m "chore: prepare pointcode for open-source onboarding"
git push origin main
```

### 3. 给下载者的最简使用说明

```bash
git clone <your-repo-url>
cd pointcode
bun install
bun run build
```

Windows:

```bat
start.bat
```

进入 CLI 后配置 key:

```text
/model key sk-xxxx
/model
```

然后选模型，开始使用。

## 换一台电脑快速恢复

### 方式 A（推荐，安全）

1. 新电脑 clone 仓库。
2. `bun install && bun run build`。
3. `start.bat` 启动。
4. 在 CLI 输入:

```text
/model key <你的新key>
/model
```

优点: 不需要把 key 跟仓库一起传输。

### 方式 B（私有环境快速迁移）

把你本机生成后的 `.openclaude-profile.json` 复制到新电脑项目根目录，再启动即可。

注意: 该文件包含 key，仅适用于你自己的可信环境，不建议公开仓库携带。

## 常见问题

### Q1: 下载后能进界面但不能执行任务

这是预期行为（未配 key）。

执行:

```text
/model key <api_key>
/model
```

### Q2: `/model` 还是提示缺 key

检查是否为远程 OpenAI 兼容地址，且 key 是否正确。

### Q3: `/buddy` 要显示类似卡片

当前 `/buddy` 已是卡片式展示，数据来自内置 18 物种与稀有度系统。

- 展示层: `src/commands/buddy/BuddyCard.tsx`
- 爆率: `src/buddy/types.ts` 的 `RARITY_WEIGHTS`
- 物种池: `src/buddy/types.ts` 的 `SPECIES`
- Sprite: `src/buddy/sprites.ts`

## 对外 README 可直接加的最短片段

```md
### First run

Start PointCode first (no API key required):

```bash
start.bat
```

Inside PointCode:

```text
/model key <api_key>
/model
```

Choose a model and start.
```
