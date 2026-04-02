# PointCode UI 自定义文件位置总览

更新时间: 2026-04-02

## 1. 为什么 Recent activity 显示 No recent activity

`Recent activity` 的数据来自本地历史会话日志，不是实时当前输入。

关键链路:

- 预加载入口: `src/setup.ts`
- 同步读取缓存: `src/utils/logoV2Utils.ts` 的 `getRecentActivitySync()`
- Feed 组装: `src/components/LogoV2/feedConfigs.tsx` 的 `createRecentActivityFeed()`
- 欢迎区渲染: `src/components/LogoV2/LogoV2.tsx`

本次已修复一个逻辑问题:

- 之前只有在有 release notes 时才会加载 recent activity。
- 现在改为只要不是 bare 模式，就会预加载 recent activity。

如果仍显示 `No recent activity`，通常是因为:

1. 本地还没有历史会话日志。
2. 历史会话被过滤掉（如 sidechain、当前 session、无有效 prompt）。

## 2. Tips for getting started 在哪里改

### 文案源头

- `src/projectOnboardingState.ts`
  - `getSteps()` 里定义每条 Tips 文本。

### 渲染与标题

- `src/components/LogoV2/feedConfigs.tsx`
  - `createProjectOnboardingFeed()`
  - 标题 `Tips for getting started` 在这里。

### 在欢迎页哪里被拼进去

- `src/components/LogoV2/LogoV2.tsx`
  - `FeedColumn` 中把 Tips 与 Recent activity 放在右侧区域。

## 3. 整个 UI 的主要入口文件

### 启动与主流程

- `src/main.tsx`
  - CLI 主入口与启动流程。
- `src/setup.ts`
  - 启动初始化、预加载、Logo 数据准备。

### 主界面与会话区

- `src/screens/REPL.tsx`
  - 主交互界面（输入、消息、命令执行）。
- `src/components/Messages.tsx`
  - 消息列表渲染。
- `src/components/PromptInput/PromptInput.tsx`
  - 主输入区。
- `src/components/TextInput.tsx`
  - 底层文本输入行为。

### 欢迎卡片（你截图上方区域）

- `src/components/LogoV2/LogoV2.tsx`
- `src/components/LogoV2/feedConfigs.tsx`
- `src/projectOnboardingState.ts`

## 4. 主题和 UI 配置文件（最常改）

### 颜色主题

- `config/custom-theme.json`

### UI 行为

- `config/ui-customization.json`

### UI 配置加载逻辑

- `src/utils/uiCustomization.ts`

## 5. Buddy 显示相关位置

- 命令入口: `src/commands/buddy/index.ts`
- 卡片渲染: `src/commands/buddy/BuddyCard.tsx`
- 物种/稀有度定义: `src/buddy/types.ts`
- 精灵图帧: `src/buddy/sprites.ts`
- 抽取与属性生成: `src/buddy/companion.ts`

## 6. 你可以快速改哪些内容

1. 改 Tips 文案:
- `src/projectOnboardingState.ts`

2. 改右侧面板标题/空状态文案:
- `src/components/LogoV2/feedConfigs.tsx`

3. 改欢迎卡片布局:
- `src/components/LogoV2/LogoV2.tsx`

4. 改全局颜色:
- `config/custom-theme.json`

5. 改输入/状态栏行为:
- `config/ui-customization.json`
