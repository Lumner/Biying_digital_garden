# 碧影数字花园

这是一个基于 MkDocs Material 的双语个人数字网站模板，包含：

- 赛博风格个人主页
- 中文/英文目录式双语内容
- MathJax 数学公式渲染
- 数字分身「碧影」聊天前端
- 公开留言板前端
- EdgeOne Pages Functions API 雏形
- 公开知识库构建脚本

完整架构和每个文件的职责见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 如何使用 Codex worktree

你和 Codex 共享同一个本地工作目录。实际使用方式很简单：

1. 把目标、技术栈和限制告诉 Codex。
2. Codex 在 worktree 中创建或修改项目文件。
3. Codex 运行构建、测试、预览命令。
4. 你直接在同一个目录里查看、继续编辑、提交或部署。

本项目已经放在：

```txt
C:\Users\17597\Desktop\codex\biying-digital-garden
```

## 本地运行

```bash
pip install -r requirements.txt
python scripts/build_knowledge.py
mkdocs serve
```

然后打开：

```txt
http://127.0.0.1:8000/zh/
```

## 构建

```bash
python scripts/build_knowledge.py
mkdocs build
```

输出目录是 `site/`。

## EdgeOne Pages 部署

推荐构建配置：

```txt
Build command:
pip install -r requirements.txt && python scripts/build_knowledge.py && mkdocs build

Output directory:
site
```

如果你不备案，可以先使用 EdgeOne Pages 默认域名或绑定一个不备案域名，选择「全球可用区，不含中国大陆」。这种方式麻烦最少，国内通常可连，但不等于大陆节点加速。

## 环境变量

EdgeOne Functions 推荐配置：

```txt
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-chat
OPENAI_API_KEY=可选
OPENAI_MODEL=gpt-4.1-mini
BIYING_ADMIN_TOKEN=留言管理 token
```

KV 绑定名建议：

```txt
BIYING_KV
```

## 内容规则

碧影只能读取公开网页内容。Markdown frontmatter 中必须同时满足：

```yaml
public: true
avatar_readable: true
```

才会进入 `docs/assets/knowledge/public-knowledge.json`。

## 双语导航规则

网站保留 `/zh/` 和 `/en/` 两套页面。`mkdocs.yml` 中需要成对维护中英文导航，例如：

```yaml
- 新笔记: zh/notes/new-note.md
- New Note: en/notes/new-note.md
```

前端脚本会根据当前路径自动显示对应语言的导航，并隐藏另一套导航。新增页面时只需要补 `mkdocs.yml` 和对应 Markdown 文件，不需要修改 `language-switch.js`。

## 数学公式

行内公式：

```md
$E = mc^2$
```

块级公式：

```md
$$
\nabla \cdot \vec{E} = \frac{\rho}{\epsilon_0}
$$
```

## 下一步你需要完善的内容

- EdgeOne Pages 生成真实访问域名后，将 `mkdocs.yml` 中的 `site_url` 从临时 GitHub Pages 风格地址替换为正式域名
- `docs/zh/about.md` 和 `docs/en/about.md`
- `docs/zh/projects/` 下的真实项目
- `data/biying.persona.md` 中更贴近你的碧影设定
