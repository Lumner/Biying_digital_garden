# 多 Agent 分工说明

这个项目适合拆给多个 agent 并行推进。每个 agent 开工前都应该先读：

- `README.md`
- `mkdocs.yml`
- `data/biying.persona.md`
- `scripts/build_knowledge.py`

## 产品 Agent

负责信息架构、访客路径、首页内容、关于页、Now 页。

交付：

- 更新 `docs/zh/about.md`
- 更新 `docs/zh/now.md`
- 同步英文页面

## 视觉 Agent

负责赛博视觉、响应式细节、阅读体验。

主要文件：

- `docs/assets/styles/cyber.css`
- `docs/zh/index.md`
- `docs/en/index.md`

## 内容 Agent

负责笔记和项目内容。

主要目录：

- `docs/zh/notes`
- `docs/en/notes`
- `docs/zh/projects`
- `docs/en/projects`

规则：

- 中文为主源。
- 英文可以由 `scripts/translate.py` 生成后人工校对。
- 要进入碧影知识库的页面必须设置 `public: true` 和 `avatar_readable: true`。

## 数学公式 Agent

负责 Markdown 公式渲染。

主要文件：

- `mkdocs.yml`
- `docs/assets/javascripts/mathjax.js`
- `docs/zh/notes/math-lab.md`

## 碧影 Agent

负责数字分身人格、检索和回答边界。

主要文件：

- `data/biying.persona.md`
- `docs/assets/javascripts/biying-chat.js`
- `edge-functions/api/chat.js`
- `scripts/build_knowledge.py`

核心约束：

- 只读公开网页内容。
- 不读 GitHub 活动。
- 不读未发布草稿。
- 不编造真实经历。

## 留言 Agent

负责公开留言、限频、防刷和管理删除。

主要文件：

- `docs/assets/javascripts/guestbook.js`
- `edge-functions/api/messages.js`
- `edge-functions/api/admin-messages.js`

## 部署 Agent

负责 EdgeOne Pages、Functions、KV 和环境变量。

主要文件：

- `DEPLOYMENT.md`
- `.github/workflows/ci.yml`
- `requirements.txt`
- `package.json`

## 验收命令

```bash
python scripts/validate_public_scope.py
python scripts/build_knowledge.py
mkdocs build --strict
node --check edge-functions/api/chat.js
node --check edge-functions/api/messages.js
node --check edge-functions/api/admin-messages.js
```

