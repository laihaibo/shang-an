<div align="center">

<img src="public/icon.svg" width="88" alt="上岸 ShangAn" />

# 上岸 ShangAn

**国考备考学习系统 —— 行测刷题 · 限时模考 · 错题复盘 · 申论课程 · 面试练习**

[![Deploy to GitHub Pages](https://github.com/laihaibo/shang-an/actions/workflows/deploy.yml/badge.svg)](https://github.com/laihaibo/shang-an/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0A84FF.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

**[🌍 在线体验](https://laihaibo.github.io/shang-an/)** · [功能总览](#-功能总览) · [快速开始](#-快速开始) · [部署](#-部署到-github-pages) · [参与贡献](#-参与贡献)

</div>

> **无后端 · 无账号 · 无统计脚本。** 所有学习数据只保存在你自己的浏览器里（localStorage），JSON 一键导出 / 导入即可迁移。整个站点是纯静态构建，开箱即部署。

## 🤔 为什么做这个

市面上的公考工具大多要注册登录、开会员、看广告。**上岸**反其道而行，专注做一件事：把备考闭环跑通——

**模块刷题 → 限时模考 → 错题复盘 → 进度可见**

手机优先、Apple「Liquid Glass」视觉、可添加到主屏幕（PWA），数据 100% 归你自己。

## ✨ 功能总览

| | 功能 | 说明 |
| --- | --- | --- |
| ✍️ | 行测刷题 | 言语 / 判断 / 数量 / 资料 / 常识五大模块，作答即时判分并给出解析，支持乱序与键盘快捷键 |
| ⏱️ | 限时模考 | 标准卷倒计时交卷，可用待复盘错题一键组卷；桌面与横屏下提供侧栏答题卡 |
| 📓 | 错题本 | 自动收录错题，支持笔记与待复盘队列，一键复制为 Markdown |
| 📚 | 申论课程 | 考情 → 题型精讲 → 范文拆解 → 冲刺清单，共 12 讲 |
| 🎤 | 面试练习 | 五类结构化题 + 框架要点 + 练习计时 + 可选录音回听 |
| 💡 | 技巧手册 | 各模块高频套路条目化速查 |
| 📊 | 学习进度 | 模块正确率、累计题量、连续学习天数 |
| 🌓 | 体验细节 | 明暗双主题、全文搜索、`prefers-reduced-motion` 适配 |

### ⌨️ 刷题快捷键

| 按键 | 作用 |
| --- | --- |
| `1` – `4` | 选择对应选项 |
| `J` / `K` | 下一题 / 上一题 |

## 🎨 设计

Apple「Liquid Glass」风格：磨砂玻璃卡片（`backdrop-filter: blur(20px) saturate(180%)`）+ 1px 高光描边，背景低饱和色斑承托，中文优先系统字体栈。触控目标 ≥ 44px，正文对比度 ≥ 4.5:1，全部动效尊重系统减弱动态设置。完整设计规范见 [DESIGN.md](DESIGN.md)。

## 🚀 快速开始

环境要求：**Node.js 20.9+**（CI 环境为 22）、**pnpm**

```bash
git clone https://github.com/laihaibo/shang-an.git
cd shang-an
pnpm install
pnpm dev
```

打开 <http://localhost:3000/shang-an/> 即可使用。

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm build` | 静态导出到 `out/`（同时是唯一的全量类型检查） |
| `pnpm lint` | 运行 ESLint |

## 📦 部署到 GitHub Pages

1. 新建（或 Fork）仓库并推送本项目
2. 仓库 **Settings → Pages**，Source 选择 **GitHub Actions**
3. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布
4. 访问 `https://<你的用户名>.github.io/shang-an/`

> 若仓库名不是 `shang-an`，请同步修改 `next.config.ts` 中的 `basePath` / `assetPrefix`。

## 🧱 项目结构

```
shang-an/
├── src/
│   ├── app/            # App Router 路由；动态路由用 page.tsx（静态壳）+ page-client.tsx（客户端实现）两文件模式
│   ├── components/     # 共享组件；ui/ 为 shadcn 风格原语（button / card / badge / input / progress）
│   ├── content/        # 题库与课程内容，纯 TS 模块打包进客户端
│   │   └── questions/  # 行测五模块题库（verbal / judgment / quantitative / data / common）
│   └── lib/            # types（领域类型）· storage（读写与导入导出）· store（全局状态）· utils
├── public/             # PWA 图标与 manifest
└── .github/workflows/  # push 到 main 自动构建并发布到 GitHub Pages
```

架构要点：

- `output: "export"` 纯静态导出，**没有任何服务端代码**（无 API route / server action / middleware）
- 动态路由全部通过 `generateStaticParams` 预渲染
- 持久化状态统一走 `StoreProvider` → `storage.ts`，组件内不直接读写 localStorage
- 主题明暗用 class 策略 + 系统偏好，色板 token 统一在 `src/app/globals.css`

## ➕ 添加题目与课程

内置内容是**学习样例**（行测每模块 15 题、申论 12 讲、面试约 15 题），在 `src/content/` 里按现有 TS 模块结构与类型扩展即可：

| 内容 | 位置 |
| --- | --- |
| 行测题库 | `src/content/questions/{verbal,judgment,quantitative,data,common}.ts` |
| 行测技巧 | `src/content/tips.ts` |
| 申论课程 | `src/content/essay.ts` |
| 面试题库 | `src/content/interview.ts` |

新增字段或题目后，跑一次 `pnpm build` 确认可静态导出。

## 🗺️ Roadmap

- [x] 行测五模块刷题闭环
- [x] 限时模考 + 错题组卷
- [x] 错题本（笔记 / 待复盘 / Markdown 导出）
- [x] 申论 12 讲 + 面试练习
- [x] PWA manifest，可添加到主屏幕
- [ ] Service Worker 离线缓存
- [ ] 间隔重复（SM-2）复盘调度
- [ ] 题库扩充与自定义题库导入

## 🤝 参与贡献

欢迎 Issue 与 PR：

1. Fork 仓库并新建分支
2. 提交前跑通 `pnpm build` 与 `pnpm lint`
3. 涉及 UI 的改动请先读 [DESIGN.md](DESIGN.md)（无 emoji 装饰图标、不硬编码颜色、系统字体栈等约束）

## ⚠️ 免责声明

- 内置题目与课程均为**学习样例**，供方法训练使用，不是官方真题，也不构成对考试结果的任何承诺
- 本项目与任何官方考试机构无关
- 数据仅存于浏览器本地，清理浏览器数据会丢失学习记录，请定期在「我的」页导出 JSON 备份

## 📄 许可证

[MIT](LICENSE) © 2026 laihaibo

## 🙏 致谢

[Next.js](https://nextjs.org) · [Tailwind CSS](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) · [lucide-react](https://lucide.dev)
