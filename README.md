# 碧影数字花园

这是一个基于 MkDocs Material 的双语个人数字网站模板，包含：

- 赛博风格个人主页
- 中文/英文目录式双语内容
- MathJax 数学公式渲染
- 数字分身「碧影」聊天前端
- 公开留言板前端
- 私信站点主人表单
- 站点主人后台与一次性恢复码
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
python scripts/build_site.py
```

输出目录是 `site/`。这个命令会依次完成：

1. 生成公开知识库
2. 构建 MkDocs 静态站点
3. 把 `edge-functions/` 和 `package.json` 打包进 `site/`

## EdgeOne Pages 部署

当前部署采用“提交预构建 `site/`”的方式，以避开 EdgeOne 构建环境中的 Python 兼容问题。EdgeOne 控制台使用：

```txt
Install command:
echo skip install

Build command:
echo skip build

Output directory:
./site
```

当前站点域名：

```txt
https://www.biying.site/
```

如果未来需要迁移域名，更新 `mkdocs.yml` 中的 `site_url` 后重新部署。

## 环境变量

EdgeOne Functions 推荐配置：

```txt
BIYING_KV=在 EdgeOne 控制台中绑定 KV 命名空间
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-v4-flash
OPENAI_API_KEY=可选
OPENAI_MODEL=gpt-4.1-mini
BIYING_ADMIN_TOKEN=后台管理员 token
BIYING_RECOVERY_TOKEN=可选的全局应急恢复码（不建议日常使用）
```

KV 绑定名建议：

```txt
BIYING_KV
```

账户、登录会话、公开留言、私信和一次性恢复码都依赖这个 KV 绑定。

站点主人后台入口：

```txt
https://www.biying.site/zh/admin/
```

使用 `BIYING_ADMIN_TOKEN` 登录后，可以：

- 查看注册用户
- 查看私信收件箱
- 为指定用户名签发一次性恢复码

日常找回密码推荐使用后台签发的临时恢复码，而不是长期固定的 `BIYING_RECOVERY_TOKEN`。

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

- 在 EdgeOne 中绑定 `BIYING_KV`，并配置模型 API Key
- `docs/zh/about.md` 和 `docs/en/about.md`
- `docs/zh/projects/` 下的真实项目
- `data/biying.persona.md` 中更贴近你的碧影设定
