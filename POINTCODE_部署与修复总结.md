# PointCode 本地修复与可用性总结

日期: 2026-04-02

## 本次已完成

1. 修复了 `/model` 选项里的 `__custom__` 占位符被误写入模型配置的问题。
2. 修复后，选择 `Custom model` 不会再把 `__custom__` 发到 API，避免 404。
3. `/model <model-name>` 在 OpenAI 兼容模式下会同步更新 `OPENAI_MODEL`（并保持 provider 切换逻辑）。
4. `/buddy` 命令改为默认启用，不再依赖 `BUDDY` 特性开关。
5. `/buddy` 展示增强：新增稀有度说明和 18 个物种清单。
6. `start.bat` 改为走 `pointcode.bat`，统一使用启动配置与模型初始化流程。
7. 已将本地配置文件 `.openclaude-profile.json` 调整为可直接使用你提供的 key 与 DashScope 默认模型。

## 当前默认运行配置

文件: `.openclaude-profile.json`

- `CLAUDE_CODE_USE_OPENAI=1`
- `OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
- `OPENAI_MODEL=qwen3.5-plus`
- `OPENAI_API_KEY=已写入你提供的 key`

## 如何快速运行

```bat
cd /d D:\agent\pointcode
start.bat
```

## 如何快速切模型

在 PointCode CLI 中:

```text
/model
```

或直接指定:

```text
/model qwen3.5-plus
/model qwen3.5-flash
```

如果你后续接本地 Ollama:

```text
/provider
/model qwen2.5-coder:7b
```

说明: 如果本地 Ollama 没有拉取该模型，任何客户端都会返回 model not found。

## `/buddy` 现在可见内容

- 当前 Companion 名称、物种、稀有度、属性
- 稀有度等级说明（common/uncommon/rare/epic/legendary）
- 18 个物种清单（鸭/鹅/猫/龙等）

## 变更文件

- `src/commands.ts`
- `src/commands/model/model.tsx`
- `src/commands/buddy/BuddyCard.tsx`
- `start.bat`
- `.openclaude-profile.json`

## 你可以这样验收

1. 启动后执行 `/buddy`，确认不再出现 `Unknown skill: buddy`。
2. 执行 `/model`，选择 `Custom model`，确认不会再把模型设为 `__custom__`。
3. 执行 `/model qwen3.5-plus` 后发一条普通消息，确认可正常返回。
