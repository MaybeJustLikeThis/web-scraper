# Claude Code 使用说明

## 安装方式

方式一：克隆到 Claude Code skills 目录。

```bash
git clone <your-repo-url> "$HOME/.claude/skills/web-access"
```

方式二：作为 Claude Code plugin 使用。

仓库内已包含：

```text
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
```

如果你发布到 GitHub，可以按 Claude Code plugin marketplace 的方式安装。

## 使用

在 Claude Code 中直接请求：

```text
Use $web-access to research the current official docs for Playwright screenshots.
```

需要浏览器自动化时：

```text
Use $web-access to inspect this logged-in page and extract the visible table data.
```

## 路径说明

Claude Code 可能会提供 `${CLAUDE_SKILL_DIR}`。如果它存在，skill 会把它当成 skill 根目录。

如果手动运行脚本，也可以进入仓库根目录后执行：

```bash
node scripts/validate-skill.mjs
node scripts/check-deps.mjs
```

## CDP 配置

CDP 模式需要 Chrome 或 Edge 开启远程调试：

```text
chrome://inspect/#remote-debugging
edge://inspect/#remote-debugging
```

勾选 `Allow remote debugging for this browser instance`。

## 常见问题

### 普通搜索是否需要 check-deps？

不需要。公开搜索和公开 URL 读取走 Claude Code 自带 web 工具或轻量 fetch 路径。

### 为什么 CDP API 需要 token？

proxy 运行在本机 `127.0.0.1`，token 防止本机其他进程直接调用 API 控制你的浏览器。

### token 在哪里？

见 `references/runtime-adapters.md` 的 state directory 部分。
