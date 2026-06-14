# Runtime Adapters

Load this file when the current agent runtime does not match an example in `SKILL.md`, or when a command mentions a tool or environment variable that may not exist.

## Skill Directory

Use the directory containing `SKILL.md` as `$SKILL_DIR`.

| Runtime | How to resolve |
| --- | --- |
| Codex repo skill | Usually `.agents/skills/web-access`; prefer an absolute path when running shell commands |
| Claude Code | `${CLAUDE_SKILL_DIR}` may already point at the skill directory |
| Other agents | Locate the installed skill folder and set `SKILL_DIR` manually |

PowerShell:

```powershell
$env:SKILL_DIR = "D:\path\to\web-access"
```

POSIX shells:

```bash
export SKILL_DIR="/path/to/web-access"
```

## Web Search And Fetch

Use the runtime's native web tools for public, read-only web tasks.

| Capability | Codex | Claude Code | Generic fallback |
| --- | --- | --- | --- |
| Search public web | Web search tool if available | WebSearch | Search tool or browser |
| Open/fetch known URL | Web open/fetch tool if available | WebFetch | `curl`, Jina, or browser |
| Raw HTML/API body | Shell `curl` where permitted | Shell `curl` | Shell `curl` |
| Logged-in/dynamic page | CDP browser mode | CDP browser mode | CDP browser mode |

Do not run `scripts/check-deps.mjs` merely because the task uses the web. Run it only for CDP browser mode.

## State Directory

Runtime state is stored outside the skill directory so installed skills can be read-only.

Default locations:

| Platform | Directory |
| --- | --- |
| Windows | `%LOCALAPPDATA%\web-access` |
| macOS | `~/Library/Application Support/web-access` |
| Linux | `$XDG_STATE_HOME/web-access` or `~/.local/state/web-access` |

Override with:

```bash
WEB_ACCESS_STATE_DIR=/custom/path
```

The state directory contains `config.env` and `proxy-token`.

## CDP Proxy Token

All CDP API calls except `/health` require the token stored at:

```text
$WEB_ACCESS_STATE_DIR/proxy-token
```

Read the token and pass it as `X-Web-Access-Token`.

PowerShell:

```powershell
$token = Get-Content "$env:LOCALAPPDATA\web-access\proxy-token"
curl.exe -H "X-Web-Access-Token: $token" http://localhost:3456/targets
```

POSIX shells:

```bash
TOKEN="$(cat "${WEB_ACCESS_STATE_DIR:-$HOME/.local/state/web-access}/proxy-token")"
curl -H "X-Web-Access-Token: $TOKEN" http://localhost:3456/targets
```

Prefer `scripts/check-deps.mjs` for readiness checks because it adds this header automatically.
