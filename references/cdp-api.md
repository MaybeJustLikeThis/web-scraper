# CDP Proxy API Reference

Use this reference only after `scripts/check-deps.mjs` succeeds or when troubleshooting that flow.

The proxy listens on `http://localhost:3456` by default. Set `CDP_PROXY_PORT` before starting the proxy to use another port.

All endpoints except `/health` require `X-Web-Access-Token`. The token is created in the web-access state directory; see `runtime-adapters.md` for platform-specific paths.

For manual examples below, set `TOKEN` first.

PowerShell:

```powershell
$token = Get-Content "$env:LOCALAPPDATA\web-access\proxy-token"
```

POSIX shells:

```bash
TOKEN="$(cat "${WEB_ACCESS_STATE_DIR:-$HOME/.local/state/web-access}/proxy-token")"
```

## Starting

Run from the skill directory:

```bash
node "$SKILL_DIR/scripts/check-deps.mjs"
```

PowerShell:

```powershell
$env:SKILL_DIR = "D:\path\to\web-access"
node "$env:SKILL_DIR\scripts\check-deps.mjs"
```

The check script starts `scripts/cdp-proxy.mjs` when needed and waits for readiness.

## Stopping

Use a platform-appropriate command only when switching browsers or cleaning up a broken proxy.

PowerShell:

```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -like "*cdp-proxy.mjs*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId }
```

POSIX shells:

```bash
pkill -f cdp-proxy.mjs
```

## Endpoints

### GET /health

Return proxy and browser connection state.

```bash
curl -s http://localhost:3456/health
```

### GET /targets

List open tabs. Each item includes `targetId`, `title`, and `url`.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" http://localhost:3456/targets
```

### POST /new

Create a new background tab and wait for load. Put the URL in the POST body so query strings and fragments are preserved.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" -X POST --data-raw 'https://example.com' http://localhost:3456/new
```

### GET /close?target=ID

Close a tab. Close only tabs the agent created.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" "http://localhost:3456/close?target=TARGET_ID"
```

### POST /navigate?target=ID

Navigate an existing tab. Put `target` in the query and the destination URL in the POST body.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" -X POST --data-raw 'https://example.com' "http://localhost:3456/navigate?target=ID"
```

### GET /back?target=ID

Go back one page.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" "http://localhost:3456/back?target=ID"
```

### GET /info?target=ID

Return `title`, `url`, and `readyState`.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" "http://localhost:3456/info?target=ID"
```

### POST /eval?target=ID

Run JavaScript in the page. Use this for DOM inspection, extraction, form filling, and page-state checks.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" -X POST "http://localhost:3456/eval?target=ID" -d 'document.title'
```

For unknown pages, first inspect a compact structure rather than dumping full HTML:

```javascript
[...document.querySelectorAll('a,button,input,textarea,select,h1,h2,h3')]
  .slice(0, 80)
  .map((el) => ({
    tag: el.tagName,
    text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 120),
    href: el.href || null,
    name: el.name || null,
    type: el.type || null
  }))
```

### POST /click?target=ID

Click with `el.click()`. POST body is a CSS selector.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" -X POST "http://localhost:3456/click?target=ID" -d 'button.submit'
```

### POST /clickAt?target=ID

Click with browser-level mouse events. Use when a real user gesture is needed.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" -X POST "http://localhost:3456/clickAt?target=ID" -d 'button.upload'
```

### POST /setFiles?target=ID

Set files on a file input. POST body is JSON.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" -X POST "http://localhost:3456/setFiles?target=ID" -d '{"selector":"input[type=file]","files":["C:\\path\\to\\file.png"]}'
```

### GET /scroll?target=ID

Scroll by pixels or to the bottom.

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" "http://localhost:3456/scroll?target=ID&y=3000"
curl -s -H "X-Web-Access-Token: $TOKEN" "http://localhost:3456/scroll?target=ID&direction=bottom"
```

### GET /screenshot?target=ID&file=PATH

Capture the rendered page, including the current video frame. Use a writable absolute path.

PowerShell-friendly example:

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" "http://localhost:3456/screenshot?target=ID&file=C:/tmp/web-access-shot.png"
```

POSIX example:

```bash
curl -s -H "X-Web-Access-Token: $TOKEN" "http://localhost:3456/screenshot?target=ID&file=/tmp/web-access-shot.png"
```

## Extraction Notes

- Prefer `/eval` for text, links, image URLs, video URLs, and page state.
- For lazy-loaded media, scroll first and extract URLs afterward.
- For Shadow DOM or iframes, use JavaScript traversal rather than plain CSS selectors.
- If a site-generated link contains tokens or tracking parameters, preserve the full URL.
- When the page says content is missing, verify whether the access method caused the failure before concluding the content is gone.
