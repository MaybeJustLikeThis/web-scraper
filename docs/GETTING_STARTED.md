# 新手指引

这份文档只讲第一次使用需要知道的东西。

## 1. 先理解两种模式

web-access 有两种工作方式：

| 模式 | 什么时候用 | 是否需要浏览器配置 |
| --- | --- | --- |
| 轻量联网 | 搜索、读取公开 URL、查官方文档、抓 HTML | 不需要 |
| CDP 浏览器 | 登录后页面、动态渲染、网页交互、浏览器历史/书签 | 需要 |

不要一开始就配置浏览器。只有 agent 需要操作真实网页时才进入 CDP。

## 2. 验证 skill 包

在仓库根目录运行：

```bash
node scripts/validate-skill.mjs
```

看到下面输出就表示包结构和脚本语法没问题：

```text
web-access skill validation passed
```

## 3. 第一次使用 CDP

确认 Node.js 版本：

```bash
node --version
```

需要 `v22` 或更高。

运行检查：

```bash
node scripts/check-deps.mjs
```

如果提示没有浏览器打开远程调试，在 Chrome 或 Edge 地址栏打开：

```text
chrome://inspect/#remote-debugging
edge://inspect/#remote-debugging
```

勾选 `Allow remote debugging for this browser instance`，然后重跑 `check-deps.mjs`。

## 4. 选择默认浏览器

如果 Chrome 和 Edge 都可用，脚本可能要求你选默认浏览器。

配置会写到用户 state 目录，而不是仓库目录。

默认 state 目录：

| 系统 | 路径 |
| --- | --- |
| Windows | `%LOCALAPPDATA%\web-access` |
| macOS | `~/Library/Application Support/web-access` |
| Linux | `$XDG_STATE_HOME/web-access` 或 `~/.local/state/web-access` |

也可以临时指定：

```bash
node scripts/check-deps.mjs --browser chrome
node scripts/check-deps.mjs --browser edge
```

## 5. 给 agent 的示例请求

普通联网：

```text
Use $web-access to find the latest official docs for this API and summarize the supported options.
```

动态网页：

```text
Use $web-access to open this logged-in dashboard, inspect the table, and tell me the top 5 rows.
```

浏览器历史：

```text
Use $web-access to find the internal page I visited last week about deployment approvals.
```

## 6. 安全提醒

agent 需要访问登录态、私有页面、上传文件、提交表单、删除内容、购买或改设置时，必须先明确征得你的确认。

不要让 agent 代输密码、2FA、支付信息或授权弹窗。

