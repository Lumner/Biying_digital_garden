# 部署说明

## 1. 推送到 GitHub

```bash
git add .
git commit -m "Initial Biying digital garden"
git branch -M main
git remote add origin https://github.com/Lumner/Biying_digital_garden.git
git push -u origin main
```

## 2. EdgeOne Pages

在 EdgeOne Pages 中导入 GitHub 仓库。

仓库地址：

```txt
https://github.com/Lumner/Biying_digital_garden
```

构建命令：

```bash
pip install -r requirements.txt && python scripts/build_knowledge.py && mkdocs build
```

输出目录：

```txt
site
```

## 3. Functions

把 `edge-functions/api` 作为 Pages Functions 目录使用。上线后接口为：

```txt
/api/chat
/api/messages
/api/admin-messages
```

## 4. 环境变量

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
```

## 5. KV

创建 KV 命名空间并绑定变量名：

```txt
BIYING_KV
```

留言会写入：

```txt
guestbook_*
```

碧影聊天优先读取 KV 中的 `public_knowledge`，如果不存在，会自动读取静态文件：

```txt
/assets/knowledge/public-knowledge.json
```

因此 MVP 阶段不需要手动同步知识库到 KV。

## 6. 无备案访问建议

不备案时，建议：

- 先使用 EdgeOne Pages 默认域名验证。
- 如需更稳定的公开访问，购买便宜域名并绑定 EdgeOne。
- 加速区域选择「全球可用区，不含中国大陆」。

这条路线成本低、流程简单，但不是中国大陆节点加速。
