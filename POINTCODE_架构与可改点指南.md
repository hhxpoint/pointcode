# PointCode 架构与可改点指南

更新时间: 2026-04-02

## 本次实现结果

1. 去掉了启动页里的 Claude 文案提示。
2. 屏蔽了 OpenAI 模式下官方 marketplace 启动通知（不再出现 Anthropic 安装失败提示）。
3. `/model` 在缺少 API key 时会提示用户先输入 key。
4. `/buddy` 改为卡片式展示：稀有度、物种、Sprite、性格文案、属性条、18 物种列表。
5. 兜底修复：`__custom__` 不会再作为真实模型显示或使用。

## 关键文件索引

### 启动页与提示文案
- `src/projectOnboardingState.ts`
  - 启动欢迎区 `Tips for getting started` 的文案来源。

### Marketplace 通知
- `src/hooks/useOfficialMarketplaceNotification.tsx`
  - 启动时底部通知内容来源。
  - 已对 OpenAI 模式做静默处理。

### 模型选择与 API Key 提示
- `src/commands/model/model.tsx`
  - `/model` 主逻辑。
  - 选择模型、校验模型、提示缺 key 都在这里。
- `src/utils/model/model.ts`
  - 模型解析与默认模型逻辑。
  - 已增加 `__custom__` 兜底过滤。

### Buddy 系统
- `src/commands/buddy/BuddyCard.tsx`
  - `/buddy` 卡片 UI 入口（你看到的主要展示层）。
- `src/buddy/types.ts`
  - 稀有度、物种、爆率常量定义。
- `src/buddy/companion.ts`
  - 抽取逻辑（roll）、属性生成逻辑（rollStats）。
- `src/buddy/sprites.ts`
  - 各物种 ASCII Sprite 帧动画。

## 你以后改 UI 在哪里

### 全局配色和主题
- `config/custom-theme.json`
  - 改颜色、边框、提示色都在这里。

### 全局交互行为
- `config/ui-customization.json`
  - 改动画、状态栏、diff 显示、性能参数都在这里。

### buddy 卡片样式
- `src/commands/buddy/BuddyCard.tsx`
  - 改布局、卡片排版、属性条样式、是否显示 18 物种列表。

## 你以后改 buddy 爆率在哪里

### 稀有度权重（爆率）
- `src/buddy/types.ts` 中：

```ts
export const RARITY_WEIGHTS = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}
```

- 规则：权重越大越容易抽到。
- 例子：把 `legendary: 1` 改成 `legendary: 3`，传奇出现率会明显提高。

### 属性数值区间
- `src/buddy/companion.ts` 中：
  - `RARITY_FLOOR`：不同稀有度的基础属性地板。
  - `rollStats()`：峰值/短板属性生成方式。

## 你以后改 18 物种在哪里

- `src/buddy/types.ts`：
  - `SPECIES` 数组就是完整物种池。
- `src/buddy/sprites.ts`：
  - `BODIES` 里每个物种对应的 Sprite 帧。

新增物种必须同时改这两处：
1. 在 `SPECIES` 增加新 species。
2. 在 `BODIES` 增加同名 sprite 帧，否则渲染会报错。

## 常用验证命令

```bat
cd /d D:\agent\pointcode
bun run build
start.bat
```

启动后手工验收：
1. 首页不再出现 Claude/Anthropic 提示。
2. `/model` 在缺 key 场景会提示 `/provider key ...`。
3. `/buddy` 出现卡片样式与 18 物种信息。
