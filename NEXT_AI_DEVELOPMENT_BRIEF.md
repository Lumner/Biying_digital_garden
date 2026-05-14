# 碧影数字花园：给下一个 AI 的开发文档

## 1. 项目一句话说明

这是一个基于 MkDocs Material 的个人数字花园网站，用来长期沉淀课程笔记、项目经历、当前状态与公开表达，并接入一个名为“碧影”的男性数字分身。访客可以浏览内容、切换中英文、查看数学公式、留言，也可以通过对话了解网站公开内容或进行轻度闲聊。

## 2. 当前用户需求

用户是一名 XX 大学 25 级人工智能专业本科生，兴趣方向包括：

- vibe coding
- 具身智能
- 全栈开发

网站希望呈现的气质是：

- 有生活气息
- 有专业能力
- 像个人长期维护的数字空间，而不是简历页、招聘页或营销页

明确约束：

- 不要在站内显式写“HR”“招聘”“简历”等导向性文案。
- 网站功能之一是让他人了解作者能力，但文案不要把它包装成求职专用网站。
- 碧影只能读取和回答网站上已经公开的内容。
- 不要读取本地未发布文件、GitHub 私有活动、草稿、隐私信息。
- 留言默认公开。
- 当前优先实现功能完整，不要被域名购买流程卡住。

## 3. 当前技术路线

核心技术：

- 静态站点：MkDocs + MkDocs Material
- 内容格式：Markdown
- 数学公式：MathJax + pymdownx.arithmatex
- 语言：中文为主，英文为同步版本
- 前端脚本：原生 JavaScript
- 样式：自定义 CSS
- 数字分身后端：EdgeOne Functions 风格接口
- 留言存储：计划使用 EdgeOne KV
- 部署：优先 EdgeOne Pages
- 仓库：GitHub

当前部署路径：

1. 使用 EdgeOne Pages 部署 GitHub 仓库。
2. 使用已购买并绑定的正式域名 `https://www.biying.site/`。
3. 跑通网站、注册/登录、碧影聊天、留言板、知识库。
4. 后续再补充 Functions、KV、模型 Key、留言管理和防刷能力。

域名已经不是阻塞项。当前重点是把账户、留言和碧影聊天跑通。

## 4. 当前项目目录

项目路径：

```txt
C:\Users\17597\Desktop\codex\biying-digital-garden
```

重要文件：

- `mkdocs.yml`：MkDocs 主配置，包含站点信息、中英文导航、主题、插件、扩展、CSS/JS 引入、copyright。
- `docs/`：网站正文内容。
- `docs/zh/`：中文页面。
- `docs/en/`：英文页面。
- `docs/assets/styles/cyber.css`：主要视觉样式。
- `docs/assets/javascripts/mathjax.js`：MathJax 配置。
- `docs/assets/javascripts/language-switch.js`：全站中英文切换逻辑。
- `docs/assets/javascripts/biying-chat.js`：碧影聊天前端。
- `docs/assets/javascripts/guestbook.js`：留言板前端。
- `docs/assets/knowledge/public-knowledge.json`：构建生成的公开知识库，供碧影读取。
- `data/biying.persona.md`：碧影人格设定。
- `edge-functions/api/chat.js`：碧影聊天 API 雏形。
- `edge-functions/api/auth.js`：注册、登录、会话校验 API。
- `edge-functions/api/messages.js`：公开留言 API 雏形。
- `edge-functions/api/admin-messages.js`：留言管理 API 雏形。
- `scripts/import_course_notes.py`：从 `note/` 导入课程笔记并生成中英文页面。
- `scripts/build_knowledge.py`：生成碧影可读取的公开知识库。
- `scripts/validate_public_scope.py`：检查公开知识库范围是否包含敏感词。
- `README.md`：项目说明。
- `ARCHITECTURE.md`：当前架构说明。
- `PROJECT_HANDOFF.md`：上一份项目交接文档。
- `DEPLOYMENT.md`：部署说明。
- `AGENTS.md`：多 Agent 协作说明。

## 5. 已经完成的功能

已经完成：

- MkDocs Material 项目结构。
- 中文和英文页面结构。
- 首页、关于、现在、笔记、项目、碧影、留言等基础页面。
- 中英文全站切换。
- 英文页面左侧目录恢复。
- 右侧章节目录，用于快速定位笔记章节。
- MathJax 数学公式渲染。
- 三篇课程笔记导入。
- 修复课程笔记中被反引号包住的公式不能渲染的问题。
- 碧影 persona 优化：男性，细致内敛，温柔，不违法、不违背公序良德、不说脏话。
- 碧影聊天前端与 API 雏形。
- 留言板前端与 API 雏形。
- 项目页“个人网页 + 数字分身搭建”。
- 移除站内显式求职导向文案。
- 架构文档。
- 项目交接文档。
- copyright：`Copyright © 2026-present 碧影`。

## 6. 碧影设定

碧影是网站的男性数字分身，不是作者本人，也不是完全通用客服。

性格：

- 细致
- 内敛
- 温柔
- 有边界感
- 说话不浮夸

语气参考：

```txt
你好，很高兴认识你。
```

能力边界：

- 可以回答网站公开页面里的内容。
- 可以像 RAG 一样基于公开知识库回答。
- 可以与访客进行轻度闲聊。
- 不可以声称读取了未公开内容。
- 不可以生成违法乱纪、违背公序良德、脏话或恶意内容。
- 不要替作者做隐私承诺，不要编造作者经历。

## 7. 内容规范

新增中文页面时：

```yaml
---
title: 页面标题
public: true
avatar_readable: true
---
```

如果页面可以被碧影读取，设置：

```yaml
avatar_readable: true
```

如果只是网站页面但不希望碧影读取，设置：

```yaml
avatar_readable: false
```

新增英文页面时，应放在对应的 `docs/en/` 路径下，并在 `mkdocs.yml` 中加入英文导航。

原则：

- 中文为主，英文为同步版本。
- 不要把中英文内容堆在同一页面里。
- 用户点击语言切换后，应该是全站语言切换，不是单页局部切换。
- 新增页面后要同时维护中文导航和英文导航。
- 不要把导航切换逻辑写死成固定页面列表。

## 8. 笔记规范

原始笔记放在：

```txt
note/
```

当前有三篇原始讲义：

- `离散数学讲义.md`
- `SYS_计算机系统基础讲义.md`
- `FDS_数据结构基础讲义.md`

导入后生成页面在：

```txt
docs/zh/notes/
docs/en/notes/
```

建议不要直接大规模手改生成后的课程笔记页面。更好的做法是：

1. 修改 `note/` 原始内容，或修改 `scripts/import_course_notes.py`。
2. 重新运行导入脚本。
3. 重新生成公开知识库。
4. 构建验证。

数学公式注意：

- 行内公式使用 `$...$`。
- 块级公式使用 `$$...$$`。
- 不要把公式写成反引号代码，例如 `` `$n$` ``。
- 如果源文件中有这种格式，应由导入脚本自动修正。

## 9. 本地运行命令

进入项目：

```powershell
cd C:\Users\17597\Desktop\codex\biying-digital-garden
```

启动本地预览：

```powershell
.venv\Scripts\mkdocs serve
```

访问：

```txt
http://127.0.0.1:8000/zh/
```

构建：

```powershell
.venv\Scripts\mkdocs build --strict
```

生成碧影公开知识库：

```powershell
.venv\Scripts\python scripts\build_knowledge.py
```

检查公开范围：

```powershell
.venv\Scripts\python scripts\validate_public_scope.py
```

检查 JS 语法：

```powershell
node --check docs\assets\javascripts\language-switch.js
node --check docs\assets\javascripts\biying-chat.js
node --check docs\assets\javascripts\guestbook.js
node --check edge-functions\api\chat.js
node --check edge-functions\api\messages.js
node --check edge-functions\api\admin-messages.js
```

本地 `mkdocs serve` 下如果看到：

```txt
GET /api/messages 404
```

这是正常的。MkDocs 本地静态服务器不会运行 EdgeOne Functions。留言 API 需要部署到 EdgeOne 后才可用。

## 10. EdgeOne 部署目标

第一阶段先不买域名，使用 EdgeOne Pages 免费域名。

EdgeOne Pages 构建配置：

```txt
Install command: pip install -r requirements.txt
Build command: python scripts/build_knowledge.py && mkdocs build --strict
Output directory: ./site
```

后端接口：

```txt
/api/chat
/api/messages
/api/admin-messages
```

KV 建议：

```txt
BIYING_KV
```

可能需要的环境变量：

```txt
OPENAI_API_KEY 或 DEEPSEEK_API_KEY
OPENAI_BASE_URL
OPENAI_MODEL
BIYING_ADMIN_TOKEN
```

如果未来全程腾讯系，可以再评估：

- 腾讯混元 API
- EdgeOne Pages 的 Edge AI / DeepSeek 能力

但当前优先级是先跑通功能，不要过早绑定特定模型供应商。

## 11. 下一步任务建议

优先级从高到低：

1. 确认 `https://www.biying.site/` 上的 EdgeOne Pages 静态网站能访问。
2. 保持 `mkdocs.yml` 的 `site_url` 为 `https://www.biying.site/`。
3. 配置 EdgeOne Functions，让 `/api/auth`、`/api/messages`、`/api/chat` 不再 404。
4. 配置 EdgeOne KV，让账户、会话和公开留言可以持久化。
5. 配置 `/api/chat` 的模型密钥，让登录用户可以和碧影真实对话。
6. 将 `docs/assets/knowledge/public-knowledge.json` 接入到碧影检索流程。
7. 增加基础防刷逻辑，例如留言长度限制、频率限制、简单敏感词过滤。
8. 优化移动端阅读体验。
9. 完善英文翻译质量。
10. 增加更多真实项目页。
11. 网站稳定后，再考虑根域名 `https://biying.site/` 是否也要跳转到 `www.biying.site`。

## 12. 不要做的事

下一个 AI 请注意：

- 不要重建整个项目。
- 不要删除用户已有内容。
- 不要把网站改成简历站或营销站。
- 不要把“面向 HR”写进网页文案。
- 不要把未公开的本地文件加入碧影知识库。
- 不要硬编码中英文导航页面列表。
- 不要直接把 API Key 写进仓库。
- 不要为了买域名阻塞当前功能开发。
- 不要在没有用户明确要求的情况下切换技术栈。

## 13. 推荐给下一个 AI 的开场指令

可以直接对下一个 AI 说：

```txt
这是一个延续项目。请先阅读项目根目录的 NEXT_AI_DEVELOPMENT_BRIEF.md、README.md、ARCHITECTURE.md、PROJECT_HANDOFF.md、mkdocs.yml 和最近的 git diff，然后总结你理解的当前状态。不要重建项目。接下来优先帮我把 EdgeOne Pages 免费域名部署、Functions、KV、碧影聊天和公开留言跑通。
```
