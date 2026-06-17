# Scrapling — 结构化抓取与反爬突破

> 三层 Fetcher + 自适应元素定位 + Spider 框架。批量抓取和反爬场景的首选。

## 三层 Fetcher 选择

| 场景 | Fetcher | 特点 |
|------|---------|------|
| 普通静态页面 | `Fetcher` | TLS指纹伪装，HTTP/3，最快 |
| JS渲染页面 | `DynamicFetcher` | Playwright Chromium，等同真实浏览器 |
| Cloudflare/强反爬 | `StealthyFetcher` | 指纹欺骗，自动解 Cloudflare |

## Python 代码示例

### 快速抓取静态页面
```python
from scrapling import Fetcher

fetcher = Fetcher()
page = fetcher.get("https://目标URL")

# CSS 选择器提取
titles = page.css("h2.title::text")
links = page.css("a.product::attr(href)")
prices = page.css("span.price::text")

for t, l, p in zip(titles, links, prices):
    print(f"{t} | {l} | {p}")
```

### JS 渲染页面（等待元素加载）
```python
from scrapling import DynamicFetcher

fetcher = DynamicFetcher()
page = fetcher.get("https://SPA网站URL", wait_selector="div.product-list")

items = page.css("div.product-card")
for item in items:
    name = item.css_first("h3::text")
    price = item.css_first(".price::text")
    print(f"{name}: {price}")
```

### 绕过 Cloudflare
```python
from scrapling import StealthyFetcher

fetcher = StealthyFetcher()
page = fetcher.get(
    "https://被Cloudflare保护的URL",
    solve_cloudflare=True  # 自动解 Turnstile
)
print(page.css("h1::text"))
```

### 自适应元素定位（网站改版不怕）
```python
from scrapling import Fetcher

fetcher = Fetcher()
page = fetcher.get("https://目标URL", adaptive=True)

# adaptive=True 会记录元素位置
# 即使网站改版，下次抓取时能自动重新匹配
items = page.css("div.item", adaptive=True)
```

## Spider 框架（批量爬取）

```python
from scrapling.spiders import Spider, Request

class ProductSpider(Spider):
    start_urls = ["https://目标网站/products?page=1"]

    def parse(self, response):
        for item in response.css("div.product"):
            yield {
                "name": item.css_first("h3::text"),
                "price": item.css_first(".price::text"),
                "url": item.css_first("a::attr(href)"),
            }

        # 翻页
        next_page = response.css_first("a.next::attr(href)")
        if next_page:
            yield Request(next_page, callback=self.parse)

# 运行
# scrapling run spider.py --output results.json
```

### Spider 暂停/恢复
```bash
# 运行中按 Ctrl+C 自动保存检查点
# 重新运行同一命令即可从检查点恢复
scrapling run spider.py --output results.json
```

## CLI 命令

```bash
# 交互式抓取 shell
scrapling shell "https://URL"

# 直接提取
scrapling extract "https://URL" --selector "div.item" --output json
```

## 代理配置

```python
from scrapling import Fetcher, ProxyRotator

# 代理轮换
proxies = ProxyRotator(["http://proxy1:port", "http://proxy2:port"])
fetcher = Fetcher(proxy_rotator=proxies)
page = fetcher.get("https://目标URL")
```

## 踩坑提醒

- `pip install "scrapling[all]"` 后必须执行 `scrapling install` 下载浏览器引擎
- `DynamicFetcher` 和 `StealthyFetcher` 首次使用会自动下载 Chromium（约180MB）
- Python 3.10+ 才支持
- Windows 上 Playwright 路径可能有空格问题，确保安装路径无中文/空格
- 自适应模式会创建 `.scrapling_adaptive.json` 缓存文件，注意 gitignore
