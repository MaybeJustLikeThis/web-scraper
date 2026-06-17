# Codex 使用说明

## 安装方式

推荐放到项目或用户的 Codex skills 目录。

项目级：

```text
.agents/skills/web-scraper
```

用户级位置取决于你的 Codex 环境。核心要求是：Codex 能发现包含 `SKILL.md` 的 `web-scraper` 目录。

## 使用

普通联网：

```text
Use $web-scraper to verify the latest official release notes and summarize the breaking changes.
```

动态页面：

```text
Use $web-scraper to inspect this page in my browser and extract the loaded media URLs.
```

本地浏览器历史：

```text
Use $web-scraper to find the dashboard I opened yesterday whose title contains billing.
```

## Codex 路径约定

如果 skill 安装在项目内，通常是：

```text
.agents/skills/web-scraper
```

手动运行脚本时，在仓库根目录执行：

```powershell
node scripts\validate-skill.mjs
node scripts\check-deps.mjs
```

也可以显式设置：

```powershell
$env:SKILL_DIR = "D:\path\to\web-scraper"
node "$env:SKILL_DIR\scripts\check-deps.mjs"
```

## Windows 注意事项

如果 PowerShell 的 `curl` 是 `Invoke-WebRequest` 别名，需要使用：

```powershell
curl.exe
```

CDP 截图路径请用可写绝对路径，例如：

```text
C:/tmp/web-scraper-shot.png
```

不要照搬 POSIX 的 `/tmp/...`。

## 验证

```powershell
node scripts\validate-skill.mjs
```

如果 `check-deps.mjs` 提示浏览器未开启远程调试，这是环境配置问题，不代表 skill 包损坏。

