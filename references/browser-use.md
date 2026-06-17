# Browser-use — AI 驱动浏览器交互

> 让 AI 像人一样操作浏览器：点击、填表、滚动、登录。适合需要交互的场景。

## 核心工作流

```
browser-use open URL → browser-use state → browser-use click/input → 验证 → 重复
```

## 连接模式选择

| 场景 | 模式 | 命令 |
|------|------|------|
| 快速操作（无头） | managed headless | `browser-use open URL` |
| 需要看到操作过程 | managed headed | `browser-use open URL --headed` |
| 用已登录的Chrome | connect | `browser-use connect` |
| 用已有Chrome配置 | profile | `browser-use profile list` → `browser-use open URL --profile NAME` |
| 云端浏览器 | cloud | `browser-use cloud connect` |

## 常用命令

### 导航
```bash
browser-use open "https://URL"          # 打开页面
browser-use open "https://URL" --headed # 有头模式（可见）
browser-use connect                     # 连接已运行的Chrome
```

### 查看页面状态
```bash
browser-use state                       # 当前页面所有可交互元素
browser-use state --screenshot          # 带截图的状态
```

### 交互操作
```bash
browser-use click 5                     # 点击第5号元素
browser-use input 3 "搜索内容"          # 在第3号元素输入文字
browser-use scroll down                 # 向下滚动
browser-use scroll down 500             # 滚动500px
```

### 提取数据
```bash
browser-use get title                   # 页面标题
browser-use get text                    # 页面文本
browser-use get html                    # 页面HTML
browser-use get text --selector "div.article"  # 指定区域文本
```

### 标签页管理
```bash
browser-use tab list                    # 列出所有标签页
browser-use tab new "https://URL"       # 新开标签页
browser-use tab switch 2                # 切换到第2个标签页
browser-use tab close 2                 # 关闭第2个标签页
```

### 等待
```bash
browser-use wait selector "div.loaded"  # 等待元素出现
browser-use wait text "加载完成"         # 等待文本出现
```

### Cookie 管理
```bash
browser-use cookies export cookies.json # 导出 cookie
browser-use cookies import cookies.json # 导入 cookie
browser-use cookies clear               # 清除 cookie
```

### 关闭
```bash
browser-use close                       # 关闭浏览器
```

## 完整场景示例

### 场景：抓取需要登录的页面
```bash
# 1. 连接已登录的 Chrome（继承登录态）
browser-use connect

# 2. 打开目标页面
browser-use open "https://需要登录的URL"

# 3. 查看页面元素
browser-use state

# 4. 提取内容
browser-use get text --selector "div.content"

# 5. 完成后关闭
browser-use close
```

### 场景：自动填写表单
```bash
browser-use open "https://表单URL" --headed
browser-use state                       # 先看有哪些元素
browser-use input 2 "张三"              # 姓名
browser-use input 3 "test@example.com"  # 邮箱
browser-use click 5                     # 点击下拉框
browser-use click 8                     # 选择选项
browser-use click 10                    # 提交按钮
```

### 场景：滚动加载无限列表
```bash
browser-use open "https://无限滚动URL"
browser-use state
# 反复滚动 + 查看状态，直到收集够数据
browser-use scroll down
browser-use state
browser-use scroll down
browser-use get text
```

## 健康检查

```bash
browser-use doctor
```

## 踩坑提醒

- `connect` 前需要确保 Chrome 开启了远程调试
- 如果 `connect` 失败，给用户两个选择：开启远程调试 / 用 managed Chromium + profile
- `state` 命令返回的是所有可交互元素的编号列表，操作前务必先看 state
- 操作失败时先 `close` 再重试
- headless 模式下某些网站检测到无头浏览器会拒绝，用 `--headed` 解决
