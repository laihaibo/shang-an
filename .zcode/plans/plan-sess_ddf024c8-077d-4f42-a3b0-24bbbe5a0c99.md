# 上岸 · 深度优化方案

范围：全面优化（bug 修复 + 数据安全 + 性能 + UI/UX 规范化），外加两项「数据健壮性」功能补全；移除半成品提醒功能。不加申论/面试进度跟踪与间隔重练（列为后续可选项）。

## 一、数据安全与正确性（`src/lib/storage.ts` / `store.tsx`）

1. **损坏数据不再静默清空**：`loadState` 改为白名单字段重建 state（顺带修掉「存储 JSON 多余字段透传进 state」的问题）；解析失败时把原始串备份到 `shang-an-state-v1-corrupted-<时间戳>`，返回 emptyState 并置内存级 `dataIssue` 标记，`/me` 页显示警示条。
2. **saveState 加 try/catch**：配额满/隐私模式不再产生未处理异常，失败置 `storageError`，`/me` 警示。
3. **防抖丢写修复**：`pagehide`/`visibilitychange`(hidden) 时 flush 待保存的 state。
4. **练习重复计数修复**（`practice/[module]/page-client.tsx`）：会话内记录每题作答，回退上一题显示上次结果并禁止重复 `recordAnswer`。
5. **模考计时漂移修复**（`mock/[id]/page-client.tsx`）：倒计时改为 deadline 基准（`startedAt + minutes*60s − now`），interval 不再依赖 `submit` 重建；自动交卷走 ref。
6. **wrong-pack 冷启动修复**：`ready` 前渲染骨架，paper/计时在错题数据就绪后再初始化。
7. **attempts FIFO 上限 5000**：控制 localStorage 与导出体积（统计语义变为近 5000 条）。
8. **移除半成品「每日提醒」**：删 `remindEnabled`/`remindHour` 及 `/me` 相关 UI；导入兼容（多余字段被白名单自然丢弃）。

## 二、性能

9. Context value 加 `useMemo`，修正 `exportState` 等依赖数组；首页 `todayAttempts` memo 化。
10. **暗色 FOUC 修复**：`layout.tsx` head 加内联阻塞脚本，首帧前按 localStorage/系统偏好预置 `.dark`。
11. **Splash 首访唯一 + 700ms**：localStorage 门控，`prefers-reduced-motion` 直接跳过。
12. **死代码清理**：`moduleStats`（含 `void rows`）、`PasswordInput`、`useQuestionLocalAnswer`、`CardDescription`、`clamp`、bottom-nav 死分支、`wrong/[id]` 的 void hack、`interview` 的 `as never` 改类型安全（清理前逐个 grep 确认无引用）。
13. **题库数据修复**：`quantitative.ts`/`judgment.ts` 的运行时 patch 块改为直接改正文定义并删除，清理脏 analysis 文本。

## 三、UI/UX 规范化（对齐 DESIGN.md）

14. **触控目标 ≥44px**：`button size="sm"` h-9→h-11；错题筛选 chips、PageHeader 返回、`/me` 复选行；模考答题卡 grid-cols-8→6。
15. **对比度**：浅色 `--muted` 加深至 ≥4.5:1（如 `#6C6C72`）；小号 accent 链接文字改用前景色或加深。
16. **图标补全**：用 `pnpm dlx` 工具把 `icon.svg` 栅格化为 180/192/512 PNG + maskable + apple-touch-icon，补 metadata.icons 与 manifest（失败则退化为 SVG favicon link，消除 404）。
17. **圆角/间距归一**：10/14/16/28px 圆角 → 12/20/24 token；20px 间距步进 → 16/24。
18. **动效对规**：rise-in 220ms、shake/pop 180ms；CSS transition 纳入 `prefers-reduced-motion`；`hover:scale` 加 `@media (hover: hover)`。
19. **A11y**：复制/导入导出提示加 `role="status"`/aria-live；原生 `confirm()` 换玻璃风格 ConfirmDialog；加 skip link。
20. **加载一致性**：`/me`、首页、mock report 统一 `ready` 门控 + 轻量 Skeleton 组件。
21. **桌面双栏刷题**（≥lg：题干左 / 选项+解析右）；**交卷确认**：玻璃对话框显示未答题数。
22. **搜索直达单题**：`practice/[module]` 支持 `?q=<id>` 定位起始题，搜索结果直链。

## 四、功能补全（数据健壮性）

23. **练习续作**：持久化 `activePractice`（模块、题序、进度、本组作答记录），刷新/退出后回到原位。
24. **模考中断恢复**：持久化 `activeMock`（paperId、answers、startedAt/deadline），重新进入模考页自动恢复，倒计时按真实 deadline 续算，交卷后清除。两者走 AppState 新字段（默认 null，白名单迁移，ExportBundle 向后兼容）。

## 五、验证

- `pnpm build`（唯一 typecheck）+ `pnpm lint` 通过。
- 浏览器实测（browser-use）：375px 无横向溢出；明暗主题下主路径 刷题→模考→错题→导出→导入 点通；暗色无闪白；模考中途刷新可恢复；练习续作生效。
- 提交前只改代码，不主动 commit（如需我提交请说明）。

**不做**（本次范围外，可后续）：代码分割（全部内容仅 ~78 题，bundle 影响小，不值得引入复杂度）、申论/面试完成标记、错题 SRS、题库扩充。