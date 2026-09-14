# 上岸 ShangAn — Design Spec

公考辅助学习系统 · 国考（行测 / 申论 / 面试）· 纯静态 GitHub Pages

## Identity

Product UI Designer — 主路径状态 90% 是「刷题与对答案」，界面必须快、稳、可扫读。

## Grounding

Junior Designer 假设：应届生手机优先备考国考；Apple 产品感 + iOS 26 Liquid Glass 分层透明；文案语气沉稳学长、不贩卖焦虑。数据全在 localStorage，JSON 导入导出做迁移。

## 1. Objective

帮助应届生建立国考闭环：模块刷题 → 限时模考 → 错题复盘 → 进度可见 → 技巧/申论/面试随时查。

## 2. Product Context

| 项 | 决策 |
|---|---|
| 用户 | 应届生首次备考国考 |
| 考试 | 仅国家公务员考试 |
| 平台 | 手机优先，桌面可用；GitHub Pages 静态站 |
| 账号 | 无；本机 localStorage |
| 语气 | 沉稳学长，具体、克制、可执行 |

### 信息架构

底部五 Tab：**首页 · 刷题 · 模考 · 错题 · 我的**

首页金刚区入口：技巧手册 · 申论课程 · 面试练习 · 搜索

「我的」：进度详情 · 数据导入导出 · 设置 · 存储占用 · 提醒 · 关于/免责

### 功能深度

- **深**：刷题、整卷模考、错题本（复制 Markdown / 笔记 / 待复盘）、进度仪表盘
- **完整课程**：申论（考情 + 题型精讲 + 范文拆解 + 冲刺清单）
- **浅而可用**：技巧手册（条目化）、面试（题库 + 框架 + 计时 + 可选录音）

## 3. Visual Foundations

### Palette（液态玻璃 · 系统感）

```
--background:        #F4F5F7   /* 冷白纸面 */
--background-dark:   #0B0D10   /* 近黑 */
--foreground:        #1C1C1E
--foreground-dark:   #F5F5F7
--muted:             #8E8E93
--glass:             rgba(255, 255, 255, 0.62)
--glass-dark:        rgba(28, 28, 30, 0.55)
--glass-border:      rgba(255, 255, 255, 0.45)
--glass-border-dark: rgba(255, 255, 255, 0.12)
--accent:            #0A84FF   /* iOS 系统蓝 */
--accent-soft:       rgba(10, 132, 255, 0.12)
--success:           #30D158
--danger:            #FF453A
--warning:           #FF9F0A
--ink-soft:          #636366
```

背景：多层柔和色斑（蓝/青/紫低饱和径向渐变）承托玻璃卡片，禁止整页炫彩渐变堆砌。

### Typography

```
display:  "PingFang SC", "SF Pro Display", "Noto Sans SC", system-ui, sans-serif
body:     "PingFang SC", "SF Pro Text", "Noto Sans SC", system-ui, sans-serif
mono:     "SF Mono", "Cascadia Code", Consolas, monospace
```

| Role | Size | Weight | LH |
|---|---|---|---|
| Hero / 数字 | 40–56 | 600 | 1.1 |
| H1 | 28 | 600 | 1.25 |
| H2 | 20 | 600 | 1.3 |
| Body | 16 | 400 | 1.65 |
| Caption | 13 | 400 | 1.4 |
| Label / 数据 | 12–13 | 500 | 1.3 |

中文优先系统字体栈，不依赖外网字体 CDN。

### Layout

- 手机：单列，内容宽 `min(100% - 32px, 560px)`，底部 Tab 高 64 + safe-area
- 桌面：内容宽 max 960；模考/刷题可双栏（题干左、选项/解析右）
- 间距节奏：4 / 8 / 12 / 16 / 24 / 32 / 48
- 圆角：控件 12，卡片 20，玻璃面板 24
- 密度：一屏 1 主任务；列表行高 ≥ 56

### Signature（记忆点）

**Liquid Glass 叠层**：磨砂卡片（`backdrop-filter: blur(20px) saturate(180%)`）+ 1px 高光描边 + 顶部内侧高光；背景色斑随主题呼吸。首访有短开屏（品牌字 + 玻璃球升起）。

### Motion

- 开屏 700ms 一次；列表/卡片 fade+8px rise，220ms
- 对错反馈：成功轻弹、错误轻颤，150–200ms
- 全部包在 `@media (prefers-reduced-motion: reduce)` 分支

## 4. Accessibility

- 正文对比 ≥ 4.5:1；大号数字 ≥ 3:1
- 焦点环：2px accent + 2px offset
- 触控目标 ≥ 44×44
- 玻璃在实色 fallback 下仍可读（无 backdrop-filter 时用高不透明底色）
- 键盘：刷题 J/K 上下题，1–4 选选项

## 5. Voice & Tone

- 主动、具体：「收藏本题」「开始模考」「导出备份」
- 不说「必过」「稳上岸」；说「这题考点是……」「建议限时 12 分钟」
- 空状态给下一步动作，不卖惨
- 错误提示写清原因与修复

## 6. Implementation Practices

- Next.js App Router + `output: 'export'`（GitHub Pages）
- `basePath` / `assetPrefix`: `/shang-an`
- Tailwind v4 + shadcn/ui 变量主题；明暗用 `class` 策略 + 系统偏好
- 状态：React Context + `useReducer`，持久化到 localStorage（防抖写入）
- 无 API Route；无服务端密钥；无统计脚本
- 题库静态 JSON/TS 模块打包进客户端 bundle（样例体量可控）
- PWA：`manifest.json` + 基础静态缓存 SW（可选，失败降级不阻断）

## 7. Anti-Patterns

- 不做紫蓝青渐变 hero + 白字模板脸
- 不用 emoji 当装饰图标；用 lucide 图标
- 不堆无意义 16px 圆角卡片九宫格
- 不写空话（「一站式赋能」）
- 玻璃不透明度不低到正文对比失败
- 模考页不加分散注意力的营销插画

## 8. Decision-Making

| 决策 | 理由 | 代价 |
|---|---|---|
| 纯 localStorage | Pages 无后端；隐私干净 | 换设备靠导出 |
| 申论完整课程骨架 | 用户明确要求课程结构 | 内容量大，需控制样例深度 |
| 正确率展示而非赋分 | 避免伪官方分数误导 | 分数「不如考试分好看」 |
| 简单待复盘队列 | MVP 够用，状态机轻 | 无 SM-2 科学调度 |
| basePath=/shang-an | project pages 必需 | 本地相对路径需注意 |

## 9. Workflow

1. 数据层与类型 → 2. 主题/Glass 组件 → 3. 五 Tab 路由 → 4. 刷题/模考/错题闭环 → 5. 申论/面试/技巧 → 6. 导入导出/搜索/设置 → 7. Actions + build 验收

## Page Map

| 路由 | 职责 |
|---|---|
| `/` | 今日概览、继续学习、金刚区、模块进度条 |
| `/practice` | 模块选择 |
| `/practice/[module]` | 刷题会话（即时判对错） |
| `/mock` | 模考入口（标准卷 / 错题组卷） |
| `/mock/[id]` | 模考进行（倒计时、横屏优化） |
| `/mock/[id]/report` | 交卷报告 |
| `/wrong` | 错题本 + 待复盘 + 复制 Markdown |
| `/wrong/[id]` | 错题详情 + 笔记 |
| `/tips` | 行测技巧手册 |
| `/tips/[module]` | 模块技巧列表 |
| `/essay` | 申论课程目录 |
| `/essay/[slug]` | 申论讲次 |
| `/interview` | 面试题库 |
| `/interview/[id]` | 面试练习（计时/要点/录音） |
| `/search` | 全文搜索 |
| `/me` | 进度、设置、导入导出、存储、提醒 |

## Content Manifest（内置样例）

- 行测：言语 / 判断 / 数量 / 资料 / 常识 各 15 题
- 模考：国考行测结构样例卷 1 套（抽样组合，可重复抽题）
- 技巧：每模块 5–8 条套路
- 申论：8–12 讲完整骨架（考情 + 题型 + 范文拆解 + 冲刺）
- 面试：五类各 2–3 题，共约 15 题

## Acceptance

- `pnpm build` 成功（静态导出）
- Actions 工作流可部署到 `gh-pages`
- 主路径可点通：刷题 → 模考 → 错题复制 → 导出 → 导入
- 375px 无横向溢出；明暗主题可读
