---
name: web-scraper
description: "Use when 抓取/爬取/采集/扒内容/提取网页正文，或 fetch/scrape/crawl 一个 URL——包括静态页、SPA 动态页、需登录态或需浏览器自动化的站点。"
---

# Web Scraper — 自动降级抓取

给定一个 URL，按 **预判 → 降级链 → 后处理** 三段执行。每层拿到实质内容就停，否则升级到下一层。

---

## 阶段一：预判（零成本 URL 路由）

检查 URL 域名关键词，命中即走专用路径，跳过通用降级链：

| URL 包含 | 直接执行 |
|----------|----------|
| `youtube.com` / `youtu.be` | `yt-dlp --write-auto-sub --sub-lang zh,en --skip-download "URL"` |
| `bilibili.com` | `yt-dlp --write-auto-sub --sub-lang zh --skip-download "URL"` |
| `github.com` | `gh repo view OWNER/REPO` 或 `gh search code "关键词"` |
| `twitter.com` / `x.com` | `twitter read "URL"`（需 cookie） |
| `reddit.com` | `rdt read "URL"` |
| `xiaohongshu.com` / `xhslink.com` | `xhs read "URL"`（需 cookie） |
| `juejin.cn` / `zhihu.com` / `medium.com` / `jianshu.com` | SPA，跳过第 1-2 层，直接进第 3 层 |

未命中 → 进入阶段二。

---

## 阶段二：降级链（逐层升级，拿到就停）

每层执行后判断返回**是否有实质内容**（正文/数据/讨论）。有则停；无（空页/403/登录墙/报错）则下一层。

### 第 1 层：curl（零成本）

```bash
curl -sL -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" "URL"
```

从 HTML 提取正文，去 `<script>`/`<style>`/导航/广告。有内容则停。

### 第 2 层：Jina Reader（干净 Markdown，省 token）

```bash
curl -sL "https://r.jina.ai/URL"
```

有内容则停。

### 第 3 层：内置浏览器工具（JS 渲染，零配置）

- **Claude Code**：Playwright MCP — `browser_navigate` 打开 URL → `browser_evaluate` 执行
  `document.querySelector('article')?.innerText || document.querySelector('main')?.innerText || document.body.innerText.substring(0, 15000)` → `browser_close`
- **Codex**：运行时内置 web 工具

专治 SPA（掘金/知乎/Medium 等）。有内容则停。

### 第 4 层：CDP 模式（带登录态/书签/历史）

接管你日常用的 Chrome/Edge 的登录态。前置检查（`$SKILL_DIR` 是本 skill 目录）：

```bash
node "$SKILL_DIR/scripts/check-deps.mjs"
```

- `exit 0` → 用 CDP API 提取（见 `references/cdp-api.md`）
- `exit 2` → 选浏览器，写 `config.env` 后重试
- `exit 1` → 按脚本提示开启浏览器远程调试（`chrome://inspect/#remote-debugging`）

这层解决需登录、反爬、重度动态渲染的页面。**安全门**：操作登录态/私有系统/提交表单前先征得用户确认。有内容则停。

### 第 5 层：browser-use（AI 驱动兜底）

需要点击/填表/滚动/复杂交互时用：

```
1. browser-use open "URL"
2. browser-use state
3. browser-use get text
4. 无内容则 browser-use scroll down → 再次 get text
5. browser-use close
```

详见 `references/browser-use.md`。所有层失败 → 阶段三失败输出。

---

## 阶段三：后处理

### 成功

格式化输出：

```
✅ 抓取成功（方法：第X层 - 工具名）
🔗 来源：URL
---
（整理后的正文：保留段落/标题/列表/代码块，图片转 [图片](URL)，去噪；超 8000 字截断并提示）
---
```

输出后问用户：1.保存到文件（`D:/Mycase/scrape-output/域名-时间戳.md`）/ 2.存知识库 / 3.都要 / 4.看看就行。

### 失败

```
❌ 抓取失败：URL
已尝试：（实际尝试过的层）
最后失败原因：（具体错误）
建议：需登录？提供 cookie？换代理？
```

---

## 批量抓取

| 数量 | 策略 |
|------|------|
| 1-10 个 URL | 逐个执行上面的流程 |
| 10-100 个 | 子 Agent 并行，每个处理一批 |
| 100+ 个 | 写 Scrapling Spider 脚本，见 `references/scrapling.md` |

---

## References

| 文件 | 何时读 |
|------|--------|
| `references/cdp-api.md` | 用第 4 层 CDP、写 JS 提取、排错 proxy |
| `references/runtime-adapters.md` | CC/Codex 运行时差异、shell 语法、`$SKILL_DIR` 解析 |
| `references/agent-reach.md` | 预判层平台 CLI（yt-dlp/gh/twitter/xhs/rdt）速查 |
| `references/scrapling.md` | Scrapling 结构化提取 + 反爬 |
| `references/browser-use.md` | 第 5 层 browser-use 命令速查 |
| `references/migration-2.5.3.md` | 旧 CDP URL query API 迁移 |
