# 上岸 · 国考学习系统

行测刷题 · 限时模考 · 错题本 · 申论课程 · 面试练习。  
Apple 风格 Liquid Glass · 纯静态 · 数据只存在本机。

## 功能

- **刷题**：五大模块样例题，选完立刻对答案与解析；支持乱序、快捷键 `1–4` / `J` `K`
- **模考**：标准卷限时交卷；可从待复盘错题组卷；桌面/横屏侧栏答题卡
- **错题本**：自动收录、笔记、待复盘队列、**一键复制 Markdown**
- **技巧手册**：各模块高频套路条目
- **申论课程**：考情 + 题型精讲 + 范文拆解 + 冲刺清单（12 讲）
- **面试**：五类结构化题 + 框架要点 + 计时 + 可选录音自听
- **进度**：模块正确率、累计题量、连续天数
- **数据**：localStorage；JSON 导出/导入；主题明暗；全文搜索

## 本地开发

```bash
pnpm install
pnpm dev
```

默认 basePath 为 `/shang-an`，本地访问：`http://localhost:3000/shang-an/`

## 构建

```bash
pnpm build
```

静态文件输出到 `out/`。

## 部署到 GitHub Pages

1. 新建仓库（例如 `shang-an`），推送本项目
2. 仓库 **Settings → Pages** 选择 **GitHub Actions** 作为 Source
3. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布
4. 访问 `https://<你的用户名>.github.io/shang-an/`

若仓库名不是 `shang-an`，请同步修改 `next.config.ts` 中的 `basePath` / `assetPrefix`。

## 说明

- 内置题目与技巧为**学习样例**，供方法训练，不是官方真题原卷。
- 学习数据保存在浏览器本地，请定期在「我的」里导出 JSON 备份。
- 无账号、无统计、无服务端。

## 技术栈

- Next.js 16（App Router · `output: export`）
- Tailwind CSS v4
- shadcn 风格组件（Button / Card / Progress / Badge）
- pnpm
