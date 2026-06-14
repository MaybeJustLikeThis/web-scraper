# 维护说明

## 维护原则

- `SKILL.md` 保持短，只写 agent 必须立即知道的流程。
- 细节放到 `references/`，新手文档放到 `docs/`。
- 脚本必须可跨 Windows、macOS、Linux 运行。
- 不把用户状态写进 skill 目录；使用 `scripts/state.mjs`。
- CDP API 新增端点时同步更新 `references/cdp-api.md`。

## 修改前检查

```bash
node scripts/validate-skill.mjs
```

如果失败，先修 validator 报告的问题。

## 发布前检查

```bash
node scripts/validate-skill.mjs
node scripts/check-deps.mjs
```

`check-deps.mjs` 在未开启浏览器远程调试时可以失败，但错误应清晰指出下一步。

## 文件边界

| 文件 | 责任 |
| --- | --- |
| `SKILL.md` | agent 运行时入口和决策流程 |
| `references/runtime-adapters.md` | Claude Code、Codex、通用运行时差异 |
| `references/cdp-api.md` | CDP endpoint 和手动 curl 示例 |
| `scripts/state.mjs` | state 目录、config、token |
| `scripts/validate-skill.mjs` | 包结构和遗留文案校验 |
| `docs/*.md` | 人类新手和维护者文档 |

## 不要做

- 不要把长安装教程塞进 `SKILL.md`。
- 不要在脚本里假设 `${CLAUDE_SKILL_DIR}` 一定存在。
- 不要在文档里只写 POSIX 路径或只写 Windows 路径。
- 不要让普通搜索依赖 CDP。
- 不要让 CDP API 裸奔，除 `/health` 外都必须要 token。

