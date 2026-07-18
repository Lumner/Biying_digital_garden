# Architecture Optimization Review

> 历史评审快照：其中部分风险和待办已经完成或被后续方案替代。
> 当前执行状态以 `CODEX_SITE_DEVELOPMENT_PLAN.md` 和 `ARCHITECTURE.md` 为准。

本文档记录当前项目架构检查结果，重点覆盖前端、后端、构建部署、数据流和后续可维护性。项目当前形态是：

- MkDocs Material 静态站点
- 预构建 `site/` 目录发布到 EdgeOne Pages
- EdgeOne Functions 提供账户、留言、私信、后台和碧影聊天 API
- EdgeOne KV 保存用户、session、留言、私信、恢复码和公开知识库
- DeepSeek API 作为碧影在线对话模型

整体方向适合当前预算和部署条件，但继续扩展前建议优先处理以下问题。

## 高优先级

### 1. 后端缺少统一限流

当前只有留言接口做了简单的发言间隔限制，聊天、登录、注册、私信和密码恢复还没有完整限流。

风险：

- 聊天接口可能被刷，直接消耗模型额度。
- 登录接口可能被撞库。
- 私信接口可能被刷屏。
- 注册接口可能产生大量无效账户。

建议：

- 新增统一 rate limit helper。
- 按 `userId`、`clientIp`、`action` 组合限流。
- 聊天建议限制为每个登录用户每分钟若干次。
- 登录失败建议按用户名和 IP 双维度限制。
- 私信和注册建议加入更长冷却时间。

相关文件：

- `edge-functions/api/chat.js`
- `edge-functions/api/auth.js`
- `edge-functions/api/private-messages.js`
- `edge-functions/api/messages.js`

### 2. Edge Functions 重复代码过多

多个 Function 中重复实现了：

- `HEADERS`
- `json`
- `cors`
- `getKv`
- `readBearer`
- `sessionKey`
- `currentSession`
- `readJson`
- `clean`
- admin token 校验

风险：

- 修复 session 逻辑时容易漏改。
- CORS、安全策略和错误格式难以统一。
- 后续新增 API 会继续复制代码。

建议：

- 新增 `edge-functions/api/_shared.js`。
- 抽出通用函数：
  - `json`
  - `cors`
  - `getKv`
  - `readBearer`
  - `currentSession`
  - `requireAdmin`
  - `readJson`
  - `cleanText`
  - `codedError`
  - `rateLimit`

### 3. KV 列表读取会遇到增长瓶颈

当前留言和后台主要通过 `kv.list({ prefix, limit })` 读取：

- 留言列表限制约 100 条。
- 后台列表限制约 200 条。

风险：

- 数据增长后旧数据会无法展示。
- 后台无法完整管理所有用户、留言和私信。
- `kv.list + kv.get` 多次读取成本较高。

建议：

- 为留言、私信、用户建立索引 key。
- 或者实现 cursor 分页。
- 前端列表支持分页或“加载更多”。
- 后台支持按状态和关键词过滤，避免每次全量扫描。

### 4. RAG 检索仍然较粗糙

当前碧影的公开知识检索主要是关键词包含打分。

风险：

- 中文问题可能命中英文内容。
- 英文问题可能命中中文内容。
- 通用知识问题可能误带网站来源。
- 长文章只截断前几千字，后面的章节可能无法被检索到。

建议：

- 优先按当前语言过滤 `/zh/` 或 `/en/` 页面。
- 当前语言无结果时再跨语言检索。
- 只有网站相关问题才返回 `sources`。
- 将长笔记按章节切块进入知识库。
- 给 `now`、项目页、当前页面上下文更高权重。

相关文件：

- `edge-functions/api/chat.js`
- `scripts/build_knowledge.py`
- `docs/assets/knowledge/public-knowledge.json`

## 中优先级

### 5. 前端脚本需要模块化

当前多个前端脚本重复实现了：

- `fetch` 封装
- 错误码到用户提示的映射
- `escapeHtml`
- 中英文文案
- auth headers
- session 刷新

风险：

- 一个 API 错误码变化，需要改多个文件。
- 文案会越来越难维护。
- 前端逻辑变复杂后，调试成本上升。

建议拆分：

- `api-client.js`：统一请求、解析响应、错误处理。
- `i18n.js`：统一中英文文案。
- `dom-utils.js`：转义、日期格式、元素创建。
- `auth-client.js`：账户状态、token、refresh、logout。

相关文件：

- `docs/assets/javascripts/auth.js`
- `docs/assets/javascripts/biying-chat.js`
- `docs/assets/javascripts/guestbook.js`
- `docs/assets/javascripts/admin-dashboard.js`

### 6. 移动端 UI 缺少回归测试

碧影聊天窗口已经多次出现移动端适配问题，说明目前缺少自动化可视检查。

建议加入 Playwright 测试：

- 打开 `/zh/avatar/`。
- 注入一条长中文碧影回复。
- 检查 `.biying-message.biying` 宽度不小于合理阈值。
- 在多个视口截图：
  - 390px
  - 430px
  - 768px
  - desktop

可检查的问题：

- 中文是否竖排。
- 输入框是否被底部浏览器栏遮挡。
- 长公式是否横向滚动而不是撑破布局。
- 浮动聊天窗是否能正常关闭。

### 7. MathJax 依赖外部 CDN

当前 MathJax 通过 jsDelivr 加载。

风险：

- 国内访问时 CDN 可能不稳定。
- 如果 MathJax 加载失败，笔记公式和碧影公式都会失效。

建议：

- 将 MathJax 自托管到 `docs/assets/vendor/mathjax/`。
- 或提供国内可访问的备用 CDN。
- 给公式渲染增加加载失败提示。

相关文件：

- `mkdocs.yml`
- `docs/assets/javascripts/mathjax.js`

### 8. 预构建 `site/` 会带来大量 diff

当前 EdgeOne 配置跳过云端构建，直接发布 `site/`。

优点：

- 避免 EdgeOne 云端 Python/pip 环境问题。
- 部署稳定。

代价：

- 每次修改源码后都要重新构建 `site/`。
- Git diff 很大。
- 容易忘记同步构建产物。

建议：

- 保留当前方案。
- 在 CI 中运行 `python scripts/build_site.py`。
- 检查构建后 `git diff --exit-code`，确保 `site/` 与源码同步。
- 在 README 和交接文档中强调“改源码后必须构建并提交 site/”。

相关文件：

- `edgeone.json`
- `scripts/build_site.py`
- `scripts/package_site.py`
- `.github/workflows/ci.yml`

## 低优先级但值得做

### 9. 公开内容校验还太弱

当前公开范围校验只检查少量关键词：

- `secret`
- `api_key`
- `password`

建议扩展检查：

- `token`
- `private`
- `手机号`
- `邮箱`
- `微信`
- `QQ`
- 身份证号模式
- API key 常见格式
- `.env`
- `Bearer`

同时建议结构化读取 frontmatter，只检查 `avatar_readable: true` 的页面。

相关文件：

- `scripts/validate_public_scope.py`

### 10. 错误详情不宜直接返回前端

多个 API 会把 `error.message` 放到 `detail` 返回给前端。

风险：

- 泄露模型服务返回细节。
- 泄露内部实现。
- 生产环境中可能暴露不必要的调试信息。

建议：

- 对用户只返回稳定错误码。
- 详细错误只写入 EdgeOne 日志。
- 前端根据错误码展示友好提示。

相关文件：

- `edge-functions/api/chat.js`
- `edge-functions/api/auth.js`
- `edge-functions/api/messages.js`
- `edge-functions/api/admin.js`
- `edge-functions/api/private-messages.js`

## 建议实施顺序

### 第一阶段：稳定后端

1. 新建 `edge-functions/api/_shared.js`。
2. 抽出 KV、session、CORS、JSON、错误处理。
3. 增加统一限流。
4. 将聊天、登录、私信、留言接入限流。

目标：降低安全风险和维护成本。

### 第二阶段：优化碧影检索

1. `build_knowledge.py` 支持按章节切分长文。
2. `chat.js` 检索时优先当前语言。
3. sources 只在网站相关回答中返回。
4. 对 `now`、当前页、项目页增加权重。

目标：让碧影更像“站内公开内容助手”，减少误答和误引用。

### 第三阶段：补前端基础设施

1. 新增 `api-client.js`。
2. 新增 `i18n.js`。
3. 统一 auth、guestbook、chat、admin 的请求和错误处理。
4. 移除重复的 `escapeHtml` 和错误映射。

目标：让后续功能更容易加，不再一个点改四处。

### 第四阶段：补测试与部署约束

1. 增加移动端 Playwright 截图测试。
2. CI 中加入 `python scripts/build_site.py`。
3. CI 检查构建产物是否同步。
4. 可选：自托管 MathJax。

目标：减少“本地正常、手机异常、线上缓存异常”的反复问题。

## 总结

当前项目已经完成了一个可用的个人数字花园原型，包括：

- 双语内容
- 公开笔记
- 项目展示
- 碧影聊天
- 账户系统
- 留言
- 私信
- 后台管理
- EdgeOne 低成本部署

下一步重点不应继续堆新功能，而应先做架构收束：

1. 后端共享模块化。
2. 限流与错误处理。
3. RAG 检索质量。
4. 移动端回归测试。
5. 构建产物同步检查。

这些做好后，再继续扩展笔记系统、碧影能力和后台运营功能，会稳很多。
