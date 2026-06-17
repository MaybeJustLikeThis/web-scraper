# Agent-reach — 社媒与平台 CLI 速查

> 13个平台，6个零配置。最轻量的社媒内容获取方式。

## 零配置即用

### 任意网页（Jina Reader）
```bash
curl -sL "https://r.jina.ai/https://目标URL"
```

### YouTube 视频字幕
```bash
yt-dlp --write-auto-sub --sub-lang zh,en --skip-download --print-to-file title "%(title)s" /tmp/yt_title.txt "https://youtube.com/watch?v=VIDEO_ID"
yt-dlp --write-auto-sub --sub-lang zh,en --skip-download -o "/tmp/yt_sub" "https://youtube.com/watch?v=VIDEO_ID"
```

### YouTube 搜索
```bash
yt-dlp "ytsearch5:搜索关键词" --flat-playlist --print "%(title)s | %(url)s"
```

### GitHub 仓库/代码
```bash
gh repo view OWNER/REPO
gh search code "搜索关键词" --repo OWNER/REPO
gh issue list --repo OWNER/REPO --limit 10
```

### RSS/Atom 订阅
```bash
# 直接用 feedparser（Python）
python -c "import feedparser; f=feedparser.parse('FEED_URL'); [print(e.title, e.link) for e in f.entries[:10]]"
```

### B站视频字幕
```bash
yt-dlp --write-auto-sub --sub-lang zh --skip-download -o "/tmp/bili_sub" "https://bilibili.com/video/BV_ID"
```

### B站搜索
```bash
curl -sL "https://api.bilibili.com/x/web-interface/search/all/v2?keyword=搜索词" -H "User-Agent: Mozilla/5.0"
```

## 需要配置的渠道

### Twitter/X（需 cookie）
```bash
# 读取单条推文（零配置）
twitter read https://x.com/user/status/ID

# 搜索（需 cookie）
twitter search "关键词" --limit 10

# 配置：用 Cookie-Editor 浏览器扩展导出 cookie
# cookie 存储：~/.agent-reach/config.yaml
```

### Reddit（需 rdt login）
```bash
rdt login          # 首次需登录
rdt search "关键词" --subreddit all --limit 10
rdt read POST_URL
```

### 小红书（需 cookie）
```bash
# 配置后可用，cookie 来自浏览器 Cookie-Editor 导出
xhs search "关键词" --limit 10
xhs read NOTE_URL
```

### LinkedIn（公开页面零配置）
```bash
# 公开页面用 Jina
curl -sL "https://r.jina.ai/https://linkedin.com/in/USERNAME"

# 需要详细数据时用 MCP（需配置）
# 通过 mcporter 调用 LinkedIn MCP
```

## 常见场景示例

### 场景：搜索某话题的最新讨论
```bash
# 1. 先搜 GitHub
gh search repos "关键词" --sort updated --limit 5

# 2. 搜 B站
curl -sL "https://api.bilibili.com/x/web-interface/search/all/v2?keyword=关键词"

# 3. 如果有 Twitter cookie
twitter search "关键词" --limit 10
```

### 场景：提取视频内容用于笔记
```bash
# 1. 获取字幕文件
yt-dlp --write-auto-sub --sub-lang zh,en --skip-download -o "/tmp/%(title)s" "VIDEO_URL"

# 2. 字幕文件在 /tmp/ 目录下，格式为 .vtt 或 .srt
# 3. 清洗后输出 Markdown
```

## 诊断

```bash
agent-reach doctor           # 查看所有渠道状态
agent-reach doctor --json    # 机器可读格式
```
