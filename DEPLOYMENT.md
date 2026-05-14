# 部署说明

当前路线：使用已经绑定的正式域名 `https://www.biying.site/`。EdgeOne Pages 负责静态站点部署，EdgeOne Functions 负责账户、留言和碧影聊天 API，EdgeOne KV 负责账户、会话和留言持久化。

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

在 EdgeOne Pages 中导入 GitHub 仓库，并绑定自定义域名：

```txt
www.biying.site
```

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

`mkdocs.yml` 当前应保持：

```yaml
site_url: https://www.biying.site/
```

如果以后更换域名，修改这里后重新提交并推送，让 EdgeOne 自动重新部署。

## 4. Functions

静态站点可访问后，再配置 Pages Functions。上线后接口目标为：

```txt
/api/auth
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

账户、会话和留言都会写入这个 KV。主要 key 前缀：

```txt
user_*
session_*
guestbook_*
```

碧影聊天优先读取 KV 中的 `public_knowledge`。如果不存在，会自动读取静态文件：

```txt
/assets/knowledge/public-knowledge.json
```

因此 MVP 阶段不需要手动同步知识库到 KV。

如果没有绑定 `BIYING_KV`：

- 注册/登录不可用。
- 留言提交、编辑、删除不可用。
- 碧影真实聊天会要求先配置账户系统。

## 7. 当前部署顺序

1. GitHub 保持最新。
2. EdgeOne Pages 导入 GitHub 仓库。
3. 绑定并验证 `www.biying.site`。
4. 确认 `mkdocs.yml` 的 `site_url` 是 `https://www.biying.site/`。
5. 配置 Functions。
6. 配置 KV。
7. 配置模型 API Key。
8. 测试注册/登录、留言和碧影聊天。
9. 再优化 MathJax 本地化、留言管理、引用来源和移动端体验。
