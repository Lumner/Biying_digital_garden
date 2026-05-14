# 部署说明

当前路线：**不注册域名，优先使用 EdgeOne Pages 自动分配的默认访问域名**。先把静态站点、碧影聊天、留言板和公开知识库跑通；以后如果想要更短、更好记的地址，再考虑绑定自定义域名。

## 1. GitHub 仓库

仓库地址：

```txt
https://github.com/Lumner/Biying_digital_garden
```

常用推送流程：

```bash
git add .
git commit -m "Update site"
git push
```

## 2. EdgeOne Pages 静态站点

在 EdgeOne Pages 中导入 GitHub 仓库，不填写自定义域名。部署成功后，EdgeOne 会给项目分配默认访问域名。

可以从这个创建入口开始导入：

[使用 EdgeOne Pages 部署](https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FLumner%2FBiying_digital_garden&repository-name=Biying_digital_garden&project-name=biying-digital-garden&install-command=pip%20install%20-r%20requirements.txt&build-command=python%20scripts%2Fbuild_knowledge.py%20%26%26%20mkdocs%20build%20--strict&output-directory=.%2Fsite)

仓库根目录包含 `edgeone.json`，EdgeOne Pages 可以读取其中的构建配置：

```json
{
  "installCommand": "pip install -r requirements.txt",
  "buildCommand": "python scripts/build_knowledge.py && mkdocs build --strict",
  "outputDirectory": "./site"
}
```

如果控制台需要手动填写，使用：

```txt
Install command:
pip install -r requirements.txt

Build command:
python scripts/build_knowledge.py && mkdocs build --strict

Output directory:
./site
```

部署成功后先验证：

- `/zh/`
- `/en/`
- `/zh/notes/`
- `/zh/projects/`
- 数学公式是否渲染
- 中英文切换是否正常
- 皮卡丘 favicon/logo 是否显示

## 3. `site_url`

现在不注册域名，所以 `mkdocs.yml` 暂时不写 `site_url`，避免生成错误的 canonical URL。

EdgeOne Pages 默认域名生成后，再把它补回：

```yaml
site_url: https://你的-edgeone-pages-默认域名/
```

改完后重新提交并推送，让 EdgeOne 自动重新部署。

## 4. Functions

静态站点可访问后，再配置 Pages Functions。上线后接口目标为：

```txt
/api/chat
/api/messages
/api/admin-messages
```

本地 `mkdocs serve` 不会运行这些接口，所以本地看到 `/api/messages 404` 是正常现象。

## 5. 环境变量

不要把 API Key 写入仓库。EdgeOne 控制台中配置环境变量。

DeepSeek 优先：

```txt
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-chat
BIYING_ADMIN_TOKEN=自定义管理 token
```

如果使用 OpenAI：

```txt
AI_PROVIDER=openai
OPENAI_API_KEY=你的 OpenAI Key
OPENAI_MODEL=gpt-4.1-mini
BIYING_ADMIN_TOKEN=自定义管理 token
```

## 6. KV

创建 KV 命名空间并绑定变量名：

```txt
BIYING_KV
```

留言会写入：

```txt
guestbook_*
```

碧影聊天优先读取 KV 中的 `public_knowledge`。如果不存在，会自动读取静态文件：

```txt
/assets/knowledge/public-knowledge.json
```

因此 MVP 阶段不需要手动同步知识库到 KV。

## 7. 当前部署顺序

1. GitHub 保持最新。
2. EdgeOne Pages 导入 GitHub 仓库。
3. 使用 EdgeOne 默认域名验证静态站点。
4. 将默认域名写回 `mkdocs.yml` 的 `site_url`。
5. 配置 Functions。
6. 配置 KV。
7. 配置模型 API Key。
8. 测试留言和碧影聊天。
9. 再优化 MathJax 本地化、留言管理、引用来源和移动端体验。
