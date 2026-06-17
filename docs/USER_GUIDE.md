# Web Scraper 用户指南

`web-scraper` 是一个**降级链抓取 skill**：给定 URL，从最轻到最重依次尝试——平台专用 CLI → `curl` → Jina → 内置浏览器 → CDP 登录态 → browser-use，拿到实质内容就停。支持 Claude Code 和 Codex 双运行时。

---

## 前置依赖

**必需**：
- Node.js 22+（第 4 层 CDP 脚本需要）。验证：`node --version`

**可选**（预判层平台 CLI；没装就自动跳过该平台，走降级链）：
- `yt-dlp` — YouTube / B站字幕
- `gh` — GitHub 仓库/代码搜索
- `xhs` / `twitter` / `rdt` — 小红书 / 推特 / Reddit（需 cookie，详见 `references/agent-reach.md`）

---

## 安装

### 方式一：Claude Code 全局（所有项目可用）

```bash
git clone https://github.com/MaybeJustLikeThis/web-scraper.git ~/.claude/skills/web-scraper
```

Windows（非 git bash）：
```powershell
git clone https://github.com/MaybeJustLikeThis/web-scraper.git "$env:USERPROFILE\.claude\skills\web-scraper"
```

装完**开新会话**即可触发。

### 方式二：Codex 项目级（跟项目走）

```bash
cd 你的项目根目录
git clone https://github.com/MaybeJustLikeThis/web-scraper.git .agents/skills/web-scraper
```

在该项目目录启动 Codex 才能发现。

### 方式三：Claude Code plugin

仓库含 `.claude-plugin/marketplace.json`，可作为 plugin marketplace 添加安装。

### 验证安装

```bash
cd ~/.claude/skills/web-scraper   # 或对应安装路径
node scripts/validate-skill.mjs
```

输出 `web-scraper skill validation passed` 即就绪。

---

## 基本使用

新会话里直接说目标，skill 自动走降级链：

```
抓取 https://example.com 的正文
帮我抓一篇掘金文章 https://juejin.cn/post/xxx
爬一下这个页面的价格 https://...
```

**降级顺序**（每层判断"是否有实质内容"，拿到就停）：

| 层 | 工具 | 适用 |
|----|------|------|
| 预判 | 平台专用 CLI | URL 命中 YouTube/GitHub/推特/Reddit/小红书；SPA 站点（掘金/知乎/Medium）跳到第 3 层 |
| 1 | `curl` | 静态页，零成本 |
| 2 | Jina Reader | 干净 Markdown，省 token |
| 3 | 内置浏览器 | CC 的 Playwright MCP / Codex 的 web 工具，JS 渲染 |
| 4 | CDP | 登录态/反爬/重度动态，见下节 |
| 5 | browser-use | AI 驱动兜底（点击/填表/滚动） |

成功后 skill 会问：**保存文件 / 存知识库 / 都要 / 看看就行**。

---

## 需要登录态：CDP 模式（第 4 层）

抓登录后页面、反爬严的站、或要操作真实浏览器时用——接管你日常的 Chrome/Edge（带登录态、书签、历史）。

**前置**：
1. Node.js 22+
2. Chrome 或 Edge 开远程调试：
   - Chrome：地址栏 `chrome://inspect/#remote-debugging` → 勾选 `Allow remote debugging for this browser instance`
   - Edge：`edge://inspect/#remote-debugging` → 同上

**检查连接**（在 skill 目录）：
```bash
node scripts/check-deps.mjs
```
- `exit 0`：就绪，可走 CDP
- `exit 2`：选默认浏览器（chrome/edge），写入 `config.env` 后重试
- `exit 1`：按提示开远程调试

CDP 只监听 `127.0.0.1`，所有 API 需本地 token（脚本自动处理）。

**安全**：skill 在访问登录态、私有系统、提交表单、购买等操作前，会先征得你确认。

---

## 批量抓取

| 数量 | 策略 |
|------|------|
| 1–10 个 URL | 逐个走降级链 |
| 10–100 个 | 让 skill 派子 Agent 并行 |
| 100+ 个 | 让 skill 写 Scrapling Spider 脚本（见 `references/scrapling.md`） |

---

## 故障排查

| 现象 | 处理 |
|------|------|
| 抓到空页 / 403 | 静态层拿不到，skill 会自动升级；到 CDP 仍失败多半是需登录或被反爬 |
| CDP 提示未连浏览器 | `chrome://inspect` 开远程调试，重跑 `check-deps.mjs` |
| 平台 CLI 没反应 | 对应 CLI 没装或没配 cookie；不装也行，自动走降级链 |
| Codex 里 skill 不触发 | 确认装在项目根 `.agents/skills/web-scraper`，且在该项目目录启动 Codex |
| `validate` 失败 | Node < 22，或 skill 目录不完整（重新 clone） |
| PowerShell 的 `curl` 是别名 | 用 `curl.exe`，或直接交给 skill（它会处理） |

---

## 给维护者

- 源仓库：`github.com/MaybeJustLikeThis/web-scraper`
- 改完 skill 同步部署：`npm run deploy`（复制到 `~/.claude/skills/web-scraper` + `../.agents/skills/web-scraper`，自动排除 `.git`）
- 校验包：`npm run validate`
- state 目录（token、`config.env`）用 `web-access` 命名空间，跨平台位置见 `docs/GETTING_STARTED.md`
- 详细参考：`references/`（cdp-api、runtime-adapters、agent-reach、scrapling、browser-use）
