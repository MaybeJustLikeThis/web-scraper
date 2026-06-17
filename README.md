# web-scraper

一个同时面向 Claude Code 和 Codex 的**降级链抓取 skill**：给定 URL，从最轻到最重依次尝试——平台专用 CLI → `curl` → Jina → 内置浏览器 → CDP 登录态 → browser-use，拿到实质内容就停。

它做三件事：

- **预判 + 降级链**：按 URL 特征路由到专用 CLI（yt-dlp/gh/twitter/xhs/rdt），否则逐层升级 curl → Jina → 内置浏览器 → CDP → browser-use。
- **登录态/动态页**：需要登录态、反爬或重度动态渲染时，用 CDP 接管日常浏览器（带书签/历史）。
- **可移植**：CC plugin + Codex `.agents/skills` 双运行时打包，`npm run deploy` 一键同步部署。

## 适合谁

- 想让 agent 查询最新网页信息。
- 想让 agent 读取动态网页、登录后页面、内网页面或本地浏览器历史。
- 想维护一个可在 Claude Code 和 Codex 里复用的 web skill。

## 快速开始

先确认 Node.js 22+ 可用：

```bash
node --version
```

验证 skill 包：

```bash
node scripts/validate-skill.mjs
```

普通搜索和公开网页读取不需要浏览器配置。只有需要 CDP 浏览器模式时，再运行：

```bash
node scripts/check-deps.mjs
```

如果脚本提示没有浏览器打开远程调试，在 Chrome 或 Edge 地址栏打开：

```text
chrome://inspect/#remote-debugging
edge://inspect/#remote-debugging
```

勾选 `Allow remote debugging for this browser instance` 后重试。

## 安装

### Claude Code

推荐把本仓库克隆到 Claude Code skills 目录，或用 Claude Code plugin 安装方式。详见 [docs/CLAUDE_CODE.md](docs/CLAUDE_CODE.md)。

### Codex

推荐把本仓库放到 `.agents/skills/web-scraper`，或从本仓库复制 skill 包到 Codex skills 目录。详见 [docs/CODEX.md](docs/CODEX.md)。

## 仓库结构

```text
web-scraper/
  SKILL.md                    # agent 运行时入口，保持短而可执行
  agents/openai.yaml          # Codex/OpenAI UI 元数据
  scripts/
    check-deps.mjs            # CDP 前置检查，必要时启动 proxy
    cdp-proxy.mjs             # 本地浏览器 CDP HTTP API
    find-url.mjs              # 搜索本地浏览器书签/历史
    state.mjs                 # 跨平台 state 目录、config、token
    validate-skill.mjs        # 仓库/skill 自校验
  references/
    cdp-api.md                # CDP API 细节
    runtime-adapters.md       # Claude Code、Codex、通用运行时适配
    migration-2.5.3.md        # 旧 URL query API 迁移说明
    site-patterns/            # 可选站点经验
  docs/
    GETTING_STARTED.md        # 新手指引
    CLAUDE_CODE.md            # Claude Code 使用说明
    CODEX.md                  # Codex 使用说明
    MAINTAINING.md            # 维护与发布检查
```

## 安全模型

- CDP API 只监听 `127.0.0.1`。
- 除 `/health` 外，所有 CDP API 都要求 `X-Web-Access-Token`。
- token 与 `config.env` 放在用户 state 目录，不写进 skill 包。
- skill 要求 agent 在访问登录态、私有系统、上传、提交、删除、购买等场景前明确征得用户确认。

## 常用命令

```bash
node scripts/validate-skill.mjs
node scripts/check-deps.mjs
node scripts/check-deps.mjs --browser chrome
node scripts/find-url.mjs github --since 7d --only history
```

## 文档入口

- 新手从 [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) 开始。
- Claude Code 用户看 [docs/CLAUDE_CODE.md](docs/CLAUDE_CODE.md)。
- Codex 用户看 [docs/CODEX.md](docs/CODEX.md)。
- 维护者看 [docs/MAINTAINING.md](docs/MAINTAINING.md)。

