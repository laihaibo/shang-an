# AGENTS.md

## Project

上岸 (ShangAn) — 国考学习系统：行测刷题 / 限时模考 / 错题本 / 申论课程 / 面试练习。
Next.js 16 (App Router) 静态导出站点，部署到 GitHub Pages project site。**无后端、无 API route、无账号**；所有用户数据只存浏览器 localStorage（JSON 导入/导出做迁移）。

## Commands

包管理器是 **pnpm**（只有 pnpm-lock.yaml，不要用 npm/yarn）。

```bash
pnpm dev      # 开发服务器，访问 http://localhost:3000/shang-an/
pnpm build    # 静态导出到 out/（同时是唯一的 typecheck：严格 TS，无单独 typecheck 脚本）
pnpm lint     # next lint（eslint 9 + eslint.config.mjs）
```

没有测试套件。验收标准见 DESIGN.md 末尾「Acceptance」：build 成功、375px 无横向溢出、明暗主题可读、主路径（刷题→模考→错题→导出→导入）点通。

## Hard constraints（违反会直接 build 失败或部署损坏）

- `next.config.ts` 用 `output: "export"` → **禁止** API routes、server actions、middleware、任何服务端代码。
- `basePath: "/shang-an"` + `assetPrefix: "/shang-an/"` + `trailingSlash: true` → 站点部署在子路径，内部跳转必须用 Next `<Link>` 或相对路径，**不能手写 `/` 开头的绝对 href**。仓库名若不是 `shang-an` 需同步改 basePath。
- 所有动态路由必须静态可预渲染：动态路由参数需 `generateStaticParams`（见 `src/app/practice/[module]/page.tsx`）。
- `images.unoptimized: true` → 不要依赖 next/image 优化。
- localStorage 只能在浏览器访问：沿用 `src/lib/storage.ts` 的 `isBrowser()` 守卫模式，SSR 安全地返回默认值。

## Architecture

```
src/app/        App Router 路由。动态路由统一两文件模式：
                page.tsx（server 壳，generateStaticParams）+ page-client.tsx（"use client" 实现页）
src/components/ 共享组件；ui/ 是 shadcn 风格原语（button/card/badge/input/progress），别另起轮子
src/content/    题库与课程内容，纯 TS 模块打进客户端 bundle：
                questions/{verbal,judgment,quantitative,data,common}.ts（行测五模块）+ essay/interview/tips
src/lib/        types.ts（AppState/ModuleKey 等领域类型）、storage.ts（localStorage 读写 + 导入导出）、
                store.tsx（StoreProvider，React Context，全应用唯一状态源）、utils.ts（cn 等）
```

状态规则：所有持久化状态走 `StoreProvider`（`src/lib/store.tsx`）→ `storage.ts`，不要在组件里直接读写 localStorage。`loadState()` 用 `emptyState()` 合并做字段级迁移，新增 AppState 字段时必须同步加默认值并保持导入向后兼容（`ExportBundle` 结构不能随意破坏）。

## UI / Design rules

改任何 UI 前先读 **DESIGN.md**（完整设计规范：色板、字号、布局节奏、动效、文案语气、反模式）。

- 风格是 Apple 感 Liquid Glass：磨砂卡片 `backdrop-filter: blur(20px) saturate(180%)` + 1px 高光描边；色板 token 在 `src/app/globals.css`，不要硬编码颜色。
- Tailwind **v4**（`@tailwindcss/postcss`），主题明暗用 class 策略 + 系统偏好。
- 中文优先系统字体栈（PingFang SC / Noto Sans SC），**不引入外网字体 CDN**。
- 图标只用 lucide-react，**禁止 emoji 当装饰图标**。
- 手机优先（内容宽 `min(100% - 32px, 560px)`，底部五 Tab），触控目标 ≥ 44px，动效包在 `prefers-reduced-motion` 分支里。
- 文案语气「沉稳学长」：具体、克制、不贩卖焦虑（不写「必过」「一站式赋能」这类空话）。

## Deployment

`.github/workflows/deploy.yml`：push 到 main 自动 `pnpm build` 并发布 `out/` 到 GitHub Pages（Node 22 / pnpm 11）。本地改动提交前跑一次 `pnpm build` 验证静态导出即可覆盖 CI 的检查。

## Content

`src/content/` 内置题目与课程是**学习样例**（行测每模块 15 题、申论 12 讲、面试约 15 题），不是官方真题。加题/加课程照现有 TS 模块结构与类型写即可，会被打包进客户端。
