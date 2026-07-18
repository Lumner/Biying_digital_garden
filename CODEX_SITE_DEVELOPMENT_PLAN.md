# 碧影数字花园：Codex 可执行开发、自动测试与快速回滚方案

> 文档版本：1.0
> 制定日期：2026-07-17
> 适用仓库：`biying-digital-garden`
> 默认执行方式：一个阶段一个提交；测试通过后才进入下一阶段
> 默认发布策略：开发分支验证，未经站点主人明确批准不得推送生产分支或修改生产环境变量

---

## 0. 文档定位与使用方法

本文件是后续网站完善工作的主要执行入口，目标是让 Codex 可以：

1. 在不更换现有 MkDocs、原生 JavaScript、EdgeOne 架构的前提下持续改进网站。
2. 每个阶段都有明确文件范围、实施步骤、自动测试和验收标准。
3. 每个阶段形成独立 Git 提交，出现问题时可以单独回滚。
4. 涉及身份事实、真实项目、原创形象、生产环境和用户数据时停止猜测并请求确认。

旧文档 `plan.md`、`NEXT_AI_DEVELOPMENT_BRIEF.md`、`UI_DYNAMIC_IMPROVEMENT_PLAN.md`、
`ARCHITECTURE_OPTIMIZATION_REVIEW.md` 和 `PROJECT_HANDOFF.md` 只作为历史背景参考。
如果旧文档与本文件冲突，以以下顺序为准：

1. 用户当前指令。
2. `AGENTS.md` 与仓库当前代码。
3. 本文件。
4. 其他历史计划或交接文档。

### 0.1 推荐交给 Codex 的启动指令

```text
请完整阅读 AGENTS.md、README.md、mkdocs.yml、data/biying.persona.md、
scripts/build_knowledge.py 和 CODEX_SITE_DEVELOPMENT_PLAN.md。

以 CODEX_SITE_DEVELOPMENT_PLAN.md 为唯一开发路线：
1. 先执行启动前检查并记录当前基线提交。
2. 从状态表中第一个 Pending 阶段开始。
3. 一个阶段只做该阶段范围内的改动，并形成一个可回滚提交。
4. 运行该阶段的定向测试和完整发布测试；任何测试失败都不得进入下一阶段。
5. 不编造个人经历、项目成果、联系方式或英文内容。
6. 不写入密钥，不修改生产环境变量，不推送生产分支，除非我明确批准。
7. 每完成一个阶段，更新本文件状态表，并汇报提交号、测试结果和回滚命令。
8. 遇到本文列出的人工确认门时停止并向我提问。
```

### 0.2 推荐执行节奏

- 默认：每次只执行一个阶段，便于审阅和回滚。
- 连续执行：可以连续执行不需要人工输入的阶段，但仍必须做到“一阶段一提交”。
- 不允许把多个高风险阶段压缩成一次大改动。
- 不允许在测试失败、工作区不干净或内容事实不明确时继续推进。

---

## 1. 项目目标

### 1.1 产品目标

把当前网站从“功能丰富的个人实验场”完善为：

- 能在首屏清楚说明站点主人是谁、关注什么、做过什么的个人品牌网站。
- 能长期沉淀课程笔记、项目复盘和阶段状态的数字花园。
- 能安全、可控地提供碧影对话、账户、留言与后台功能。
- 在中文与英文、桌面与移动端、鼠标与键盘操作中都保持一致体验。
- 能通过自动测试阻止明显的功能、无障碍、SEO、安全和性能回归。

### 1.2 可量化完成标准

完成本计划的 P0 与 P1 后，应满足：

- 所有发布检查可以由一个命令自动完成。
- CI 对构建、公开内容边界、生成文件同步、API 单元测试、页面端到端测试、
  无障碍和资源预算进行阻断式检查。
- 320px 到 1440px 常见视口无页面级横向溢出。
- 关键表单具备可见标签、键盘操作和状态播报。
- 登录会话不再把敏感 Token 暴露给 `localStorage`。
- 密码恢复不再回退使用管理员 Token。
- 中文和英文页面具有独立描述、规范链接和语言替代链接。
- 首页不再重复展示同一组导航入口。
- 发布目录总大小明显下降，且后续增长受自动预算约束。
- 每个阶段都可以通过 `git revert` 独立撤销。

### 1.3 非目标

本轮计划默认不做：

- 不迁移到 React、Next.js、Vue 或其他框架。
- 不更换 EdgeOne Pages、Functions 与 KV 的部署路线。
- 不凭空添加竞赛、实习、项目数据、研究方向或个人身份事实。
- 不在没有迁移和回滚方案时替换账户数据库。
- 不追求一次性重写全部 CSS 或 JavaScript。
- 不把动画数量、功能数量或页面数量当作主要成功指标。

---

## 2. 当前基线

以下数据用于制定计划，不应被未来 Codex 当作永久不变的事实。每次执行前必须重新验证。

| 项目 | 当前基线 |
|---|---|
| 参考提交 | `e6c5707`，仅作为 2026-07-17 审阅参考 |
| 静态站点 | MkDocs 1.6.1 + Material 9.7.6 |
| Markdown 扩展 | pymdown-extensions 10.21.2 |
| YAML | PyYAML 6.0.3 |
| 前端 | 原生 JavaScript + 单体 `cyber.css` |
| 后端 | EdgeOne Pages Functions |
| 持久化 | EdgeOne KV，最终一致 |
| 发布方式 | 仓库提交预构建 `site/`，EdgeOne 跳过云端构建 |
| 当前端到端测试 | Playwright，主要为 Pixel 5 / Chromium |
| 当前测试基线 | 最近审阅时 24 项通过 |
| 当前构建体积 | 约 15.6 MB，其中 PNG 约 7.4 MB |
| 当前主要风险 | 登录 Token、本地存储、恢复 Token 回退、移动端溢出、无障碍、资源体积、SEO、多语言搜索 |

### 2.1 必须保留的现有能力

- `/zh/` 与 `/en/` 双语入口。
- Markdown 笔记与 MathJax。
- 公开知识库构建和 `public` / `avatar_readable` 边界。
- 碧影聊天、流式响应和本地聊天记录。
- 账户、公开留言、私信和后台管理。
- 站点统计。
- `site/` 预构建发布路线。
- 现有 URL 在没有重定向方案时不得随意改变。

### 2.2 源文件与生成文件边界

源文件包括：

- `docs/`
- `data/`
- `edge-functions/`
- `scripts/`
- `tests/`
- `mkdocs.yml`
- `package.json`
- `requirements.txt`

生成文件包括：

- `docs/assets/knowledge/`
- `site/`

强制规则：

- 不得直接编辑 `site/`。
- 修改源文件后必须运行 `scripts/build_site.py`。
- 每个发布提交必须同时包含对应的生成结果。
- `site/` 与源码必须在同一个阶段提交中同步回滚。

---

## 3. 不可违反的执行约束

### 3.1 工作区保护

执行前运行：

```powershell
git status --short
git rev-parse --show-toplevel
git rev-parse HEAD
git branch --show-current
```

如果 `git status --short` 有任何输出：

- 不得自动清理、覆盖、暂存或回滚。
- 先判断是不是用户已有改动。
- 无法确认时立即停止并报告。

### 3.2 分支与基线备份

工作区干净后：

```powershell
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$base = git rev-parse HEAD
git branch "backup/site-before-hardening-$stamp" $base
git switch -c "codex/site-hardening-$stamp"
```

要求：

- 记录 `$base` 的值。
- 备份分支只用于定位基线，不在其上开发。
- 不使用 `git reset --hard`。
- 不使用 `git checkout -- .` 清理整个仓库。

### 3.3 内容真实性

Codex 不得编造：

- 个人姓名、经历、专业方向和时间线。
- 项目效果、用户数量、性能指标和获奖信息。
- GitHub、演示地址、联系方式和社交账号。
- 英文页面中中文原文没有表达的事实。

如果缺少资料：

- 可以调整页面结构。
- 可以创建不进入导航的草稿模板。
- 不得把占位事实发布到正式页面。

### 3.4 密钥与生产数据

- 不读取、打印、提交或复制真实密钥。
- `.env` 和控制台变量值不进入 Git。
- 自动测试使用内存 Mock KV 和假 Token。
- 不自动删除生产 KV 数据。
- 数据结构升级必须采用新增字段、版本字段或双读兼容。

### 3.5 发布权限

以下操作需要站点主人明确批准：

- 推送会触发正式部署的分支。
- 修改 EdgeOne 生产环境变量。
- 修改域名、DNS、KV 绑定或 WAF 配置。
- 运行会写入生产 KV 的测试。
- 删除生产用户、留言、私信或统计记录。

---

## 4. 标准开发流程

### 4.1 每个阶段开始前

1. 阅读本阶段目标、文件范围和验收标准。
2. 运行当前基线的快速检查。
3. 查看 `git status --short`。
4. 只打开与本阶段相关的文件。
5. 先补充或调整能够捕获问题的测试，再修改实现。

阶段 1 完成前使用现有命令：

```powershell
& .\.venv\Scripts\python.exe scripts\validate_public_scope.py
& .\.venv\Scripts\python.exe scripts\build_site.py
npm run test:mobile
```

阶段 1 完成后统一使用：

```powershell
npm run verify:quick
npm run verify:release
```

### 4.2 每个阶段结束前

按顺序执行：

```powershell
git diff --check
npm run verify:release
git status --short
git diff --stat
```

确认没有无关文件后，显式暂存本阶段文件和生成结果：

```powershell
git add -- <本阶段明确修改的文件或目录> site docs/assets/knowledge
git diff --cached --check
git diff --cached --stat
```

为验证构建结果稳定，暂存后再构建一次：

```powershell
& .\.venv\Scripts\python.exe scripts\build_site.py
git diff --exit-code -- site docs/assets/knowledge
```

若第二次构建产生新的差异，说明构建不稳定或首次生成不完整，不得提交。

提交后执行：

```powershell
& .\.venv\Scripts\python.exe scripts\check_site_sync.py
git status --short
```

### 4.3 提交规范

一个阶段一个提交；阶段含高风险子任务时，一个子任务一个提交。

推荐格式：

```text
chore: establish reproducible site baseline
test: add release quality gates
fix: harden auth recovery and cors
feat: migrate user sessions to secure cookies
fix: improve mobile and keyboard accessibility
refactor: simplify homepage information architecture
perf: reduce production asset weight
feat: add bilingual metadata and alternates
refactor: split site styles without visual changes
```

禁止：

- `Update site`
- `misc fixes`
- 把安全、视觉、内容和重构混在同一个提交
- 提交失败测试或未同步的 `site/`

### 4.4 失败停止规则

出现以下情况立即停止当前阶段：

- 基线测试在修改前就失败。
- 同一个错误经过两次针对性修复仍未解决。
- 需要用户真实信息或设计选择。
- 需要生产密钥、控制台权限或生产数据。
- 变更超出当前阶段文件范围。
- 性能、无障碍或功能出现无法解释的回退。
- 生成目录出现大量与本阶段无关的变化。

停止时报告：

- 失败命令。
- 最短必要错误摘要。
- 已修改文件。
- 当前工作区是否可安全保留。
- 推荐继续方案和回滚方案。

---

## 5. 自动测试与质量门设计

阶段 1 应先建立统一测试入口，后续所有阶段复用。

### 5.1 建议新增文件

```text
.quality/
  site-budget.json
  accessibility-baseline.json（仅在存在已批准例外时使用；例外清零后删除）

scripts/
  check_javascript_syntax.py
  check_page_metadata.py
  check_site_budget.py
  verify_release.py
  smoke_deployed.py

tests/
  api/
    auth.test.js
    security.test.js
    stats.test.js
    mock-kv.js
  accessibility.spec.js
  responsive.spec.js
  seo.spec.js
  smoke.spec.js
  no-js.spec.js
```

### 5.2 `package.json` 目标脚本

保留现有脚本，并增加：

```json
{
  "scripts": {
    "check:js": "python scripts/check_javascript_syntax.py",
    "test:api": "node --test tests/api/*.test.js",
    "test:e2e": "playwright test",
    "test:mobile": "playwright test --project=mobile-chromium",
    "check:metadata": "python scripts/check_page_metadata.py",
    "check:budget": "python scripts/check_site_budget.py",
    "verify:quick": "python scripts/verify_release.py --quick",
    "verify:release": "python scripts/verify_release.py --full",
    "verify:ci": "python scripts/verify_release.py --ci"
  }
}
```

约束：

- 保留 `test:mobile` 兼容旧使用方式。
- Python 脚本必须使用 `sys.executable` 调用子 Python 进程。
- 不在脚本中依赖 PowerShell 专属语法，以保证 CI 可运行。
- 任一子命令非零退出时，统一验证脚本立即失败并原样返回退出码。

### 5.3 `verify_release.py` 执行顺序

`--quick`：

1. JavaScript 语法检查。
2. API 单元测试。
3. 公开内容边界校验。
4. 当前阶段相关的 Playwright 项目。

`--full`：

1. `scripts/build_site.py`
2. `scripts/validate_public_scope.py`
3. JavaScript 语法检查。
4. API 单元测试。
5. 页面元数据检查。
6. 资源预算检查。
7. 全部 Playwright 测试。

`--ci`：

1. 执行 `--full` 的全部步骤。
2. 执行 `scripts/check_site_sync.py`。
3. 检查 `git diff --exit-code`，确保 CI 构建没有产生未提交差异。

### 5.4 Playwright 项目矩阵

| 项目名 | 浏览器与视口 | 每次 CI | 用途 |
|---|---|---:|---|
| `mobile-small` | Chromium，320 × 740 | 是 | 极窄屏溢出与触控 |
| `mobile-chromium` | Chromium，393 × 851 | 是 | 当前移动端基线 |
| `tablet-chromium` | Chromium，768 × 1024 | 是 | 导航切换临界点 |
| `desktop-chromium` | Chromium，1440 × 900 | 是 | 首页、侧栏和长文 |
| `desktop-firefox` | Firefox，1440 × 900 | 是 | 跨浏览器回归 |

Playwright 配置应启用：

```js
use: {
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
  video: "retain-on-failure"
}
```

CI 安装 Chromium 与 Firefox；WebKit 可以作为后续定时测试，不作为第一阶段阻塞项。

### 5.5 页面测试矩阵

必须覆盖：

| 页面 | 中文 | 英文 | 深色 | 浅色 | 移动 | 桌面 |
|---|---:|---:|---:|---:|---:|---:|
| 根入口 `/` | 是 | 不适用 | 是 | 是 | 是 | 是 |
| 首页 | 是 | 是 | 是 | 是 | 是 | 是 |
| 笔记首页 | 是 | 是 | 是 | 是 | 是 | 是 |
| 一篇长讲义 | 是 | 是 | 是 | 是 | 是 | 是 |
| 项目首页 | 是 | 是 | 是 | 是 | 是 | 是 |
| 碧影 | 是 | 是 | 是 | 是 | 是 | 是 |
| 账户 | 是 | 是 | 是 | 是 | 是 | 是 |
| 留言 | 是 | 是 | 是 | 是 | 是 | 是 |
| 后台 | 是 | 是 | 是 | 是 | 是 | 是 |

### 5.6 API 单元测试

使用 Node 内置 `node:test`，不连接真实 EdgeOne。

`mock-kv.js` 至少模拟：

- `get`
- `put`
- `delete`
- `list`
- 最终一致性不在单元测试中假装为强一致

需要覆盖：

- 注册、登录、当前用户、退出。
- 无效密码与不存在用户返回统一外观。
- 密码恢复不能使用管理员 Token。
- 一次性恢复码只能使用一次且会过期。
- 密码重置后旧会话失效。
- Cookie 与 Bearer 双模式迁移。
- CORS 允许正式站点，拒绝未知来源。
- CSRF / Origin 校验。
- 留言、私信、统计与认证限流。
- 统计接口拒绝非法访客 ID。
- 服务器错误不向前端暴露堆栈和内部信息。

### 5.7 无障碍自动测试

建议增加并锁定 `@axe-core/playwright`。

阶段 1：

- 阻断 `critical` 问题。
- 把已知 `serious` 问题记录到基线文件，不允许数量增加。

阶段 3 完成后：

- 关键页面 `critical` 与 `serious` 均为 0。
- 删除已经修复的基线豁免。
- 豁免必须注明原因、页面、选择器和失效日期。

### 5.8 资源预算

阶段 1 使用“防止继续恶化”的临时预算：

```json
{
  "maxTotalBytes": 17000000,
  "maxRasterBytes": 8000000,
  "maxSingleAssetBytes": 2200000,
  "maxFaviconBytes": 650000,
  "allowSourceMaps": true
}
```

阶段 6 完成后收紧为：

```json
{
  "maxTotalBytes": 10000000,
  "maxRasterBytes": 4000000,
  "maxSingleAssetBytes": 650000,
  "maxFaviconBytes": 100000,
  "allowSourceMaps": false
}
```

预算脚本必须输出：

- 总大小。
- 各扩展名大小。
- 最大的 10 个文件。
- 与预算的差值。

---

## 6. 可回滚架构约定

### 6.1 功能开关

后端高风险变更使用环境变量开关。下表同时列出当前已实现开关和后续阶段的目标设计：

| 变量 | 可选值 | 默认值 | 用途 | 当前状态 |
|---|---|---|---|---|
| `BIYING_AUTH_MODE` | `bearer` / `dual` / `cookie` | `bearer` | 用户会话迁移 | 阶段 2B 待实现，当前运行时代码不读取 |
| `BIYING_STATS_WRITE_ENABLED` | `0` / `1` | `1` | 紧急停止统计写入 | 已实现 |
| `BIYING_STRICT_ORIGIN_CHECK` | `0` / `1` | `0`，验证后改为 `1` | 分阶段启用 Origin 校验 | 阶段 2B 待实现，当前运行时代码不读取 |

规则：

- 代码必须在变量缺失时保持当前兼容行为。
- 生产环境切换开关需要用户批准。
- 回滚时优先切换开关，再决定是否回滚提交。
- 开关只作为迁移工具，稳定后应减少长期分支逻辑。

### 6.2 数据结构兼容

用户、会话和恢复码记录增加：

```json
{
  "schemaVersion": 2,
  "sessionVersion": 1
}
```

密码记录采用版本化格式：

```json
{
  "passwordAlgorithm": "pbkdf2-sha256",
  "passwordIterations": 100000
}
```

升级原则：

- 旧记录缺少字段时按旧版本读取。
- 登录成功后可惰性升级密码参数。
- 密码重置时写入新版本。
- 不做一次性破坏性批量迁移。
- 回滚代码后，旧版本仍应能忽略新增字段。

### 6.3 EdgeOne KV 的现实约束

当前 Pages Functions 的 KV 运行时绑定文档公开的是
`put(key, value)`，没有保证第三个 TTL 参数可用；KV 也是最终一致存储。

因此：

- 不把 `kv.put(key, value, { expirationTtl })` 当作必然可用能力。
- 记录中继续保存 `expiresAt`。
- 读取过期记录时立即删除。
- 后台增加分页式清理操作，但不得自动全量删除生产数据。
- 会话失效依赖 `sessionVersion`，不能只依赖 KV 立即删除。
- 应用内限流属于“尽力而为”，生产防刷还应使用 EdgeOne WAF / Rate Limiting。

如在 EdgeOne 预发布环境确认运行时支持 TTL，再单独增加兼容封装和测试，不得直接假设。

---

## 7. 阶段状态表

Codex 每完成一个阶段后更新本表。

| 阶段 | 优先级 | 状态 | 提交 | 说明 |
|---|---:|---|---|---|
| 0. 锁定可复现基线 | P0 | Completed | `5261f77` | 依赖已锁定，生成时间改为可复现来源日期 |
| 1. 建立统一自动测试与 CI 质量门 | P0 | Completed | `e1e14c9` | 84 项 Chromium E2E 与 10 项 API 测试纳入统一门禁；Firefox 由 CI 验证 |
| 2A. 低风险安全与隐私修复 | P0 | Completed | `c4b2237` | CORS、恢复、会话失效、写入限流、统计最小化、隐私页和后台分页已完成 |
| 2B. 用户会话迁移到安全 Cookie | P0 | Pending |  |  |
| 2C. 管理后台与密码哈希强化 | P1 | Pending |  |  |
| 3A. 移动端与响应式修复 | P0 | Completed | `ad0d204` | 窄屏标题、合并头部工具、触控尺寸、安全区和聊天首屏已完成 |
| 3B. 表单、弹层与读屏无障碍 | P0 | Completed | `bc9d546` | 表单标签、键盘弹层、状态播报、跳转正文和焦点样式已完成 |
| 3C. 渐进增强、侧栏和动效收敛 | P1 | Completed | 本阶段提交 | 渐进显示、侧栏把手、本地偏好、打印/低动态模式和系统光标已完成 |
| 4. 首页、导航和品牌定位重构 | P1 | Completed | `f47c124`, `e65fb84` | 按暂无人工回复策略完成：只使用仓库已验证事实，保留现有视觉，首页结构与内容日期可分别回滚 |
| 5. 项目与长篇内容体系完善 | P1/P2 | Completed | `860cd7d`, `3ac78c5`, `67b96b6`, `76173eb`, `2911cfd`, `bc4378e` | 项目案例结构化、英文讲义标明 Overview；三门中文长讲义按课程拆分并保留旧 URL 与锚点入口，章节入口收敛到课程主页 |
| 6. 资源与加载性能优化 | P1 | Completed | `0e2af1f` | Hero 与 favicon 改用轻量发布资产；脚本按页面加载；移除 Google Fonts、source maps 与未请求大文件；预算收紧并通过完整发布验证 |
| 7. SEO、分享卡片与多语言发现 | P1 | Completed | `5eb2dee`, `02c3095`, `f3f5570` | 81 页独立描述与双语元数据、原创分享图、无 JS 语言入口和当前语言搜索过滤已完成 |
| 8. CSS/JavaScript 可维护性重构 | P2 | Completed | `0e189eb`, `146225f`, `6a569e0`, `ba32046` | 单体样式机械拆分为固定顺序的 13 个文件；共享前端工具、资源图门禁、控制台门禁和过时资源清理已完成 |
| 9. 发布、线上冒烟与回滚演练 | P0 | Completed | `94f84a6`, `8c56b78`, `0f16d28`, `de2783a` | 已发布到正式站点；13 项线上只读冒烟与 GitHub Actions #105 全部通过；已完成隔离 worktree 回滚演练 |

状态只使用：

- `Pending`
- `In progress`
- `Blocked`
- `Completed`
- `Rolled back`

---

## 阶段 0：锁定可复现基线

### 目标

在任何功能修改前固定依赖、记录基线并确认当前站点可重复构建。

### 修改范围

- `requirements.txt`
- `scripts/build_site.py`
- `scripts/build_note_catalog.py`
- `scripts/build_page_meta.py`
- `scripts/build_knowledge.py`
- `.gitignore`
- 可选新增 `.quality/site-budget.json`
- 本文件状态表

### 实施任务

1. 确认虚拟环境中实际版本。
2. 将 Python 依赖锁定为当前已验证版本：

   ```text
   mkdocs==1.6.1
   mkdocs-material==9.7.6
   pymdown-extensions==10.21.2
   pyyaml==6.0.3
   ```

3. 不在这一阶段升级主要依赖。
4. 建立临时资源预算文件。
5. 连续运行两次完整构建，确认第二次不产生新差异。
6. 记录测试数量、构建耗时和发布目录大小。

### 自动测试

```powershell
& .\.venv\Scripts\python.exe scripts\validate_public_scope.py
& .\.venv\Scripts\python.exe scripts\build_site.py
npm run test:mobile
& .\.venv\Scripts\python.exe scripts\build_site.py
git diff --check
```

### 验收标准

- 严格构建通过。
- 当前 Playwright 测试全部通过。
- 第二次构建不会继续改变生成文件。
- 没有用户可见功能变化。

### 提交

```text
chore: lock reproducible site baseline
```

### 回滚

```powershell
git revert <阶段0提交号>
```

---

## 阶段 1：建立统一自动测试与 CI 质量门

### 目标

把当前分散命令整合为可在本地和 CI 一键执行的验证体系。

### 修改范围

- `package.json`
- `package-lock.json`
- `playwright.config.js`
- `.github/workflows/ci.yml`
- `scripts/check_javascript_syntax.py`
- `scripts/check_page_metadata.py`
- `scripts/check_site_budget.py`
- `scripts/verify_release.py`
- `tests/`
- `.quality/`

### 实施任务

1. 新增第 5 节定义的脚本。
2. Playwright 增加 320px、393px、768px 和 1440px 项目。
3. 增加 API Mock KV 单元测试。
4. 增加页面冒烟、响应式、无 JS、SEO 和无障碍测试。
5. 将现有测试从“实现细节断言”改为“用户结果断言”：
   - 不再锁死具体 Hero 文件名。
   - 不再要求皮卡丘光标一定存在。
   - 不再要求侧栏默认 `opacity: 0`。
6. 保留已有聊天流式响应、主题切换、登录和留言行为测试。
7. CI 改为只运行 `npm run verify:ci`，避免本地和 CI 流程分叉。
8. CI 上传 Playwright 失败报告和 Trace；成功时不保留大量截图。

### 自动测试

```powershell
npm run verify:quick
npm run verify:release
```

CI 中：

```text
npm ci
npx playwright install --with-deps chromium firefox
npm run verify:ci
```

本地完整验证默认运行 Chromium 四档视口；Firefox 二次浏览器回归由 CI 单独执行，避免本地缺少浏览器二进制时阻断常规开发。

### 验收标准

- 一条命令可以完整验证站点。
- API 测试不访问真实网络和 KV。
- 已知无障碍问题被记录但不能继续增长。
- CI 构建完成后工作区无差异。
- 原有功能测试继续通过。

### 提交

```text
test: add release quality gates
```

### 回滚

```powershell
git revert <阶段1提交号>
```

回滚后恢复使用原有 `build:site`、`validate:public`、`check:site-sync` 和 `test:mobile`。

---

## 阶段 2A：低风险安全与隐私修复

### 目标

先完成不需要改变前端登录机制的安全修复。

### 修改范围

- `edge-functions/api/_shared.js`
- `edge-functions/api/auth.js`
- `edge-functions/api/stats.js`
- `edge-functions/api/messages.js`
- `edge-functions/api/private-messages.js`
- `edge-functions/api/admin.js`
- `edge-functions/api/admin-messages.js`
- `edge-functions/api/chat.js`
- `docs/assets/javascripts/site-stats.js`
- `docs/zh/privacy.md`
- `docs/en/privacy.md`
- `docs/zh/register/index.md`
- `docs/en/register/index.md`
- `docs/zh/guestbook/index.md`
- `docs/en/guestbook/index.md`
- `mkdocs.yml`
- `DEPLOYMENT.md`
- `package.json`
- `tests/api/`

### 实施任务

1. 删除密码恢复对 `BIYING_ADMIN_TOKEN` 的回退。
2. 没有一次性恢复码且没有专用恢复 Token 时明确拒绝重置。
3. CORS 改为白名单：
   - 默认正式来源 `https://www.biying.site`
   - 本地测试来源由测试环境显式传入
   - 未知 Origin 不返回 `Access-Control-Allow-Origin`
4. 新增 `Vary: Origin`。
5. 为认证、留言、私信和统计写入增加统一限流调用。
6. 统计接口：
   - 停止保存 `lastPath`
   - 校验访客 ID 长度和格式
   - 支持 `BIYING_STATS_WRITE_ENABLED=0`
7. 用户记录增加 `sessionVersion`：
   - 新登录会话记录对应版本
   - 密码重置时递增
   - 读取会话时版本不一致立即失效
8. 读取过期会话、恢复码和限流记录时异步删除。
9. 新增中英文隐私页，说明：
   - 账户和留言收集什么
   - 统计收集什么
   - 用途与保留策略
   - 联系站点主人请求删除的方式
10. 后台列表增加分页参数，不再把 100/200 条作为永久上限。

### 自动测试

- 管理员 Token 不能用于普通用户密码恢复。
- 一次性恢复码使用一次后失效。
- 密码重置后旧会话返回 401。
- 未知 Origin 得不到允许跨域头。
- 正式来源和同源请求正常。
- 统计接口过频返回 429。
- 统计记录不再包含路径。
- 隐私页中英文均能构建并可访问。

### 验收标准

- 不改变当前 Bearer 登录前端。
- 原有用户仍可登录。
- 所有敏感写接口都有应用层限流。
- 隐私说明可从页脚或账户/留言页访问。
- API 返回不包含堆栈和内部错误对象。

### 提交

```text
fix: harden recovery cors sessions and privacy
```

### 回滚

```powershell
git revert <阶段2A提交号>
```

新增数据字段为向后兼容字段，回滚不需要删除 KV 数据。

---

## 阶段 2B：用户会话迁移到安全 Cookie

### 目标

使用户会话 Token 不再暴露给前端 JavaScript 和 `localStorage`，同时保留快速回滚能力。

### 修改范围

- `edge-functions/api/_shared.js`
- `edge-functions/api/auth.js`
- 需要用户登录的其他 API
- `docs/assets/javascripts/api-client.js`
- `docs/assets/javascripts/auth.js`
- `docs/assets/javascripts/biying-chat.js`
- `docs/assets/javascripts/guestbook.js`
- `tests/api/`
- `tests/mobile-biying.spec.js`
- `DEPLOYMENT.md`

### 服务端迁移顺序

#### 2B-1：双读阶段

新增 `BIYING_AUTH_MODE`：

- `bearer`：只读取 Authorization Bearer，保持旧行为。
- `dual`：优先读取 Cookie，同时接受 Bearer。
- `cookie`：只接受 Cookie。

登录成功时，在 `dual` 和 `cookie` 模式返回：

```text
Set-Cookie: biying_session=<opaque-token>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=<seconds>
```

退出时：

- 删除 KV 会话。
- 返回同名 Cookie，`Max-Age=0`。

#### 2B-2：前端切换

1. `api-client.js` 默认使用 `credentials: "same-origin"`。
2. `auth.js` 不再向 `localStorage` 写入 Token。
3. 页面启动后通过 `GET /api/auth` 获取当前用户。
4. 如果检测到旧 `localStorage` 会话：
   - 在 `dual` 模式完成一次迁移请求。
   - 成功后删除旧 Token。
   - 失败时退出登录，不无限重试。
5. 聊天记录可以继续保存在本地，但不得包含会话 Token。

#### 2B-3：严格模式

经过预发布和生产观察后，再由站点主人把：

```text
BIYING_AUTH_MODE=cookie
BIYING_STRICT_ORIGIN_CHECK=1
```

### CSRF 约束

- 所有会改变状态的 Cookie 认证请求校验 `Origin`。
- 同源静态页面请求不需要额外暴露长期 CSRF Token。
- 不允许 `Access-Control-Allow-Origin: *` 与凭证请求组合。

### 自动测试

- `Set-Cookie` 包含 `HttpOnly`、`Secure`、`SameSite=Lax`、`Path=/`。
- Cookie 模式下无 Cookie 返回 401。
- Bearer 模式保持旧行为。
- 双模式同时兼容旧客户端。
- 前端运行后 `localStorage` 不存在会话 Token。
- 退出后 Cookie 清除且会话失效。
- 跨站 Origin 的写请求被拒绝。
- 聊天、留言编辑和账户页在 Cookie 模式正常。

### 验收标准

- 浏览器开发者工具中，站点脚本无法读取会话 Cookie。
- 新登录不再产生本地 Token。
- 旧用户可以平滑迁移。
- 切换 `BIYING_AUTH_MODE=bearer` 可以恢复旧服务端认证路径。

### 提交拆分

```text
feat: add dual-mode secure cookie sessions
refactor: migrate frontend auth away from local storage
```

服务端双读与前端切换必须是两个独立提交。

### 快速回滚

第一步，无需重新部署：

```text
BIYING_AUTH_MODE=bearer
BIYING_STRICT_ORIGIN_CHECK=0
```

第二步，如仍有问题：

```powershell
git revert <前端Cookie迁移提交号>
git revert <服务端双读提交号>
```

不得删除已有会话数据。

---

## 阶段 2C：管理后台与密码哈希强化

### 目标

减少管理员长期 Token 在浏览器中的暴露，并为密码参数升级建立兼容机制。

### 修改范围

- `edge-functions/api/admin.js`
- `edge-functions/api/_shared.js`
- `edge-functions/api/auth.js`
- `docs/assets/javascripts/admin-dashboard.js`
- `tests/api/`
- `DEPLOYMENT.md`

### 实施任务

1. 新增短期管理员会话：
   - 管理员 Token 只用于换取短期 HttpOnly Cookie。
   - 管理员 Cookie 建议 15–30 分钟有效。
   - 后台前端不再把管理员 Token 写入 `sessionStorage`。
2. 管理员敏感操作继续二次确认。
3. 密码哈希增加算法、迭代次数和版本字段。
4. 在 EdgeOne 预发布环境基准测试 PBKDF2：
   - 目标单次校验约 100–250ms。
   - 不直接猜测固定迭代次数。
5. 旧用户登录成功后惰性重新哈希。
6. 不存在用户时执行等价成本的虚拟哈希，降低用户名时序枚举风险。

### 自动测试

- 管理员 Token 不进入 Web Storage。
- 管理员 Cookie 过期后敏感接口返回 401。
- 旧密码记录仍可登录。
- 新密码记录包含版本字段。
- 登录成功可完成惰性升级。
- 不存在用户与错误密码走相近验证路径。

### 验收标准

- 后台刷新后可在有效管理员会话内继续工作。
- 关闭或退出后台后能主动清理会话。
- 旧用户不需要统一重置密码。

### 回滚

- 管理员会话与密码参数升级分别提交。
- 回滚代码不删除新增字段。
- 如管理员 Cookie 路径故障，先恢复旧后台提交，不回滚用户 Cookie 会话。

---

## 阶段 3A：移动端与响应式修复

### 目标

先消除窄屏溢出和顶部区域拥挤。

### 修改范围

- `docs/assets/styles/cyber.css`
- `docs/assets/javascripts/language-switch.js`
- `docs/assets/javascripts/biying-chat.js`
- `docs/overrides/main.html`
- `docs/zh/index.md`
- `docs/en/index.md`
- `docs/zh/avatar/index.md`
- `docs/en/avatar/index.md`
- `mkdocs.yml`
- `tests/responsive.spec.js`
- `tests/mobile-biying.spec.js`

### 实施任务

1. 修复 320px 与 393px 首页标题裁切：
   - 允许合理换行。
   - 使用 `clamp()` 控制字号。
   - 禁止页面级横向溢出。
2. 移动端头部只保留：
   - 菜单
   - 简短站点标识
   - 一个主题/更多入口
3. 搜索、主题和语言入口收入可发现的菜单或合并控件。
4. 公告条在移动端缩短或隐藏次要英文。
5. 关键按钮可触控区域至少 44 × 44 CSS px。
6. 聊天页首屏减少重复介绍，让输入区域更快出现。
7. 所有固定定位元素考虑安全区：

   ```css
   env(safe-area-inset-top)
   env(safe-area-inset-right)
   env(safe-area-inset-bottom)
   env(safe-area-inset-left)
   ```

### 自动测试

- 320、393、768、1440 四种视口：
  - `document.documentElement.scrollWidth <= clientWidth + 1`
  - 首页标题完整可见
  - 导航入口可操作
  - 聊天输入框可见
- 中文与英文分别测试。
- 深色、浅色和系统主题分别测试至少一个关键页面。

### 验收标准

- 无页面级横向滚动。
- 移动端顶部不出现重叠和不可点击控件。
- 公告条不占用超过两行。
- 主要操作无需精确点击小图标。

### 提交

```text
fix: remove mobile overflow and simplify header
```

### 回滚

```powershell
git revert <阶段3A提交号>
```

### 完成记录

- 320px 与 393px 首页标题使用 `clamp()` 自适应，并以实际边界断言防止再次裁切。
- 896px 以下头部收敛为菜单、短站点名和单一站点工具入口；搜索、主题与语言切换均可从工具菜单访问。
- 移动端公告只显示当前语言说明，关键按钮和导航触控高度不低于 44 CSS px。
- 固定进度条、聊天浮层、关闭按钮和悬浮入口均加入安全区偏移。
- 中英文聊天页移除重复介绍，将回答范围折叠到输入区之后，输入框在 320、393、768 与 1440 四种视口首屏可见。
- 响应式测试覆盖中英文首页、笔记、长文、项目、聊天、账户和隐私页，并验证横向溢出、标题边界、头部控件、公告高度、主题模式与聊天首屏。

---

## 阶段 3B：表单、弹层与读屏无障碍

### 目标

使账户、聊天、留言和后台可以被键盘与读屏软件可靠操作。

### 修改范围

- `docs/assets/javascripts/auth.js`
- `docs/assets/javascripts/biying-chat.js`
- `docs/assets/javascripts/guestbook.js`
- `docs/assets/javascripts/admin-dashboard.js`
- `docs/assets/styles/cyber.css`
- `docs/overrides/main.html`
- `tests/accessibility.spec.js`

### 实施任务

1. 所有输入框增加真实 `<label>`。
2. Placeholder 只作示例，不承担标签职责。
3. 错误、成功和加载状态使用合适的：
   - `role="status"`
   - `role="alert"`
   - `aria-live`
4. 首页打字机不再逐字符触发 `aria-live`。
5. 流式聊天过程中读屏只播报状态与最终完整回答。
6. 移动端聊天面板：
   - `role="dialog"`
   - `aria-modal="true"`
   - 打开时焦点进入
   - Tab 焦点被限制在弹层内
   - Escape 关闭
   - 关闭后焦点回到触发按钮
7. 账户页 Tab 组件支持左右方向键、Home 与 End。
8. 新增 Skip Link，直接跳转到正文。
9. 为自定义按钮、卡片链接和表单控件增加清晰的 `:focus-visible`。
10. 隐藏蜜罐字段同时避免被读屏和键盘访问。

### 自动测试

- 每个输入框都有可访问名称。
- Skip Link 聚焦后可见并能跳到正文。
- Chat Dialog 具备焦点锁定、Escape 和焦点返回。
- Tab 组件方向键正常。
- axe `critical` 与 `serious` 为 0。
- 键盘无需鼠标即可登录、留言并打开/关闭聊天。

### 验收标准

- 不依赖颜色表达错误状态。
- 可见焦点不被裁切。
- 读屏不会播报每个打字机字符或每个流式片段。
- 表单错误与对应字段建立关联。

### 提交

```text
fix: make forms chat and navigation accessible
```

### 回滚

```powershell
git revert <阶段3B提交号>
```

### 完成记录

- 账户、聊天、留言和后台的自定义输入均改用真实 `<label>`；占位符只保留示例用途。
- 加载、成功和错误状态分别使用 `role="status"`、`role="alert"`、`aria-live`、`aria-busy` 与字段级 `aria-describedby` / `aria-invalid`。
- 账户页签支持左右方向键、Home 和 End；移动聊天实现 Dialog 语义、焦点进入、Tab 环绕、Escape 关闭与触发按钮焦点恢复。
- 新增跳转正文链接和统一 `:focus-visible`，蜜罐字段同时退出视觉、键盘和读屏访问路径。
- 首页打字机与聊天消息日志不再作为逐字符 Live Region；聊天只播报思考状态和最终完整回答。
- 长讲义的横向表格与代码滚动区可由键盘聚焦，原有 Axe serious 例外已清零并删除基线文件。
- 无障碍测试覆盖表单命名、Skip Link、页签、Dialog、登录错误关联、留言键盘提交与聊天播报；完整发布门禁通过。

---

## 阶段 3C：渐进增强、侧栏和动效收敛

### 目标

即使脚本失败、打印页面或截图未滚动，主要内容仍然可见。

### 修改范围

- `docs/assets/javascripts/reveal-on-scroll.js`
- `docs/assets/javascripts/layout-controls.js`
- `docs/assets/javascripts/language-switch.js`
- `docs/assets/styles/cyber.css`
- `tests/no-js.spec.js`
- `tests/desktop-sidebar.spec.js`

### 实施任务

1. 内容默认可见。
2. 只有在 JavaScript 成功初始化后才添加动画准备类。
3. `IntersectionObserver` 不支持时保持可见。
4. 打印模式禁用揭示动画和隐藏侧栏。
5. 左右侧栏提供可见折叠把手。
6. 长讲义桌面端默认保留可发现的目录入口。
7. 侧栏显示偏好只保存为设备本地偏好。
8. 移除全局 `body *` 强制自定义光标：
   - 默认使用系统光标。
   - 如保留彩蛋，仅在明确开启的装饰模式中使用。
9. 保留并测试 `prefers-reduced-motion`。
10. 缩小全局 MutationObserver 监听范围。

### 自动测试

- 禁用 JavaScript 时正文仍可阅读。
- 页面加载后未滚动区域不为透明。
- 打印 CSS 不隐藏正文和目录。
- 侧栏按钮有可访问名称并可键盘操作。
- Reduced Motion 下不存在持续动画。

### 验收标准

- 内容可见性不依赖滚动脚本。
- 侧栏不再依赖“点击不可见区域”才能发现。
- 文本、按钮和禁用控件使用符合平台习惯的光标。

### 提交

```text
fix: make content progressive and sidebars discoverable
```

### 回滚

```powershell
git revert <阶段3C提交号>
```

---

## 阶段 4：首页、导航和品牌定位重构

### 人工确认门

开始前需要站点主人确认：

1. 首页希望公开使用的姓名或网名。
2. 一句话身份定位。
3. 当前关注的 2–3 个方向。
4. 是否保留当前动漫 Hero 与皮卡丘元素。
5. “碧影”是网站名、助手名，还是两者之一。

若暂时没有回复：

- 可以重构结构。
- 只能使用仓库中已经验证的事实。
- 保留现有视觉，不新增角色或版权素材。
- 不更新 `Now` 的事实内容。

### 目标

让访客在前 10 秒理解“谁、方向、代表成果、下一步去哪里”。

### 修改范围

- `docs/zh/index.md`
- `docs/en/index.md`
- `docs/zh/about.md`
- `docs/en/about.md`
- `docs/zh/now.md`
- `docs/en/now.md`
- `docs/zh/projects/index.md`
- `docs/en/projects/index.md`
- `mkdocs.yml`
- `docs/assets/styles/cyber.css`
- 相关页面测试

### 首页目标结构

1. 首屏身份与一句话定位。
2. 三个代表项目或能力证据。
3. 三篇最新/推荐内容。
4. 碧影体验入口与公开边界说明。
5. 当前状态与联系方式。

### 实施任务

1. 删除“继续向下走”“从哪里逛起”“从哪里开始”等重复入口。
2. 一个首屏只保留一个主 CTA 和一个次 CTA。
3. 主导航压缩为：
   - 首页
   - 笔记
   - 项目
   - 关于
   - 碧影突出入口
   - 其余功能放入“更多”
4. 明确三层命名：
   - 站点主人
   - 网站
   - 数字助手
5. 空的 AI / 随笔分类：
   - 有内容前不作为主要卡片展示
   - 或明确标注为路线图，而不是现有内容
6. “Now” 增加 `updated`，超过 45 天自动显示温和的陈旧提示。
7. 英文“25级”使用 `2025 cohort` 或明确入学年份，不使用含义模糊的 `Class of 2025`。
8. Hero 视觉：
   - 优先使用原创、抽象或纯排版方案
   - 明暗主题保持同一品牌主体
   - 未经确认不生成或替换角色图

### 自动测试

- 首页只有一个主 CTA。
- 首页没有三组重复路线列表。
- 中英文导航项目对应。
- 320px 标题不溢出。
- 空分类不会显示为已有内容。
- `Now` 陈旧提示由日期自动决定。
- 页面中不存在未经确认的占位事实。

### 验收标准

- 首屏直接出现个人身份、方向和可验证入口。
- 项目优先于账户、留言、更新等辅助功能。
- 中文与英文信息层级一致。
- 不牺牲碧影与数字花园的个性。

### 提交拆分

```text
refactor: clarify homepage and navigation
docs: align bilingual identity and current status
```

### 回滚

首页结构和内容更新必须分开提交，可分别回滚。

---

## 阶段 5：项目与长篇内容体系完善

### 人工确认门

真实项目页面必须由站点主人提供或确认：

- 项目名称
- 时间范围
- 个人职责
- 技术栈
- 可公开的代码/演示地址
- 可公开的结果
- 限制和复盘

Codex 可以检查工作区中的相邻项目，但不得自动把它们描述成已完成成果。

### 5A：项目案例

每个项目页面采用统一结构：

```text
项目摘要
背景与问题
我的职责
约束条件
关键决策
实现过程
结果与证据
不足与下一步
链接与截图
```

要求：

- 项目首页至少有 2–3 个真实案例后再强调“项目集”。
- 网站自身项目重点写问题、决策、结果和复盘。
- KV、接口清单等内部细节移入工程笔记，不占据项目首屏。
- 没有真实结果时使用“当前状态”，不写虚构指标。

### 5B：长篇讲义

按课程逐个处理，不允许同时拆三门课：

1. 离散数学。
2. 计算机系统。
3. FDS 数据结构。

每门课独立提交。

拆分策略：

- 保留原有 URL 作为课程主页。
- 章节移动到稳定子路径。
- 课程主页保留旧章节锚点或明确跳转链接。
- 增加学习目标、先修要求、预计阅读时间、练习和参考资料。
- 补齐或删除“图像资源待补充”等正式页面占位文本。
- 对来源于课程资料的内容增加来源、课程、作者和引用边界说明。

### 5C：英文内容

- 未完整翻译的讲义标题明确写 `English Overview`。
- 不让导航暗示它是完整英文全文。
- 英文概要链接回中文完整版本，并说明语言状态。

### 自动测试

- 所有内部链接有效。
- 原课程 URL 返回 200。
- 旧章节锚点有对应入口。
- 中英文项目导航不产生 404。
- 空项目模板不进入正式导航。
- 内容来源说明存在。
- 公开知识库只收录允许内容。

### 验收标准

- 项目内容能够证明能力，而不只是罗列技术。
- 长篇讲义可分章节阅读。
- 内容拆分没有丢失正文。
- 英文页面准确表达翻译完成度。

### 回滚

- 一个项目一个提交。
- 一门课程一个提交。
- 回滚某门课程不得影响其他课程。
- 原 URL 始终保留，因此回滚不需要处理外部链接。

---

## 阶段 6：资源与加载性能优化

### 目标

将发布目录控制在 10 MB 内，减少首屏图片、全局脚本和外部字体依赖。

### 修改范围

- `docs/assets/images/`
- `docs/assets/styles/`
- `docs/assets/javascripts/`
- `docs/overrides/main.html`
- `mkdocs.yml`
- `scripts/build_site.py`
- `scripts/package_site.py`
- `.quality/site-budget.json`
- 性能相关测试

### 实施任务

1. 图片：
   - 将 Hero 转为 WebP/AVIF 响应式版本。
   - 保留必要回退格式。
   - 最大单张不超过 650 KB。
   - favicon 不超过 100 KB。
2. 删除前先用 `rg` 验证无引用：
   - 旧 Hero 版本
   - 重复友链 JSON
   - 重复友链脚本
   - 不需要的 Source Map
3. 字体：
   - 删除 Google Fonts 运行时依赖。
   - 第一选择为系统字体栈。
   - 如果以后自托管字体，必须确认许可并只保留实际字重。
4. 脚本：
   - 通过页面 frontmatter 或模板条件只加载需要的脚本。
   - 全局只保留主题、语言和真正全站需要的基础模块。
   - 留言、后台、笔记目录和统计脚本按页面加载。
5. 构建：
   - 生产目录不打包 `.map`。
   - 构建后执行资源预算检查。
6. 保留聊天流式功能，不为了减少体积破坏可读性。

### 自动测试

- 资源预算脚本通过。
- 所有页面请求无 404 静态资源。
- 不加载 Google Fonts。
- 访客未进入后台时不加载后台脚本。
- 访客未进入留言页时不加载留言脚本。
- Hero 在支持格式的浏览器中使用现代格式。
- 深色与浅色 Hero 均可读。

### 验收标准

- `site/` 总大小不超过 10 MB。
- raster 图片合计不超过 4 MB。
- 不包含 Source Map。
- 首页首屏不请求无关页面脚本。
- Lighthouse 本地移动性能不低于修改前，且无明显布局跳动。

### 提交拆分

```text
perf: optimize hero and favicon assets
perf: load site scripts by page
perf: remove external fonts and source maps
```

### 回滚

每类优化单独提交。图片回滚时源图和生成站点一起恢复。

### 完成记录

- 首页 Hero 发布资产改为 960/1440 宽 WebP + JPEG 回退，favicon 改用轻量 SVG；旧大图和旧 favicon 保留在源码历史中，但生产打包会从 `site/` 剔除。
- Material Google Fonts 运行时依赖已关闭，站点回到系统字体栈。
- MathJax 本地大包拆分为 4 个小 chunk，并仅在笔记页面按需加载；公式页面增加 chunk 初始化与渲染测试。
- 留言、后台、友链、笔记目录、统计和随机封面脚本改为模板条件加载，首页不再请求后台、留言、友链和笔记目录脚本。
- 生产打包剔除 source maps、旧大图、旧 MathJax 单包和未请求的 `wordcut.js`；预算收紧为 10 MB / 4 MB raster / 650 KB single asset / 100 KB favicon / no source maps。
- 新增 `tests/performance-assets.spec.js`，覆盖 Google Fonts、页面级脚本、Hero WebP、MathJax chunk 和静态资源 404。
- 完整发布验证通过：`npm run verify:release`，184 passed、7 skipped；发布目录 8.09 MiB，最大单文件 593.66 KiB，source maps 0。

---

## 阶段 7：SEO、分享卡片与多语言发现

### 目标

让每个页面具有独立、可索引、可分享的元数据，并正确表达中英文关系。

### 修改范围

- `docs/overrides/main.html`
- `docs/index.md`
- `docs/zh/**/*.md`
- `docs/en/**/*.md`
- `mkdocs.yml`
- `scripts/check_page_metadata.py`
- `tests/seo.spec.js`
- 可选新增原创 `docs/assets/images/og.*`

### 实施任务

1. 页面描述：
   - 为所有正式页面增加 `description`。
   - `summary` 可继续用于站内目录和碧影知识库。
   - 两者内容可以相近，但职责不同。
2. 每页输出：
   - 唯一 `<title>`
   - 唯一 meta description
   - canonical
   - Open Graph
   - Twitter Card
3. 中英文页面输出：
   - `hreflang="zh-CN"`
   - `hreflang="en"`
   - `hreflang="x-default"`
4. 增加适当的 JSON-LD：
   - 首页：`Person` / `WebSite`
   - 项目：`CreativeWork` 或 `SoftwareSourceCode`
   - 笔记：`Article` / `TechArticle`
   - 面包屑：`BreadcrumbList`
5. 根 `/`：
   - 不再依赖 JavaScript 强制跳转。
   - 提供简洁的语言选择入口。
   - 可以根据浏览器语言建议，但不能阻止用户选择。
6. 搜索：
   - 第一阶段在结果层过滤当前语言，避免中英文混排。
   - 不立即引入高风险的整站 i18n 重构。
   - 若以后迁移插件，必须单独做技术验证阶段。
7. 社交分享图：
   - 品牌方向确认后生成一张原创横版图片。
   - 必须检查文字是否正确。
   - 未通过检查时宁可不设置 `og:image`，不使用错误图片。

### 自动测试

- 每个 HTML 页面只有一个 description。
- description 不等于全站默认值，除明确豁免页面。
- canonical 为正式域名。
- 每个 `/zh/` 页面具有可访问的英文替代链接，反之亦然。
- OG/Twitter 元数据完整。
- JSON-LD 可解析为 JSON。
- 根入口在禁用 JavaScript时仍可选择语言。
- 搜索结果只显示当前语言路径。

### 验收标准

- 页面分享时显示正确标题、描述和原创图。
- 搜索引擎可以理解中英文是对应版本。
- 根页面不依赖脚本才能使用。
- 不改变现有正式 URL。

### 提交拆分

```text
feat: add bilingual metadata and structured data
fix: make root language entry progressive
feat: keep search results within current locale
```

### 回滚

元数据、根入口、搜索过滤分别提交，可独立回滚。

### 完成记录

- 81 个 Markdown 页面均具有独立 `description`，生成页同时输出准确 canonical、`zh-CN` / `en` / `x-default` alternate、Open Graph、Twitter Card 和可解析 JSON-LD。
- 首页输出 `Person` 与 `WebSite`，项目、笔记和面包屑分别输出对应的 `CreativeWork`、`TechArticle` 与 `BreadcrumbList` 结构化数据；后台页面明确禁止索引。
- 新增可重复生成的 1200 × 630 原创分享图 `og-biying.jpg`，已人工检查中英文文字、尺寸和画面；生成命令为 `npm run build:social-card`。
- 根路径改为静态双语选择页，禁用 JavaScript 时仍可进入中文或英文站点，不再执行强制跳转。
- 搜索索引在交给 Material 搜索工作线程前按当前路径语言过滤，并保留结果层兜底；中文页不会混入英文结果，英文页同理。
- 元数据检查扩展为全站唯一描述、规范链接、可访问 alternate、社交图和 JSON-LD 校验；SEO 浏览器测试覆盖分享图尺寸、无脚本根入口和双语搜索隔离。
- 完整发布验证通过：API 21 项通过；Playwright 190 项通过、7 项按平台跳过；81 页元数据通过；发布目录 8.39 MiB，最大单文件 594.27 KiB，source maps 为 0。

---

## 阶段 8：CSS 与 JavaScript 可维护性重构

### 目标

在功能和视觉稳定后拆分单体文件，减少重复代码，不引入新框架。

### CSS 目标结构

```text
docs/assets/styles/
  tokens.css
  base.css
  layout.css
  components.css
  pages/
    home.css
    notes.css
    projects.css
    account.css
    chat.css
  themes/
    dark.css
    light.css
  responsive.css
```

### JavaScript 目标

- 保留原生模块和现有构建方式。
- 删除未使用的 `setTheme` 等死代码。
- 合并重复友链脚本与数据。
- 共享表单状态、API 错误和状态播报工具。
- 不把整个站点改造成单页应用。

### 实施任务

1. 先按原顺序机械移动 CSS，不同时重写选择器。
2. 每移动一组样式就运行视觉和响应式测试。
3. `mkdocs.yml` 显式列出 CSS 文件，避免深层 `@import`。
4. JavaScript 一次只重构一个领域：
   - 主题与语言
   - 表单
   - 聊天
   - 后台
5. 删除文件前验证：
   - 源码无引用
   - 生成 HTML 无引用
   - 测试无依赖
6. 旧架构说明同步更新或删除，避免文档与代码矛盾。

### 自动测试

- 完整发布验证通过。
- CSS 文件顺序固定。
- 关键页面截图或视觉断言无非预期变化。
- 无重复加载同一脚本。
- 无控制台错误。
- 无未引用的旧资源。

### 验收标准

- 单个 CSS 文件职责清楚。
- 重构阶段不改变页面文案和产品行为。
- 删除的代码有搜索证据和测试保护。

### 提交拆分

```text
refactor: split site styles without visual changes
refactor: consolidate shared frontend utilities
chore: remove obsolete assets and stale architecture notes
```

### 回滚

CSS、JavaScript 和文档清理分别提交。

### 完成记录

- 原单体 `cyber.css` 按原始层叠顺序机械拆分为 13 个职责文件，`mkdocs.yml` 显式固定加载顺序；首次拆分不移动选择器、不改写视觉规则，嵌套目录中的图片相对路径已同步校正。
- 新增 `scripts/check_stylesheet_order.py` 与 `npm run check:css`，会校验源文件集合、禁止 `@import`、相对资源存在、旧单体文件消失，以及 82 个生成页面中的加载顺序。
- `dom-utils.js` 统一 live status 与 busy state，账户、留言、后台和碧影聊天复用共享实现；站点统计改用统一 API 客户端和语言工具。
- 删除已确认无调用的旧主题函数和 i18n/表单辅助代码；保留聊天流、领域错误文案、认证接口和后台端点等高风险边界，未做行为改写。
- 友链脚本与数据各收敛为唯一无日期文件，删除日期版副本；历史方案文档增加历史状态说明，当前架构和协作说明已与样式、脚本结构对齐。
- 新增 `scripts/check_frontend_assets.py` 与 `npm run check:frontend`，阻止生成页重复加载一方脚本、未引用的一方脚本和日期版友链资源回归；当前覆盖 20 个一方脚本与 83 个生成页面。
- 关键路由冒烟测试同时拦截未捕获异常与本地/API 控制台错误；友链、资源契约和控制台定向测试 19 项通过。双语搜索测试改为等待搜索组件明确就绪并按真实键盘事件输入，连续复跑 20 项通过。
- 完整发布验证通过：API 21 项通过；Playwright 192 项通过、7 项按设备条件跳过；49 个 JavaScript 文件语法通过；81 页元数据通过；发布目录 8.47 MiB，距总量预算 1.07 MiB，最大单文件 594.27 KiB，source maps 为 0。
- 独立回滚：CSS 拆分 `git revert 0e189eb`；共享工具 `git revert 146225f`；资源与文档清理 `git revert 6a569e0`；搜索测试稳定化 `git revert ba32046`。整体回滚时按新到旧顺序执行。

---

## 阶段 9：发布、线上冒烟与回滚演练

### 人工确认门

生产发布前必须得到站点主人明确批准。

### 发布前检查

```powershell
git status --short
npm run verify:release
& .\.venv\Scripts\python.exe scripts\check_site_sync.py
git log -10 --oneline
```

要求：

- 工作区干净。
- 所有阶段提交可识别。
- 不存在测试跳过或临时调试代码。
- 生产环境变量值由站点主人核对。
- 如有 EdgeOne 预览 URL，先发布到预览环境。

### 线上冒烟检查

新增 `scripts/smoke_deployed.py`，只做无副作用请求：

```powershell
python scripts/smoke_deployed.py --base-url https://www.biying.site
```

检查：

- `/`
- `/zh/`
- `/en/`
- `/zh/notes/`
- `/zh/projects/`
- `/zh/avatar/`
- `/zh/register/`
- `/api/stats` GET
- `/api/auth` 未登录返回预期状态
- 静态 CSS、JS、Hero 与 favicon 可访问
- 响应无明显 5xx

有写入副作用的接口只在 Mock 或专用预发布环境测试。

### 发布后人工抽查

- 中文与英文切换。
- 深色、浅色、系统主题。
- 手机首页和聊天。
- 用户登录、退出。
- 公开留言的正常流程。
- 管理后台短期会话。
- MathJax 长讲义。
- 社交分享预览。

### Git 快速回滚

若单个阶段出现问题：

```powershell
git revert <问题阶段提交号>
& .\.venv\Scripts\python.exe scripts\build_site.py
npm run verify:release
git status --short
git push
```

如果回滚后构建产生生成文件差异：

```powershell
git add -- site docs/assets/knowledge
git commit -m "chore: sync generated site after rollback"
git push
```

若多个连续提交需要回滚：

```powershell
git revert --no-commit <最早提交号>^..<最晚提交号>
& .\.venv\Scripts\python.exe scripts\build_site.py
npm run verify:release
git commit -m "revert: roll back site improvement phase"
git push
```

禁止用 `git reset --hard` 回滚已发布版本。

### 环境开关紧急回滚

认证故障：

- `BIYING_AUTH_MODE` 和 `BIYING_STRICT_ORIGIN_CHECK` 属于阶段 2B 的待实现设计，当前运行时代码不读取，不能用于生产紧急回滚。
- 当前应通过 `git revert` 回滚到最近一个认证路径已验证的 `main` 提交，重新发布后执行线上只读冒烟。
- 阶段 2B 完成并通过开关契约测试后，才能按阶段 2B 的“快速回滚”步骤切换这两个变量。

统计写入异常：

```text
BIYING_STATS_WRITE_ENABLED=0
```

环境变量切换后仍需执行线上只读冒烟检查。

### 数据回滚原则

- 不删除新字段。
- 不全量删除新格式会话。
- 回滚代码应忽略未知字段。
- 如需清理生产数据，先导出备份并获得明确批准。

### 回滚演练验收

正式发布前至少在本地或预发布分支演练一次：

1. 部署/构建候选提交。
2. 回滚一个无数据迁移的阶段。
3. 重新构建。
4. 完整测试。
5. 确认站点恢复且工作区干净。

### 完成记录

- 发布候选分支 `codex/release-phase9-20260718` 在完整发布门禁通过后，以合并提交 `94f84a6` 进入 `main` 并推送；其第一父提交 `0170f5d` 是本轮阶段 4—9 的整体代码回滚点。
- 新增 `scripts/smoke_deployed.py`、`tests/test_smoke_deployed.py` 与 `npm run test:deployment`，对正式站点执行 13 项纯 GET 检查，覆盖 7 个关键页面、4 个阶段 8 静态资源、Functions/KV 统计读取和未登录认证状态；不自动执行登录、留言、后台或 AI 等有写入或凭据依赖的生产流程。
- 首次线上冒烟发现英文生成页的文档语言仍为中文；`8c56b78` 将文档语言写入构建后处理，并把 81 页语言契约纳入元数据门禁。修复发布后，`https://www.biying.site` 的 13 项线上冒烟全部通过。
- `0f16d28` 将原本捆绑的 CI 拆为具名门禁；Firefox 暴露了测试夹具给 sitemap 返回空 XML 的问题，`de2783a` 改为返回合法 XML，不忽略浏览器错误。GitHub Actions [#105](https://github.com/Lumner/Biying_digital_garden/actions/runs/29641580526) 中发布候选、Firefox、生成文件同步和可复现构建四步全部成功。
- 最终本地验证通过：API 21 项、部署冒烟单元测试 3 项、Chromium 192 项通过且 7 项按设备条件跳过、Firefox 33 项通过；81 页元数据、13 个样式文件、49 个 JavaScript 文件与 20 个一方脚本资源图均通过。发布目录 8.47 MiB，距总量预算 1.07 MiB。
- 在隔离 worktree 中按新到旧顺序回滚阶段 8 的 `6a569e0`、`146225f`、`0e189eb`，保留独立的测试稳定化提交 `ba32046`；重新构建后全部非浏览器门禁通过，单 worker Playwright 190 项通过、7 项按设备条件跳过，演练 worktree 随后移除，主工作区未被修改。
- 如需完整撤销本轮已经发布的阶段 4—9，应先按新到旧顺序回滚发布后的 `de2783a`、`0f16d28`、`8c56b78`，再执行 `git revert -m 1 94f84a6`，重新构建并运行 `npm run verify:release` 后才可推送。阶段完成记录属于文档证据；若与合并回滚发生冲突，只保留本条回滚记录，不保留“Completed”状态。

---

## 8. 风险矩阵

| 风险 | 概率 | 影响 | 预防 | 回滚 |
|---|---:|---:|---|---|
| Cookie 迁移导致用户掉线 | 中 | 高 | Bearer/dual/cookie 三模式 | 切回 `bearer` |
| CORS/Origin 配置误伤正式站点 | 中 | 高 | 先双模式和 Mock 测试 | 关闭严格校验并回滚 |
| KV 最终一致导致旧会话短时可见 | 中 | 高 | `sessionVersion` 二次校验 | 不依赖删除完成失效 |
| 首页改版丢失个性 | 中 | 中 | 结构和视觉分开确认 | 单独回滚视觉提交 |
| 讲义拆分破坏外链 | 中 | 高 | 保留原 URL 与锚点入口 | 一门课一个提交 |
| 图片优化导致模糊 | 低 | 中 | 响应式尺寸与视觉检查 | 恢复对应图片提交 |
| CSS 拆分改变层叠顺序 | 中 | 中 | 机械迁移、固定顺序 | 回滚 CSS 提交 |
| SEO 模板产生重复标签 | 中 | 中 | HTML 元数据自动检查 | 回滚模板提交 |
| 真实内容被 AI 编造 | 低 | 高 | 人工确认门 | 删除内容提交 |
| 旧文档误导后续开发 | 高 | 中 | 本文件为主入口 | 更新/归档旧文档 |

---

## 9. 每阶段 Codex 汇报模板

Codex 完成每个阶段后，必须使用以下格式：

```text
阶段：
结果：完成 / 阻塞 / 已回滚

主要改动：
- ...

修改文件：
- ...

自动测试：
- 命令：...
  结果：...

提交：
- <commit> <message>

当前工作区：
- clean / dirty

已知风险：
- ...

快速回滚：
- git revert <commit>

下一阶段：
- ...

是否需要用户确认：
- 是 / 否
```

不得只回复“已完成”或只列文件名。

---

## 10. 最终 Definition of Done

只有同时满足以下条件，整项网站改造才能标记完成：

- [ ] 状态表中 P0、P1 阶段完成，或明确记录为经用户接受的延后项。
- [ ] `npm run verify:release` 通过。
- [ ] CI 通过。
- [ ] `scripts/check_site_sync.py` 通过。
- [ ] 工作区干净。
- [ ] 无 Critical / Serious 无障碍问题。
- [ ] 320px、393px、768px、1440px 无横向溢出。
- [ ] 用户和管理员敏感 Token 不进入 Web Storage。
- [ ] 密码恢复不接受管理员 Token。
- [ ] 中英文页面描述、canonical 和 hreflang 正确。
- [ ] `site/` 满足资源预算。
- [ ] 首页定位和项目事实得到站点主人确认。
- [ ] 生产发布得到明确批准。
- [ ] 线上只读冒烟测试通过。
- [ ] 完成一次可复现回滚演练。
- [ ] 最终发布提交和回滚点已记录。

---

## 11. EdgeOne 实现依据

本计划采用以下保守判断：

- EdgeOne Functions 支持标准 Response Header 和 `Set-Cookie`，因此可以实现
  `HttpOnly`、`Secure`、`SameSite` Cookie。
- EdgeOne Pages KV 是最终一致存储，边缘节点可能短时读取旧值，不应承担强一致会话撤销或原子计数。
- Pages Functions KV 绑定公开文档中的 `put` 只保证 `key` 与 `value`；
  Tencent Cloud EdgeKV 管理 API 虽支持 `ExpirationTTL`，但不能把它直接等同为 Pages 运行时绑定能力。

官方参考：

- [EdgeOne Pages Functions 运行时](https://edgeone.ai/document/162227908259442688)
- [EdgeOne 设置 Cookie 示例](https://edgeone.ai/document/52708)
- [EdgeOne KV Storage 概览](https://edgeone.ai/document/78781)
- [EdgeOne Makers KV 运行时接口](https://pages.edgeone.ai/document/kv-storage)
- [EdgeKVPut 的 ExpirationTTL 管理 API](https://edgeone.ai/document/78824)

---

## 12. 建议优先执行顺序

第一批，必须优先：

```text
阶段 0 → 阶段 1 → 阶段 2A → 阶段 3A → 阶段 3B
```

第二批，稳定性与体验：

```text
阶段 2B → 阶段 3C → 阶段 6 → 阶段 7
```

第三批，需要站点主人内容或视觉确认：

```text
阶段 4 → 阶段 5
```

最后进行：

```text
阶段 2C → 阶段 8 → 阶段 9
```

如果资源有限，至少完成第一批；它们能显著降低安全、移动端和后续开发回归风险。
