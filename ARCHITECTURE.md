# 项目架构说明

这份文档用于帮助你以后自己修改、扩展和部署这个个人数字网站。

项目目标是：用 MkDocs 构建一个双语个人网站，展示个人介绍、当前状态、课程笔记、项目经历、留言板，并接入数字分身「碧影」。碧影只读取网站公开内容，通过公开知识库回答问题。

## 总体架构

```txt
Markdown 内容
  ↓
scripts/build_knowledge.py 生成公开知识库
  ↓
MkDocs Material 构建静态网站
  ↓
site/ 静态产物
  ↓
EdgeOne Pages 部署

访客浏览器
  ├─ language-switch.js 语言切换
  ├─ mathjax.js 数学公式渲染
  ├─ auth.js 注册、登录和会话前端
  ├─ admin-dashboard.js 站点主人后台前端
  ├─ biying-chat.js 碧影聊天前端
  └─ guestbook.js 留言板前端

EdgeOne Functions
  ├─ /api/chat 碧影聊天接口
  ├─ /api/messages 留言接口
  ├─ /api/private-messages 私信接口
  ├─ /api/admin 站点主人后台接口
  └─ /api/admin-messages 管理删除接口
```

## 根目录文件

### `mkdocs.yml`

MkDocs 主配置文件。这里决定：

- 网站名称、描述、作者、仓库链接
- Material 主题配置
- 顶部和侧边栏导航
- 中英文页面导航
- Markdown 扩展
- MathJax、语言切换、碧影聊天、留言板等 JS 入口
- 自定义 CSS 入口

以后新增页面时，大概率需要改这里。

例如新增一篇中英文笔记：

```yaml
- 新笔记: zh/notes/new-note.md
- New Note: en/notes/new-note.md
```

### `README.md`

项目快速说明。适合放：

- 项目是什么
- 如何本地运行
- 如何构建
- 基本部署方式
- 内容规则
- 双语导航规则

如果别人第一次打开仓库，应该先看这个文件。

### `ARCHITECTURE.md`

当前这份架构说明文档。用于解释项目结构和每个文件的职责。

### `DEPLOYMENT.md`

部署说明。主要记录：

- 如何推送到 GitHub
- EdgeOne Pages 构建命令
- Functions 路由
- 环境变量
- KV 绑定
- 无备案访问建议

部署时看这个文件。

### `AGENTS.md`

多 Agent 协作说明。里面把项目拆成：

- 产品 Agent
- 视觉 Agent
- 内容 Agent
- 数学公式 Agent
- 碧影 Agent
- 留言 Agent
- 部署 Agent

以后你让 AI 继续改项目时，可以直接指定角色。

### `requirements.txt`

Python 依赖列表。当前用于安装：

- `mkdocs`
- `mkdocs-material`
- `pymdown-extensions`
- `pyyaml`

本地第一次运行时：

```powershell
pip install -r requirements.txt
```

### `package.json`

Node 侧配置。当前主要用于预留 EdgeOne CLI：

- `edgeone:dev`
- `knowledge`

目前网站核心构建仍然依赖 Python 和 MkDocs。

## `docs/` 网站内容目录

`docs/` 是 MkDocs 的内容根目录。所有会被构建成网页的 Markdown、CSS、JS、图片、知识库文件都在这里。

### `docs/index.md`

网站根入口页。它会根据浏览器语言跳转到：

- `/zh/`
- `/en/`

这个页面不在导航里展示。

## 中文页面：`docs/zh/`

### `docs/zh/index.md`

中文首页。负责展示：

- 第一屏视觉
- 碧影入口
- 笔记、项目、留言等主要入口
- 网站适合哪些访客阅读

想改中文首页文案、按钮、首页卡片，就改这里。

### `docs/zh/about.md`

中文关于页。负责介绍：

- 你是谁
- 你的兴趣方向
- 当前关键词
- 如何了解你

这是个人介绍的核心页面。

### `docs/zh/now.md`

中文 Now 页面。负责说明你最近在做什么。

适合经常更新，例如：

- 正在推进的项目
- 正在学习的内容
- 当前生活与学习状态
- 暂不做什么

### `docs/zh/avatar/index.md`

中文碧影页面。包含：

- 碧影的公开说明
- 碧影聊天组件挂载点
- 可提问示例

聊天框本身由 `docs/assets/javascripts/biying-chat.js` 实现。

### `docs/zh/guestbook/index.md`

中文留言页。包含留言板挂载点。

留言板本身由 `docs/assets/javascripts/guestbook.js` 实现。

### `docs/zh/register/index.md`

中文注册/登录页。包含账户组件挂载点，也承载忘记密码时联系站点主人的私信入口。

账户组件本身由 `docs/assets/javascripts/auth.js` 实现。

### `docs/zh/admin/index.md`

中文站点主人后台页。默认不进入公开导航，用于查看注册用户、私信收件箱，并签发一次性恢复码。

### `docs/zh/notes/index.md`

中文笔记首页。负责展示笔记入口卡片。

新增中文笔记后，建议在这里加一个卡片入口。

### `docs/zh/notes/public-scope.md`

公开边界说明。告诉访客和碧影：

- 哪些内容可以读取
- 哪些内容不能读取
- 不知道时如何回答

这页对碧影的行为边界很重要。

### `docs/zh/notes/math-lab.md`

数学公式测试页。用于确认 MathJax 是否正常工作。

如果这里公式能渲染，而其他笔记不能渲染，通常说明其他笔记的公式写法有问题。

### `docs/zh/notes/discrete-math-lecture.md`

中文离散数学讲义页面。

这个文件由 `scripts/import_course_notes.py` 从 `note/离散数学讲义.md` 生成。  
不建议手改生成后的文件，最好改 `note/` 原文或导入脚本。

### `docs/zh/notes/computer-systems-lecture.md`

中文计算机系统基础讲义页面。

由 `scripts/import_course_notes.py` 从 `note/SYS_计算机系统基础讲义.md` 生成。

### `docs/zh/notes/fds-data-structures-lecture.md`

中文 FDS 数据结构基础讲义页面。

由 `scripts/import_course_notes.py` 从 `note/FDS_数据结构基础讲义.md` 生成。

### `docs/zh/projects/index.md`

中文项目首页。负责展示所有中文项目卡片。

新增项目时通常要改这里。

### `docs/zh/projects/personal-site-avatar.md`

项目页：个人数字花园与碧影。

这是合并后的主网站项目页，说明这个站点如何把公开笔记、项目记录、留言板和数字分身碧影放在同一个长期入口里。页面包含：

- 背景
- 技术栈
- 你做了什么
- 当前成果
- 后续改进

## 英文页面：`docs/en/`

英文页面和中文页面结构对应。

### `docs/en/index.md`

英文首页。

### `docs/en/about.md`

英文关于页。

### `docs/en/now.md`

英文 Now 页面。

### `docs/en/avatar/index.md`

英文碧影页面。

### `docs/en/guestbook/index.md`

英文留言页。

### `docs/en/register/index.md`

英文账户页，也包含私信站点主人的找回密码入口。

### `docs/en/admin/index.md`

英文站点主人后台页。

### `docs/en/notes/index.md`

英文笔记首页。

### `docs/en/notes/public-scope.md`

英文公开边界说明。

### `docs/en/notes/math-lab.md`

英文数学公式测试页。

### `docs/en/notes/discrete-math-lecture.md`

英文离散数学讲义 companion 页面。

当前不是完整逐句翻译，而是英文概览页。后续可以接翻译 API 生成完整英文版。

### `docs/en/notes/computer-systems-lecture.md`

英文计算机系统基础讲义 companion 页面。

### `docs/en/notes/fds-data-structures-lecture.md`

英文 FDS 数据结构基础讲义 companion 页面。

### `docs/en/projects/index.md`

英文项目首页。

### `docs/en/projects/personal-site-avatar.md`

英文项目页：Personal Digital Garden + Biying。

## 静态资源：`docs/assets/`

### `docs/assets/styles/cyber.css`

全站自定义样式。负责：

- 赛博风格背景
- 首页 hero
- 卡片
- 碧影视觉终端
- 语言切换按钮
- 聊天框
- 留言板
- 响应式布局

如果你想改网站视觉，主要改这里。

### `docs/assets/javascripts/mathjax.js`

MathJax 配置。负责让 Markdown 里的数学公式正常渲染。

支持：

```md
$E = mc^2$

$$
\nabla \cdot \vec{E} = \frac{\rho}{\epsilon_0}
$$
```

### `docs/assets/javascripts/language-switch.js`

语言切换脚本。负责：

- 判断当前页面是 `/zh/` 还是 `/en/`
- 顶部显示 `中文 / EN` 切换按钮
- 根据当前语言隐藏另一套导航

后续新增页面时，不需要改这个脚本。只要在 `mkdocs.yml` 里成对添加中英文页面即可。

### `docs/assets/javascripts/auth.js`

注册、登录和会话前端。负责：

- 渲染账户页面
- 调用 `/api/auth`
- 调用 `/api/private-messages`
- 把登录 token 存在浏览器 `localStorage`
- 给留言和碧影聊天提供 `Authorization` header
- 触发登录状态变化事件

如果你想改账户页面文案或登录状态展示，改这里。

### `docs/assets/javascripts/admin-dashboard.js`

站点主人后台前端。负责：

- 使用 `BIYING_ADMIN_TOKEN` 访问 `/api/admin`
- 展示注册用户列表
- 展示私信收件箱
- 标记私信已读/未读
- 删除私信
- 为指定用户签发带时效的一次性恢复码

### `docs/assets/javascripts/biying-chat.js`

碧影聊天前端。负责：

- 渲染聊天框
- 检查登录状态
- 调用 `/api/chat`
- 如果 API 没部署，则退回本地公开知识库回答
- 加载 `docs/assets/knowledge/public-knowledge.json`

如果你想改聊天框文案或前端行为，改这里。

### `docs/assets/javascripts/guestbook.js`

留言板前端。负责：

- 渲染留言表单
- 检查登录状态
- 获取 `/api/messages`
- 提交留言到 `/api/messages`
- 编辑和删除当前登录用户自己的留言

如果你想改留言板交互，改这里。

### `docs/assets/images/favicon.svg`

网站图标和 logo。

### `docs/assets/knowledge/public-knowledge.json`

碧影公开知识库。由 `scripts/build_knowledge.py` 自动生成。

碧影前端 fallback 和后端 API 都可以读取它。  
不要手动编辑这个文件，应该通过修改 Markdown 页面后重新运行：

```powershell
.venv\Scripts\python scripts\build_knowledge.py
```

## 主题覆盖：`docs/overrides/`

### `docs/overrides/main.html`

MkDocs Material 的模板覆盖文件。当前用于显示顶部公告：

```txt
BIYING ONLINE / 公开内容驱动 / Public knowledge only
```

如果想改顶部公告，改这里。

## 碧影设定：`data/`

### `data/biying.persona.md`

碧影的人格设定文档。当前定义：

- 细致、内敛、温柔
- 只读取公开内容
- 可以回答公开内容和闲聊
- 不能编造未公开经历
- 不能输出违法、粗俗、违背公序良德的内容

注意：当前真正传给模型的 prompt 在 `edge-functions/api/chat.js` 里。  
这个 persona 文件更像长期设定文档，方便你维护角色。

## 原始笔记：`note/`

`note/` 存放课程讲义原文。

### `note/离散数学讲义.md`

离散数学原始讲义。

### `note/SYS_计算机系统基础讲义.md`

计算机系统基础原始讲义。

### `note/FDS_数据结构基础讲义.md`

FDS 数据结构基础原始讲义。

这些文件是导入脚本的源文件。  
如果要重新生成课程笔记页面，运行：

```powershell
.venv\Scripts\python scripts\import_course_notes.py
```

## 脚本：`scripts/`

### `scripts/import_course_notes.py`

课程笔记导入脚本。负责：

- 从 `note/` 读取三篇课程讲义
- 生成 `docs/zh/notes/*lecture.md`
- 生成 `docs/en/notes/*lecture.md` 英文 companion 页面
- 给课程标题整理层级
- 给章节标题生成稳定锚点
- 把被反引号包住的 LaTeX 公式恢复成可渲染公式
- 把缺失图片替换成提示块

如果你新增课程讲义，可以扩展这个脚本里的 `COURSES` 配置。

### `scripts/build_knowledge.py`

公开知识库生成脚本。负责：

- 扫描 `docs/**/*.md`
- 读取 frontmatter
- 找出同时满足：

```yaml
public: true
avatar_readable: true
```

- 清理 Markdown 语法
- 生成 `docs/assets/knowledge/public-knowledge.json`

碧影能读什么，主要由这个脚本和每篇文章的 frontmatter 决定。

### `scripts/validate_public_scope.py`

公开内容检查脚本。负责简单检查 `avatar_readable: true` 的页面里是否出现明显敏感词。

目前检查：

- `secret`
- `api_key`
- `password`

它不是完整安全审计，只是一个轻量防呆工具。

### `scripts/translate.py`

翻译脚本。设计目标是把中文 Markdown 翻译成英文 Markdown。

它会保护：

- frontmatter
- 代码块
- 数学公式
- 路径和命令

使用前需要配置：

```txt
DEEPSEEK_API_KEY
```

或：

```txt
OPENAI_API_KEY
```

当前英文课程笔记还不是完整逐句翻译，后续可以用这个脚本继续完善。

## EdgeOne Functions：`edge-functions/api/`

这些文件是未来部署到 EdgeOne Pages Functions 的 API。

### `edge-functions/api/chat.js`

碧影聊天 API。负责：

- 校验登录 session
- 接收用户问题
- 读取 KV 中的 `public_knowledge`
- 如果 KV 没有，则读取静态 `public-knowledge.json`
- 检索相关公开内容
- 构造 prompt
- 调用 DeepSeek 或 OpenAI 兼容接口
- 返回碧影回答和来源

这里包含真正传给模型的 `PERSONA` prompt。  
如果你要调整碧影行为，通常要同时看：

- `data/biying.persona.md`
- `edge-functions/api/chat.js`

### `edge-functions/api/auth.js`

账户 API。负责：

- `POST /api/auth` 注册或登录
- `GET /api/auth` 校验当前 session
- `DELETE /api/auth` 退出登录
- 使用 EdgeOne KV 保存 `user_*` 和 `session_*`
- 读取 `recovery_*` 一次性恢复码并校验时效
- 使用 PBKDF2 保存密码哈希，不保存明文密码

注册和登录依赖 KV 绑定：

```txt
BIYING_KV
```

### `edge-functions/api/messages.js`

留言 API。负责：

- `GET /api/messages` 获取留言
- `POST /api/messages` 提交登录用户留言
- `PUT /api/messages?id=...` 编辑自己的留言
- `DELETE /api/messages?id=...` 删除自己的留言
- 写入 EdgeOne KV
- 简单过滤空内容和蜜罐字段
- 返回 `canEdit` 供前端展示编辑/删除按钮

当前留言是公开展示路线。后续可以扩展审核、限流、反垃圾和更完整的管理员界面。

### `edge-functions/api/private-messages.js`

私信接口。负责：

- `POST /api/private-messages` 接收访客发给站点主人的私信
- 记录姓名、联系方式、可选关联用户名和正文
- 写入 EdgeOne KV 的 `private_message_*`
- 使用蜜罐字段过滤一部分自动化垃圾提交

### `edge-functions/api/admin.js`

站点主人后台接口。负责：

- 检查 `BIYING_ADMIN_TOKEN`
- `GET /api/admin` 汇总注册用户与私信
- `POST /api/admin` 为指定用户名签发一次性恢复码
- `PUT /api/admin?id=...` 标记私信已读/未读
- `DELETE /api/admin?id=...` 删除私信
- 把恢复码哈希写入 `recovery_*`，并保存过期时间

### `edge-functions/api/admin-messages.js`

管理员删除留言 API。负责：

- 检查 `BIYING_ADMIN_TOKEN`
- 按留言 id 删除 KV 中的留言

部署后需要配置环境变量：

```txt
BIYING_ADMIN_TOKEN=你的管理 token
```

## GitHub Actions

### `.github/workflows/ci.yml`

CI 文件。负责在 GitHub 上自动验证：

- 安装 Python 依赖
- 运行公开范围检查
- 生成知识库
- 构建 MkDocs

以后推到 GitHub 后，每次提交可以自动检查网站是否能构建。

## 生成目录和本地环境

### `.venv/`

Python 虚拟环境。里面安装了 MkDocs 等依赖。  
它被 `.gitignore` 忽略，不应该提交。

### `site/`

MkDocs 构建输出目录。运行下面命令后生成：

```powershell
.venv\Scripts\mkdocs build
```

它被 `.gitignore` 忽略，不应该提交。

### `.gitignore`

Git 忽略规则。当前忽略：

- `.venv/`
- `__pycache__/`
- `.cache/`
- `site/`
- `.env`
- `node_modules/`
- EdgeOne 输出目录
- 本地日志
- 其他不应提交的资料目录

## 常见修改任务

### 修改个人介绍

改：

- `docs/zh/about.md`
- `docs/en/about.md`

然后运行：

```powershell
.venv\Scripts\python scripts\build_knowledge.py
.venv\Scripts\mkdocs build --strict
```

### 修改当前状态

改：

- `docs/zh/now.md`
- `docs/en/now.md`

### 新增项目页

1. 新建：

```txt
docs/zh/projects/your-project.md
docs/en/projects/your-project.md
```

2. 修改：

```txt
docs/zh/projects/index.md
docs/en/projects/index.md
mkdocs.yml
```

3. 如果希望碧影读取，frontmatter 加：

```yaml
public: true
avatar_readable: true
```

### 新增普通笔记

1. 新建：

```txt
docs/zh/notes/your-note.md
docs/en/notes/your-note.md
```

2. 修改：

```txt
docs/zh/notes/index.md
docs/en/notes/index.md
mkdocs.yml
```

3. 重新生成知识库。

### 更新课程讲义

1. 修改 `note/` 中的原始讲义。
2. 运行：

```powershell
.venv\Scripts\python scripts\import_course_notes.py
.venv\Scripts\python scripts\build_knowledge.py
.venv\Scripts\mkdocs build --strict
```

不要优先手改 `docs/zh/notes/*lecture.md`，因为它们会被导入脚本覆盖。

### 修改碧影性格

改：

- `data/biying.persona.md`
- `edge-functions/api/chat.js`
- `docs/zh/avatar/index.md`
- `docs/en/avatar/index.md`

如果只是页面介绍，改 Markdown 即可。  
如果要影响真实模型回答，必须改 `edge-functions/api/chat.js` 里的 `PERSONA`。

### 修改视觉风格

主要改：

```txt
docs/assets/styles/cyber.css
```

### 修改语言切换

主要改：

```txt
docs/assets/javascripts/language-switch.js
```

但新增页面时通常不需要改它，只需要在 `mkdocs.yml` 里维护中英文导航。

### 修改留言板

前端改：

```txt
docs/assets/javascripts/guestbook.js
docs/zh/guestbook/index.md
docs/en/guestbook/index.md
```

后端改：

```txt
edge-functions/api/messages.js
edge-functions/api/private-messages.js
edge-functions/api/admin.js
edge-functions/api/admin-messages.js
```

## 推荐工作流

每次改完内容后，建议运行：

```powershell
.venv\Scripts\python scripts\build_knowledge.py
.venv\Scripts\python scripts\validate_public_scope.py
.venv\Scripts\mkdocs build --strict
```

如果改了 JS，再加：

```powershell
node --check docs\assets\javascripts\language-switch.js
node --check docs\assets\javascripts\biying-chat.js
node --check docs\assets\javascripts\guestbook.js
node --check docs\assets\javascripts\admin-dashboard.js
node --check edge-functions\api\chat.js
node --check edge-functions\api\messages.js
node --check edge-functions\api\private-messages.js
node --check edge-functions\api\admin.js
node --check edge-functions\api\admin-messages.js
```

本地预览：

```powershell
.venv\Scripts\mkdocs serve
```

打开：

```txt
http://127.0.0.1:8000/zh/
```
