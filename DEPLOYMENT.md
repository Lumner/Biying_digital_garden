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
  "installCommand": "echo skip install",
  "buildCommand": "echo skip build",
  "outputDirectory": "./site"
}
```

如果控制台需要手动填写，使用：

```txt
Install command:
echo skip install

Build command:
echo skip build

Output directory:
./site
```

当前采用预构建发布流程。每次准备部署前，本地先运行：

```bash
python scripts/build_site.py
```

这个命令会重新生成 `site/`，并把 `edge-functions/` 与 `package.json` 一起打包进发布目录。因为 EdgeOne 现在直接发布 `site/`，这一步缺失时，静态页面会存在，但 `/api/auth`、`/api/chat`、`/api/messages` 这些 Functions 路由不会随站点一起上线。

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
/api/private-messages
/api/admin
```

本地 `mkdocs serve` 不会运行这些接口，所以本地看到 `/api/messages 404` 是正常现象。

## 5. 环境变量

不要把 API Key 写入仓库。EdgeOne 控制台中配置环境变量。

DeepSeek 优先：

```txt
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-v4-flash
BIYING_ADMIN_TOKEN=自定义管理 token
BIYING_RECOVERY_TOKEN=全局应急恢复码（可选，不建议日常使用）
BIYING_ALLOWED_ORIGINS=额外允许的精确来源，多个值用逗号分隔（可选）
BIYING_STATS_WRITE_ENABLED=1
BIYING_AUTH_MODE=dual
BIYING_STRICT_ORIGIN_CHECK=0
```

如果使用 OpenAI：

```txt
AI_PROVIDER=openai
OPENAI_API_KEY=你的 OpenAI Key
OPENAI_MODEL=gpt-4.1-mini
BIYING_ADMIN_TOKEN=自定义管理 token
BIYING_RECOVERY_TOKEN=全局应急恢复码（可选，不建议日常使用）
BIYING_ALLOWED_ORIGINS=额外允许的精确来源，多个值用逗号分隔（可选）
BIYING_STATS_WRITE_ENABLED=1
BIYING_AUTH_MODE=dual
BIYING_STRICT_ORIGIN_CHECK=0
```

正式来源 `https://www.biying.site` 始终在 API 跨域白名单中。只有在本地页面需要跨域调用 Functions 时，才把完整来源（例如 `http://127.0.0.1:8000`）显式加入 `BIYING_ALLOWED_ORIGINS`；不要配置 `*`。把 `BIYING_STATS_WRITE_ENABLED` 设为 `0` 可以临时停止统计写入，同时保留统计读取。

### 用户会话 Cookie 上线顺序

`BIYING_AUTH_MODE` 支持：

- `bearer`：只接受旧的 `Authorization: Bearer`，也是变量缺失或值无效时的兼容默认值。
- `dual`：优先读取 `biying_session` Cookie，同时接受旧 Bearer；用于迁移期。为兼容尚未更新的前端，登录响应仍包含 Token，但新前端会忽略它且不写入 Web Storage。
- `cookie`：只接受 `biying_session` Cookie；只能在迁移观察完成后启用。

安全上线顺序：

1. 在合并阶段 2B 前，先把 Production 和 Preview 的 `BIYING_AUTH_MODE` 设为 `dual`，把 `BIYING_STRICT_ORIGIN_CHECK` 设为 `0`。旧代码不会读取这两个变量，因此提前设置不会改变当前行为。
2. 发布同时包含服务端双读和前端 Cookie 迁移的候选版本。
3. 验证注册、登录和密码重置响应都带有 `biying_session`，并包含 `Path=/; HttpOnly; Secure; SameSite=Lax`。
4. 验证刷新账户页仍保持登录、旧 `biying-auth-session` 已从 `localStorage` 删除、留言/编辑/删除、碧影聊天和退出登录正常。
5. 观察稳定后先把 `BIYING_STRICT_ORIGIN_CHECK` 设为 `1`，再次验证全部写操作。
6. 只有在迁移窗口结束并得到站点主人批准后，才把 `BIYING_AUTH_MODE` 设为 `cookie`。

Cookie 认证写请求会校验精确 `Origin`；允许跨域来源时响应会使用精确 `Access-Control-Allow-Origin` 和 `Access-Control-Allow-Credentials: true`，不得配置通配符。

阶段 2B 完整发布后的紧急降级顺序：

1. 先保持 `BIYING_AUTH_MODE=dual`，把 `BIYING_STRICT_ORIGIN_CHECK=0`，这样新 Cookie 前端和旧 Bearer 前端都仍可工作。
2. 如问题来自前端迁移，先回滚 `refactor: migrate frontend auth away from local storage` 并重新发布。
3. 确认旧前端重新发送 Bearer 后，才可把 `BIYING_AUTH_MODE=bearer`。
4. 如仍需撤销服务端，再回滚 `feat: add dual-mode secure cookie sessions`。

不要在新前端仍在线时直接切到 `bearer`：新前端不会保存或发送会话 Token，这会导致登录和受保护操作失效。回滚过程中不得删除 `session_*` 数据。

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
private_message_*
recovery_*
admin_session_*
```

碧影聊天优先读取 KV 中的 `public_knowledge`。如果不存在，会自动读取静态文件：

```txt
/assets/knowledge/public-knowledge.json
```

因此 MVP 阶段不需要手动同步知识库到 KV。

如果没有绑定 `BIYING_KV`：

- 注册/登录不可用。
- 留言提交、编辑、删除不可用。
- 私信和一次性恢复码不可用。
- 碧影真实聊天会要求先配置账户系统。

## 7. 后台与密码恢复

后台入口：

```txt
https://www.biying.site/zh/admin/
```

后台登录表单会把环境变量 `BIYING_ADMIN_TOKEN` 换成默认 20 分钟有效的
HttpOnly 管理员 Cookie；Token 不会写入 `localStorage` 或 `sessionStorage`，
后续请求也不会重复发送长期 Token。后台不会展示密码或密码哈希，只会展示：

- 注册用户名
- 注册时间
- 最近改密时间
- 私信收件箱
- 公开留言管理

后台中可以对私信做未读筛选、搜索和联系方式复制，也可以对公开留言做搜索、隐藏、恢复显示和删除。

推荐的找回密码流程：

1. 用户在 `/zh/register/` 的“私信站点主人”表单中说明情况，并留下联系方式。
2. 你打开 `/zh/admin/`，输入 `BIYING_ADMIN_TOKEN`。
3. 在对应用户旁点击“签发恢复码”，填写有效分钟数，例如 `30`。
4. 后台会生成一枚一次性恢复码，你把它私下发给用户。
5. 用户在 `/zh/register/` 的“忘记密码”表单中使用恢复码重设密码。
6. 恢复码使用一次后立即失效；如果过期，也会失效。

`BIYING_RECOVERY_TOKEN` 只建议作为应急兜底使用，因为它是长期固定值，没有天然时效。日常优先使用后台签发的临时恢复码。`BIYING_ADMIN_TOKEN` 不能用于用户密码恢复；未签发一次性恢复码且未配置专用恢复 Token 时，重置请求会被拒绝。

管理员认证相关变量：

```txt
BIYING_ADMIN_AUTH_MODE=dual
BIYING_ADMIN_SESSION_MINUTES=20
```

- `dual`：短期 Cookie 和旧 Bearer 调用均可用，作为首次发布与观察模式。
- `cookie`：除 `create_session` 换取 Cookie 外，管理员接口拒绝直接 Bearer Token。
- `token`：仅接受旧 Bearer 调用，用于紧急降级。
- 会话分钟数只接受 `15`–`30`；无效值回退到 `20`。
- Cookie 使用 `Path=/api; HttpOnly; Secure; SameSite=Strict`。服务端记录带
  `expiresAt`，读取过期记录时删除，不依赖 KV 的未确认 TTL 参数。

退出后台会删除 `admin_session_*` 记录并返回 `Max-Age=0`。删除私信、公开留言
和用户账号仍需要浏览器二次确认。

### 密码哈希参数与预览基准

新密码记录包含：

```json
{
  "passwordAlgorithm": "pbkdf2-sha256",
  "passwordIterations": 100000,
  "passwordVersion": 2
}
```

旧记录缺少字段时仍按 100,000 次 PBKDF2-SHA256 校验；只有密码正确时才惰性
重新加盐并升级，不需要批量重置用户密码。`BIYING_PASSWORD_ITERATIONS` 接受
`100000`–`1000000`，未配置或无效时回退到 `100000`。不要降低已经发布过的值。

本地参考命令：

```powershell
npm run benchmark:password -- 100000 5
```

正式值必须在 EdgeOne 预览部署中测量：

1. 预览环境设置 `BIYING_ADMIN_AUTH_MODE=dual`、
   `BIYING_PASSWORD_BENCHMARK_ENABLED=1` 和候选
   `BIYING_PASSWORD_ITERATIONS`。
2. 用后台 Token 换取短期 Cookie。
3. 在同源浏览器控制台调用：

   ```javascript
   fetch("/api/admin", {
     method: "POST",
     credentials: "same-origin",
     headers: { "content-type": "application/json" },
     body: JSON.stringify({ action: "benchmark_password_hash", runs: 5 })
   }).then((response) => response.json()).then(console.log)
   ```

4. 选择中位数约 `100`–`250ms`、P95 可接受且不低于 100,000 次的候选值。
5. 完成登录、错误密码、注册与密码重置测试后，将预览和生产的
   `BIYING_PASSWORD_BENCHMARK_ENABLED` 恢复为 `0`。

基准动作默认关闭，只接受管理员短期 Cookie，并执行 Origin 校验和每小时 3 次
的限流。不得在生产环境长期启用。

### 阶段 2C 灰度与回滚

推荐顺序：

1. 先以 `BIYING_ADMIN_AUTH_MODE=dual` 发布。
2. 验证后台登录、刷新恢复、签发恢复码、内容操作和退出清理。
3. 在预览环境完成密码基准和旧记录惰性升级测试。
4. 观察无异常后，单独批准把生产管理员模式切到 `cookie`。

紧急降级时先把 `BIYING_ADMIN_AUTH_MODE` 切回 `dual`；如 Cookie 后台仍故障，
回滚 `feat: add short-lived admin cookie sessions`。密码升级可独立回滚
`feat: version and lazily upgrade password hashes`，新增字段会被旧代码忽略。
不要回滚用户侧 Cookie 提交，也不要删除 `session_*`、`admin_session_*` 或用户记录。

后台列表接口支持分页参数：

```txt
/api/admin?limit=50
  &usersCursor=<cursor>
  &privateMessagesCursor=<cursor>
  &guestbookMessagesCursor=<cursor>
```

响应中的 `pageInfo` 分别返回三类列表的下一页 `cursor` 和 `complete` 状态。游标是不透明值，客户端应原样传回，不要自行解析。

## 8. 当前部署顺序

1. GitHub 保持最新。
2. EdgeOne Pages 导入 GitHub 仓库。
3. 绑定并验证 `www.biying.site`。
4. 确认 `mkdocs.yml` 的 `site_url` 是 `https://www.biying.site/`。
5. 配置 Functions。
6. 配置 KV。
7. 配置模型 API Key。
8. 测试注册/登录、留言和碧影聊天。
9. 再优化 MathJax 本地化、引用来源和移动端体验。
