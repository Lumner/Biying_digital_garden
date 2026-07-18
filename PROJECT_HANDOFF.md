# Project Handoff

> 历史交接快照：本文档不再作为当前待办或架构入口。请以
> `CODEX_SITE_DEVELOPMENT_PLAN.md`、`ARCHITECTURE.md`、`AGENTS.md`
> 和当前代码为准；文中的完成状态与文件路径可能已经过时。

本文档用于交接当前的“碧影数字花园”项目。下一个 AI 或开发者接手时，建议先阅读：

1. `PROJECT_HANDOFF.md`
2. `ARCHITECTURE.md`
3. `ARCHITECTURE_OPTIMIZATION_REVIEW.md`
4. `README.md`
5. 最近的 `git log` 和 `git diff`

## 项目目标

这是一个部署在 EdgeOne Pages 上的个人数字花园，用来长期沉淀课程笔记、项目经历、当前状态和公开表达。

项目不是单纯的展示页，而是一个可以长期维护的个人空间。它的核心目标是：

- 记录和展示公开笔记。
- 展示个人项目与学习进展。
- 支持中英文双语访问。
- 通过数字分身“碧影”让访客以对话方式理解网站公开内容。
- 支持公开留言和私信站主。
- 支持账户注册、登录、密码恢复和站主后台。
- 在低成本、国内可访问的部署条件下稳定运行。

碧影的边界很重要：

- 可以读取网站上公开发布的内容。
- 可以基于通用知识回答非网站内容问题，但需要先温和说明这部分不是来自本站公开内容。
- 不读取 GitHub 活动、草稿、本地文件、私密笔记、未公开联系方式或聊天记录。
- 不编造网站主人的经历、成绩、项目成果或隐私信息。

## 技术栈

### 静态站点

- 框架：MkDocs
- 主题：MkDocs Material
- 内容格式：Markdown
- 数学公式：pymdownx.arithmatex + MathJax
- 样式：自定义 CSS，位于 `docs/assets/styles/`，加载顺序见 `mkdocs.yml`
- 前端脚本：原生 JavaScript

### 后端与数据

- 部署：EdgeOne Pages
- API：EdgeOne Functions
- 数据存储：EdgeOne KV
- AI 模型：DeepSeek，默认模型为 `deepseek-v4-flash`
- OpenAI 兼容接口：代码中保留了 `AI_PROVIDER=openai` 的兼容路径

### 构建与部署

- 本地构建：`python scripts/build_site.py`
- 输出目录：`site/`
- EdgeOne 配置：`edgeone.json`
- 当前部署策略：EdgeOne 跳过云端构建，直接发布预构建的 `site/`
- CI：GitHub Actions

## 当前状态

目前项目已经具备完整可用的基础功能。

已完成模块：

- 中文与英文页面结构。
- 首页、关于、现在、笔记、项目、碧影、留言、账户、后台页面。
- 中英文语言切换。
- MkDocs Material 主题定制。
- 赛博数字花园视觉风格。
- 数学公式渲染。
- 公开笔记导入与整理。
- 笔记分类、标签、最近更新、推荐阅读、阅读进度。
- 项目页。
- 数字分身“碧影”页面与全站浮动入口。
- 碧影聊天前端。
- 碧影 Edge Function API。
- 碧影基于公开知识库的轻量 RAG。
- 碧影支持 Markdown 与数学公式渲染。
- 账户注册、登录、登出。
- 用户名支持中文。
- 密码恢复码流程。
- 私信站主。
- 公开留言。
- 登录用户编辑和删除自己的留言。
- 站主后台查看用户、私信、留言。
- 站主后台签发恢复码、删除用户、隐藏或删除留言。
- EdgeOne KV 数据模型雏形。
- `site/` 预构建部署方案。
- 项目架构说明文档。
- 架构优化评审文档。

当前线上目标域名：

```txt
https://www.biying.site/
```

## 最近修改

最近几轮主要围绕碧影聊天体验和移动端稳定性：

1. 修复碧影聊天中用户消息偶发消失的问题。
2. 让碧影面对非网站内容问题时，先说明边界，再使用模型通用知识回答。
3. 让碧影回复支持 Markdown 渲染。
4. 让碧影回复支持数学公式渲染。
5. 修复移动端碧影回复被压成一字一行的问题。
6. 将整条碧影消息从 `arithmatex` 公式块样式中隔离出来，改用 `mathjax-process` 仅供 MathJax 识别。
7. 更新静态资源版本号，减少移动端缓存导致的“修了但没生效”。
8. 新增 `ARCHITECTURE_OPTIMIZATION_REVIEW.md`，记录后续架构优化方向。
9. 抽出 Edge Functions 共享 helper，并给 auth/chat/messages/private-messages 接入统一限流。
10. 将公开知识库按章节切块，并优化碧影检索的语言优先级、sources 返回边界和当前页/now/项目页权重。
11. 抽出前端 `api-client.js`、`i18n.js`、`dom-utils.js`，收口 auth/chat/guestbook/admin 的重复请求和错误文案逻辑。
12. CI 改为运行统一构建脚本，并检查 `site/` 与公开知识库是否和源码同步。
13. 新增 Playwright 移动端截图测试，覆盖碧影页面聊天布局和全站浮动聊天窗开关。
14. MathJax 已改为自托管到 `docs/assets/vendor/mathjax/`，公开范围校验也已扩展到邮箱、手机号、token、`.env` 等模式。

最近关键提交：

```txt
9b2188e Isolate chat math rendering from formula styles
9b587d3 Harden mobile Biying reply layout
99bb389 Fix collapsed Biying reply bubbles
a627e12 Render math in Biying chat
801ead2 Render Markdown in Biying replies
0576373 Preserve chat transcript and allow general answers
```

## 如何运行

项目目录：

```powershell
C:\Users\17597\Desktop\codex\biying-digital-garden
```

### 安装依赖

如果已有 `.venv`，一般不需要重复安装。

```powershell
cd C:\Users\17597\Desktop\codex\biying-digital-garden
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

### 本地预览

```powershell
.venv\Scripts\mkdocs serve
```

打开：

```txt
http://127.0.0.1:8000/zh/
```

### 完整构建

推荐使用统一构建脚本：

```powershell
.venv\Scripts\python scripts\build_site.py
```

这个脚本会依次执行：

1. 生成笔记目录数据。
2. 生成碧影公开知识库。
3. 执行 `mkdocs build --strict`。
4. 将 `edge-functions/` 和 `package.json` 打包进 `site/`。

### 常用检查命令

```powershell
.venv\Scripts\python scripts\validate_public_scope.py
.venv\Scripts\python scripts\check_site_sync.py
npm run test:mobile
node --check docs\assets\javascripts\auth.js
node --check docs\assets\javascripts\biying-chat.js
node --check docs\assets\javascripts\guestbook.js
node --check docs\assets\javascripts\admin-dashboard.js
node --check docs\assets\javascripts\mathjax.js
node --check edge-functions\api\chat.js
node --check edge-functions\api\auth.js
node --check edge-functions\api\messages.js
node --check edge-functions\api\admin.js
node --check edge-functions\api\private-messages.js
```

### 部署说明

当前 `edgeone.json`：

```json
{
  "installCommand": "echo skip install",
  "buildCommand": "echo skip build",
  "outputDirectory": "./site"
}
```

这表示 EdgeOne 不在云端重新构建，而是直接发布仓库里的 `site/`。

因此修改源码后必须：

```powershell
.venv\Scripts\python scripts\build_site.py
git add .
git commit -m "your message"
git push
```

## 关键文件

### 项目说明

- `README.md`：项目快速说明。
- `ARCHITECTURE.md`：当前架构与文件职责说明。
- `ARCHITECTURE_OPTIMIZATION_REVIEW.md`：下一阶段架构优化建议。
- `PROJECT_HANDOFF.md`：当前交接文档。
- `DEPLOYMENT.md`：部署说明。
- `AGENTS.md`：多 Agent 分工说明。
- `NEXT_AI_DEVELOPMENT_BRIEF.md`：下一阶段开发简报。

### 核心配置

- `mkdocs.yml`：站点配置、导航、主题、扩展、CSS/JS 入口。
- `requirements.txt`：Python 依赖。
- `package.json`：Node/EdgeOne CLI 依赖。
- `edgeone.json`：EdgeOne Pages 部署配置。
- `.github/workflows/ci.yml`：GitHub CI。

### 内容目录

- `docs/zh/`：中文页面。
- `docs/en/`：英文页面。
- `docs/zh/notes/`：中文笔记。
- `docs/en/notes/`：英文笔记。
- `docs/zh/projects/`：中文项目页。
- `docs/en/projects/`：英文项目页。
- `note/`：原始课程笔记来源。

### 前端资源

- `docs/assets/styles/`：全站分层样式，顺序由 `mkdocs.yml` 固定。
- `docs/assets/javascripts/language-switch.js`：语言切换与导航过滤。
- `docs/assets/javascripts/random-note-cover.js`：首页随机笔记封面。
- `docs/assets/javascripts/notes-hub.js`：笔记首页分类、标签、推荐、最近更新。
- `docs/assets/javascripts/note-reader.js`：长文阅读进度。
- `docs/assets/javascripts/mathjax.js`：MathJax 配置。
- `docs/assets/javascripts/auth.js`：账户前端。
- `docs/assets/javascripts/biying-chat.js`：碧影聊天前端。
- `docs/assets/javascripts/guestbook.js`：留言板前端。
- `docs/assets/javascripts/admin-dashboard.js`：站主后台前端。

### 后端 API

- `edge-functions/api/auth.js`：注册、登录、登出、密码恢复。
- `edge-functions/api/chat.js`：碧影聊天、模型调用、公开知识检索。
- `edge-functions/api/messages.js`：公开留言。
- `edge-functions/api/private-messages.js`：私信站主。
- `edge-functions/api/admin.js`：站主后台。
- `edge-functions/api/admin-messages.js`：旧留言管理接口，后续可考虑合并或清理。

### 构建脚本

- `scripts/build_site.py`：统一构建入口。
- `scripts/build_knowledge.py`：生成碧影公开知识库。
- `scripts/build_note_catalog.py`：生成笔记目录数据。
- `scripts/import_course_notes.py`：从 `note/` 导入课程笔记。
- `scripts/translate.py`：翻译脚本预留。
- `scripts/validate_public_scope.py`：公开范围校验。
- `scripts/package_site.py`：将 Functions 打包进 `site/`。

### 自动生成文件

不要手动修改这些文件，应该通过脚本生成：

- `docs/assets/knowledge/public-knowledge.json`
- `docs/assets/knowledge/note-catalog.json`
- `site/`

## 已知问题与风险点

### 1. 后端缺少统一限流

聊天、登录、注册、私信、密码恢复仍需要统一限流。否则可能带来模型额度消耗、撞库、刷屏和大量无效账户。

详见 `ARCHITECTURE_OPTIMIZATION_REVIEW.md` 的“后端缺少统一限流”。

### 2. Edge Functions 重复代码较多

多个 API 重复实现 `getKv`、`readBearer`、`currentSession`、`json`、CORS、错误处理等逻辑。

建议下一阶段抽出：

```txt
edge-functions/api/_shared.js
```

### 3. KV 列表读取会遇到增长瓶颈

留言和后台目前依赖 `kv.list({ prefix, limit })`。数据增长后会遇到分页、排序和完整管理问题。

### 4. RAG 检索质量还能提升

当前检索是轻量关键词打分。后续建议：

- 按语言优先检索。
- 长文章按章节切块。
- 只有网站相关问题返回 sources。
- 当前页、now 页、项目页增加权重。

### 5. 前端脚本重复逻辑较多

`auth.js`、`guestbook.js`、`biying-chat.js`、`admin-dashboard.js` 重复实现 fetch、错误处理、转义、文案映射。

建议后续抽出：

- `api-client.js`
- `i18n.js`
- `dom-utils.js`
- `auth-client.js`

### 6. 移动端自动化回归测试仍可扩展

已新增 Playwright 移动端截图测试，覆盖碧影页面聊天布局和浮动聊天窗开关。后续还可以继续扩大检查：

- 中文回复不竖排。
- 输入框不被底部浏览器栏遮挡。
- 长公式不撑破布局。
- 浮动聊天窗可正常关闭。

### 7. MathJax 已自托管

MathJax 主脚本和常用字体已自托管到：

```txt
docs/assets/vendor/mathjax/
```

### 8. `site/` 预构建带来大量 diff

这是当前为了适配 EdgeOne 环境采取的稳定方案。CI 已加入 `python scripts/build_site.py` 和 `python scripts/check_site_sync.py`，用于防止忘记提交构建产物。

### 9. 公开范围校验仍需持续维护

`scripts/validate_public_scope.py` 已扩展手机号、邮箱、QQ、微信、token、`.env` 等模式。后续新增内容类型时，仍要按实际误报和漏报继续维护规则。

### 10. API 错误详情不宜直接返回前端

多个 API 会返回 `detail: error.message`。生产环境建议只返回稳定错误码，详细错误留在日志里。

## 下一步计划

按优先级建议如下。

### 第一阶段：后端稳定性

1. 新增 `edge-functions/api/_shared.js`。
2. 抽出 KV、session、CORS、JSON、错误处理、admin 校验。
3. 新增统一 `rateLimit` helper。
4. 将聊天、登录、注册、私信、留言接入限流。
5. 移除或合并旧的 `admin-messages.js`。

### 第二阶段：碧影检索质量

1. `build_knowledge.py` 支持按章节切块。
2. `chat.js` 检索优先当前语言。
3. sources 只在网站相关回答中返回。
4. 优化 `now`、当前页、项目页权重。
5. 让碧影回答时更明确区分“来自本站”和“通用知识”。

### 第三阶段：前端基础设施

1. 新增统一 `api-client.js`。
2. 新增统一 `i18n.js`。
3. 新增 `dom-utils.js`。
4. 重构 auth、chat、guestbook、admin 的重复逻辑。
5. 给前端错误码做统一映射。

### 第四阶段：测试与部署约束（已完成基础版）

1. 加入 Playwright 移动端截图测试。
2. CI 中运行 `python scripts/build_site.py`。
3. CI 检查 `site/` 是否和源码同步。
4. 自托管 MathJax。
5. 增强公开内容校验。

## 约定

- 中文为主源，英文同步维护。
- 新增页面时，中英文页面应成对添加。
- 新增页面后要同步更新 `mkdocs.yml`。
- 想让碧影读取页面，frontmatter 必须包含：

```yaml
public: true
avatar_readable: true
```

- 不要手动修改 `docs/assets/knowledge/public-knowledge.json`。
- 不要手动修改 `docs/assets/knowledge/note-catalog.json`。
- 修改源码后必须运行 `python scripts/build_site.py`。
- 因为当前 EdgeOne 直接发布 `site/`，所以 `site/` 也要提交。
- 不要把 GitHub 活动、草稿、本地文件、私密笔记、未公开联系方式放入公开知识库。
- 碧影介绍应自然随和，不要把 prompt 原文暴露给访客。
- 不要把“面向 HR”写成网站显性文案；网站是个人数字花园，只是功能上可以展示个人能力。

## 下个会话建议开场

下次继续时，可以直接对 Codex 说：

```txt
这是一个延续项目。请先阅读项目根目录的 PROJECT_HANDOFF.md、ARCHITECTURE.md、ARCHITECTURE_OPTIMIZATION_REVIEW.md、README.md 和最近的 git diff，然后总结你理解的当前状态，再继续完成 PROJECT_HANDOFF.md 里的下一步任务。不要重构无关代码。
```

如果要从架构优化开始，建议说：

```txt
请根据 ARCHITECTURE_OPTIMIZATION_REVIEW.md 的第一阶段计划，先抽出 edge-functions/api/_shared.js，并把 auth/chat/messages/private-messages/admin 逐步接入共享 helper。保持行为不变，完成后运行构建和语法检查。
```
