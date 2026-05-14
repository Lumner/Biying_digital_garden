# Project Handoff

## 项目目标

这是一个基于 MkDocs Material 的双语个人数字网站，目标是沉淀个人课程笔记、项目经历、当前状态和长期公开表达，同时接入男性虚构数字分身「碧影」作为公开内容的对话入口。

网站不是单一用途展示页，而是一个可以长期维护的个人数字花园：

- 中文/英文双语页面
- 课程笔记与项目经历
- 数学公式渲染
- 公开留言板
- 数字分身碧影
- EdgeOne Pages / Functions / KV 部署路线

碧影只读取网站公开内容，不读取未发布草稿、本地文件、GitHub 活动或私人资料。

## 技术栈

- 静态站点：MkDocs + MkDocs Material
- 内容格式：Markdown
- 数学公式：Pymdown Extensions + MathJax
- 前端脚本：原生 JavaScript
- 样式：自定义 CSS，主要在 `docs/assets/styles/cyber.css`
- 知识库：构建时生成 `docs/assets/knowledge/public-knowledge.json`
- 数字分身 API：EdgeOne Functions 风格接口
- 留言存储：计划使用 EdgeOne KV
- AI 模型：DeepSeek 优先，OpenAI 兼容接口预留
- CI：GitHub Actions
- 部署：EdgeOne Pages

## 当前状态

已完成：

- 初始化 MkDocs Material 项目
- 完成中英文页面结构
- 完成赛博风格视觉
- 完成首页、关于、现在、笔记、项目、碧影、留言页面
- 完成中英文语言切换
- 完成英文版左侧目录恢复：中英文导航都保留在 `mkdocs.yml`，前端按当前语言隐藏另一套
- 完成 MathJax 配置
- 导入三篇课程讲义：
  - 离散数学讲义
  - 计算机系统基础讲义
  - FDS 数据结构基础讲义
- 修复课程笔记中被反引号包住的公式，保证能被 MathJax 渲染
- 长课程笔记的章节目录已进入右侧目录栏
- 完成碧影 persona 设定
- 完成碧影聊天前端和 API 雏形
- 完成账户注册/登录 API 雏形
- 完成留言板前端和 API 雏形，支持登录用户编辑/删除自己的留言
- 完成合并后的项目页：个人数字花园与碧影
- 删除站内面向特定用途的显式求职导向文案，让网站保持个人数字空间气质
- 完成 `ARCHITECTURE.md` 架构说明
- 完成 Git 初始提交

当前 git 基线：

```txt
05ec0d9 Initial Biying digital garden baseline
```

## 最近修改

最近一轮主要做了这些事情：

1. 清理站内显式求职导向文本。
2. 重新生成碧影公开知识库。
3. 新增 `ARCHITECTURE.md`，详细说明项目架构和每个文件作用。
4. 执行 Git 初始化基线提交。
5. 新增当前交接文档 `PROJECT_HANDOFF.md`。

## 如何运行

项目目录：

```txt
C:\Users\17597\Desktop\codex\biying-digital-garden
```

本地预览：

```powershell
cd C:\Users\17597\Desktop\codex\biying-digital-garden
.venv\Scripts\mkdocs serve
```

打开：

```txt
http://127.0.0.1:8000/zh/
```

如果没有 `.venv`，先安装依赖：

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

构建：

```powershell
.venv\Scripts\python scripts\build_knowledge.py
.venv\Scripts\python scripts\validate_public_scope.py
.venv\Scripts\mkdocs build --strict
```

如果修改了 JS：

```powershell
node --check docs\assets\javascripts\language-switch.js
node --check docs\assets\javascripts\biying-chat.js
node --check docs\assets\javascripts\guestbook.js
node --check edge-functions\api\chat.js
node --check edge-functions\api\messages.js
node --check edge-functions\api\admin-messages.js
```

## 关键文件

### 项目说明

- `README.md`：快速上手说明
- `ARCHITECTURE.md`：完整架构与文件职责说明
- `PROJECT_HANDOFF.md`：当前交接文档
- `DEPLOYMENT.md`：EdgeOne 部署说明
- `AGENTS.md`：多 Agent 分工说明

### 核心配置

- `mkdocs.yml`：MkDocs 主配置、导航、主题、JS/CSS 入口
- `requirements.txt`：Python 依赖
- `package.json`：Node/EdgeOne CLI 预留配置
- `.github/workflows/ci.yml`：GitHub CI

### 内容目录

- `docs/zh/`：中文页面
- `docs/en/`：英文页面
- `docs/zh/notes/`：中文笔记
- `docs/en/notes/`：英文笔记
- `docs/zh/projects/`：中文项目
- `docs/en/projects/`：英文项目

### 静态资源

- `docs/assets/styles/cyber.css`：全站视觉样式
- `docs/assets/javascripts/language-switch.js`：语言切换与导航过滤
- `docs/assets/javascripts/mathjax.js`：数学公式配置
- `docs/assets/javascripts/biying-chat.js`：碧影聊天前端
- `docs/assets/javascripts/guestbook.js`：留言板前端
- `docs/assets/knowledge/public-knowledge.json`：碧影公开知识库，自动生成，不要手改
- `docs/assets/images/favicon.svg`：站点图标

### 脚本

- `scripts/import_course_notes.py`：从 `note/` 导入课程讲义，整理标题、公式和英文 companion 页面
- `scripts/build_knowledge.py`：生成碧影公开知识库
- `scripts/validate_public_scope.py`：检查公开内容中的敏感词
- `scripts/translate.py`：预留 AI 翻译脚本

### 碧影

- `data/biying.persona.md`：碧影长期人格设定
- `edge-functions/api/chat.js`：真实聊天 API prompt 和模型调用逻辑
- `docs/zh/avatar/index.md`：中文碧影页面
- `docs/en/avatar/index.md`：英文碧影页面

### 留言

- `docs/zh/guestbook/index.md`：中文留言页
- `docs/en/guestbook/index.md`：英文留言页
- `edge-functions/api/messages.js`：留言提交和读取
- `edge-functions/api/admin-messages.js`：管理员删除留言

### 原始课程讲义

- `note/离散数学讲义.md`
- `note/SYS_计算机系统基础讲义.md`
- `note/FDS_数据结构基础讲义.md`

这些是课程笔记的源文件。不要优先手改 `docs/zh/notes/*lecture.md`，因为它们会被 `scripts/import_course_notes.py` 覆盖。

## 已知问题

1. 英文课程笔记目前是 companion/overview 版本，不是完整逐句翻译。
2. 碧影聊天后端还没有在真实 EdgeOne 环境里配置 API Key、KV 和限流。
3. 留言系统已有登录、编辑和删除雏形，但缺少完善的管理后台、审核、防刷和更完整的管理员 UI。
4. 语言切换通过前端 JS 隐藏另一套导航，静态 HTML 里仍然同时存在中英文导航；页面加载后才会过滤。
5. MathJax 当前通过 CDN 加载主脚本，国内访问更稳的方案是把 MathJax 资源本地化到 `docs/assets/vendor/`。
6. `mkdocs serve/build` 会显示 MkDocs Material 关于 MkDocs 2.0 的提示，这不是当前项目错误。
7. 浏览器插件在当前 Codex 桌面环境里多次超时，主要验证依赖命令行构建和静态 HTML 检查。

## 下一步计划

优先级从高到低：

1. 确认 EdgeOne Pages 部署在 `https://www.biying.site/` 下稳定可访问。
2. 保持 `mkdocs.yml` 中的 `site_url: https://www.biying.site/` 与正式域名一致。
3. 配置 EdgeOne Functions、KV、模型 API Key，让注册、碧影聊天和留言系统真正在线。
4. 将 MathJax 改成本地资源，降低国内访问不稳定风险。
5. 为英文课程笔记接入翻译 API 或人工校对，逐步补完整英文内容。
6. 增加更多真实项目页，继续完善项目经历。
7. 加入留言管理界面，支持删除、隐藏、反垃圾和限流。
8. 优化移动端视觉和长笔记阅读体验。
9. 给碧影回答增加更清晰的来源引用展示。
10. 保持 GitHub 与 EdgeOne Pages 自动部署链路同步。

## 约定

- 中文是主源，英文同步维护。
- 新增页面时，`mkdocs.yml` 里中英文导航要成对添加。
- 想让碧影读取页面，frontmatter 必须包含：

```yaml
public: true
avatar_readable: true
```

- 不要手改 `docs/assets/knowledge/public-knowledge.json`，它由脚本生成。
- 不要手改由课程导入脚本生成的课程讲义页，优先改 `note/` 原文或 `scripts/import_course_notes.py`。
- 改完内容后至少运行：

```powershell
.venv\Scripts\python scripts\build_knowledge.py
.venv\Scripts\python scripts\validate_public_scope.py
.venv\Scripts\mkdocs build --strict
```

## 下个会话建议开场

下次继续时，可以直接对 Codex 说：

```txt
这是一个延续项目。请先阅读项目根目录的 PROJECT_HANDOFF.md、ARCHITECTURE.md、README.md 和最近的 git diff，然后总结你理解的当前状态，再继续完成 PROJECT_HANDOFF.md 里的下一步任务。
```
