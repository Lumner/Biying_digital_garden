# 碧影数字花园 UI 动态化改进方案

> 历史视觉方案：其中多数工作已经实施，具体选择器和文件路径可能过时。
> 当前视觉架构以 `ARCHITECTURE.md` 和 `docs/assets/styles/` 为准。

本文档用于指导后续 AI 或开发者优化“碧影数字花园”的前端 UI。目标不是把网站做成炫技页面，而是在保持可读性和稳定性的前提下，增加轻量、自然、有生命力的动态元素。

## 1. 设计目标

本次前端优化的目标：

- 保持安静、克制、耐看的赛博感。
- 增加轻量动态元素，让页面更有生命力。
- 强化“碧影”作为网站同行者的存在感。
- 提升首页、笔记、项目、碧影、留言页面的浏览体验。
- 保证移动端可用性优先，不能因为动画导致卡顿、遮挡、横向滚动或排版错乱。

整体方向：

```txt
暗色数字花园 + 轻微呼吸感 + 纸质笔记/书籍意象 + 碧影陪伴感
```

## 2. 总体设计原则

### 2.1 动态元素要轻

避免大面积粒子、复杂 3D、过度闪烁、强烈霓虹动画。

推荐使用：

- `opacity`
- `transform`
- `filter`
- `background-position`
- `clip-path`
- `box-shadow`
- `CSS transition`
- `IntersectionObserver`
- 少量 `requestAnimationFrame`

不推荐：

- 大量 DOM 粒子。
- Canvas 全屏特效。
- 高频滚动监听。
- 复杂 SVG 路径动画。
- 自动播放音效。
- 大面积炫光背景。

### 2.2 动画要有意义

每个动态元素都应该服务于信息理解：

- 首页动态：帮助访客快速理解网站气质。
- 笔记动态：帮助阅读、定位、分类。
- 项目动态：帮助理解项目进展和成果。
- 碧影动态：增强陪伴感，而不是变成客服弹窗。
- 留言动态：让互动更自然。

### 2.3 尊重用户设备

必须支持减少动态效果偏好：

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

移动端必须检查：

- 不出现横向滚动。
- 聊天窗口不被浏览器底栏遮挡。
- 长公式、长链接、长中文句子不会撑破布局。
- 动画不会造成滚动卡顿。

## 3. 首页动态设计

### 3.1 强化随机书封

当前首页已有随机笔记封面，可以继续升级为“数字藏书卡”。

建议效果：

- 每次刷新随机生成一本书封。
- 书封包含笔记标题、分类标签、最近更新时间、一句摘要。
- 鼠标悬停时书封轻微倾斜。
- 移动端点击时轻微按压反馈。
- 点击书封进入对应笔记。

实现位置：

- `docs/assets/javascripts/random-note-cover.js`
- `docs/assets/styles/cyber.css`

注意：

- 不要使用真实 3D。
- 使用 `transform: rotateX() rotateY()` 即可。
- 移动端关闭 hover 透视效果。

### 3.2 首页入口按钮微动效

首页按钮包括：

- 和碧影对话。
- 查看项目。
- 进入笔记。

建议：

- hover 时边框亮起。
- 点击时轻微下沉。
- 当前主入口“和碧影对话”可以有非常轻的呼吸光。

不要做：

- 按钮一直闪烁。
- 强烈霓虹扫光。
- 大面积渐变动画。

### 3.3 首页内容分区渐入

首页主要区块可加入滚动进入动画：

- 最近更新。
- 推荐阅读。
- 项目入口。
- 碧影入口。

实现方式：

- 新增 `docs/assets/javascripts/reveal-on-scroll.js`。
- 给需要渐入的元素添加类名：`reveal`。
- 使用 `IntersectionObserver`。
- 动画只执行一次。

示例样式：

```css
.reveal {
  opacity: 0;
  transform: translateY(16px);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

## 4. 导航与语言切换

### 4.1 顶部导航当前状态增强

当前页面所在导航项建议增加：

- 下划线滑动指示。
- 轻微青绿色高亮。
- hover 时背景浅亮。

文件：

- `docs/assets/styles/cyber.css`

要求：

- 不能大幅改变 MkDocs Material 的基础结构。
- 不要让导航栏高度变化。
- 移动端保持简洁。

### 4.2 中英文切换更像正式网站

语言切换保持轻量：

```txt
中文 | EN
```

建议优化：

- 当前语言高亮。
- 切换时页面不要显示两套语言。
- hover 时仅文字亮起，不加大块按钮。
- 移动端保持一行，不挤压搜索图标。

文件：

- `docs/assets/javascripts/language-switch.js`
- `docs/assets/styles/cyber.css`

## 5. 笔记页动态设计

### 5.1 阅读进度条优化

当前已有阅读进度，可以继续增强：

- 页面顶部细线进度条。
- 右侧目录当前章节高亮。
- 移动端不显示复杂目录，只保留顶部进度。

文件：

- `docs/assets/javascripts/note-reader.js`
- `docs/assets/styles/cyber.css`

### 5.2 公式渲染后的稳定处理

数学公式加载后容易导致页面跳动。

建议：

- MathJax 渲染完成后给页面添加类名 `math-ready`。
- 公式区域在渲染前保留最小高度。
- 避免公式渲染后把段落挤开太多。

文件：

- `docs/assets/javascripts/mathjax.js`
- `docs/assets/styles/cyber.css`

### 5.3 标签和分类交互

笔记首页建议加入：

- 标签筛选时卡片平滑重排。
- 当前筛选条件显示为小标签。
- “清除筛选”按钮。
- 最近更新、推荐阅读、分类列表视觉上区分清楚。

文件：

- `docs/assets/javascripts/notes-hub.js`
- `docs/assets/styles/cyber.css`

注意：

- 不要让标签点击跳到 404。
- 标签应该是前端筛选，或者跳转到真实存在的分类页。
- 如果没有实际页面，不要生成普通 `<a href>`。

## 6. 项目页动态设计

### 6.1 项目卡片

项目列表页每个项目卡片建议包含：

- 项目名。
- 一句话简介。
- 技术栈标签。
- 当前状态。
- 查看详情入口。

动态：

- hover 时边框亮起。
- 技术标签轻微浮现。
- 卡片不要大幅移动。

### 6.2 项目详情页

项目详情页建议固定结构：

```txt
背景
我做了什么
技术栈
成果
不足
下一步
```

动态建议：

- 技术栈标签进入视口时依次出现。
- 成果和不足使用左右两栏，移动端改为上下排列。
- “下一步”做成轻量 timeline。

文件：

- `docs/zh/projects/*`
- `docs/en/projects/*`
- `docs/assets/styles/cyber.css`

## 7. 碧影页面动态设计

### 7.1 碧影入口更像“同行者”

碧影不应该像客服按钮，而应该像网站里的一个安静存在。

建议：

- 首页和碧影页都有自然介绍。
- 不展示提示词。
- 不强调性别。
- 文案自然、温和、随和。

文案示例：

```txt
你好，很高兴认识你。
我会从这个网站已经公开的内容里陪你慢慢聊。
如果问题不在这些内容里，我也会先说明，再尽量用通用知识帮你。
```

### 7.2 聊天框动画

聊天框建议：

- 打开时从底部或侧边轻轻浮现。
- 新消息出现时轻微上移淡入。
- 正在回复时显示三点呼吸动画。
- 回复完成后 MathJax 再渲染公式。
- Markdown 渲染后保持段落间距舒适。

文件：

- `docs/assets/javascripts/biying-chat.js`
- `docs/assets/styles/cyber.css`

### 7.3 移动端聊天模式

移动端建议使用全屏聊天体验：

- 宽度 `100vw`。
- 高度使用 `100dvh`。
- 输入区固定在底部。
- 消息区独立滚动。
- 禁止横向滚动。
- 长公式允许横向滚动，但只在公式块内部滚动。

关键 CSS 方向：

```css
@media (max-width: 760px) {
  .biying-chat-panel {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
  }

  .biying-chat-log {
    overflow-y: auto;
    overflow-x: hidden;
  }

  .biying-message {
    max-width: 100%;
    writing-mode: horizontal-tb;
    word-break: normal;
    overflow-wrap: anywhere;
  }

  .biying-message mjx-container {
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }
}
```

## 8. 留言页动态设计

### 8.1 留言输入体验

建议加入：

- 字数统计。
- 提交间隔提示。
- 登录状态提示。
- 提交成功后新留言淡入。
- 错误提示不要生硬。

文案示例：

```txt
已经收到，我会在之后看到它。
```

而不是：

```txt
提交成功
```

### 8.2 留言卡片

公开留言卡片建议：

- 显示用户名、时间、内容。
- 站主留言可有轻量标识。
- 用户自己的留言显示编辑/删除。
- 管理员显示隐藏/删除。

动态：

- 新留言淡入。
- 删除时淡出。
- 编辑时卡片边框轻微亮起。

文件：

- `docs/assets/javascripts/guestbook.js`
- `docs/assets/styles/cyber.css`

## 9. 后台页面设计

后台页面不需要花哨，但需要清晰。

建议：

- 用户、留言、私信、恢复码分为 tabs。
- 未读私信有明显标识。
- 删除、注销等危险操作使用低饱和红色。
- 操作成功后使用轻量 toast。
- 后台不要使用过多装饰动画。

文件：

- `docs/assets/javascripts/admin-dashboard.js`
- `docs/assets/styles/cyber.css`

## 10. 新增文件建议

建议新增：

```txt
docs/assets/javascripts/reveal-on-scroll.js
docs/assets/javascripts/toast.js
```

可选新增：

```txt
docs/assets/javascripts/motion-preferences.js
```

如果新增 JS，需要同步修改：

```txt
mkdocs.yml
```

并更新版本号，例如：

```yaml
extra_javascript:
  - assets/javascripts/reveal-on-scroll.js?v=20260521-1
```

## 11. 颜色与视觉建议

当前不要让整个网站只剩蓝紫赛博色。

建议保留：

```txt
主背景：深墨色 / 近黑
主文字：柔和白
强调色：青蓝
辅助色：浅绿 / 暖黄
危险色：低饱和红
```

使用策略：

- 青蓝用于链接、边框、当前状态。
- 浅绿用于公开、可读、在线。
- 暖黄用于提示、推荐阅读、笔记封面点缀。
- 红色只用于危险操作或错误。

## 12. 开发顺序建议

### 第一阶段：低风险动态

1. 增加 `reveal-on-scroll.js`。
2. 首页区块加入渐入。
3. 优化按钮 hover / active。
4. 优化导航当前状态。
5. 优化语言切换状态。

### 第二阶段：笔记体验

1. 优化阅读进度条。
2. 优化右侧目录当前章节高亮。
3. 优化标签筛选。
4. 修复不存在的标签跳转。
5. 优化公式块移动端横向滚动。

### 第三阶段：碧影体验

1. 优化聊天开合动画。
2. 增加 typing 状态。
3. 优化消息出现动画。
4. 强化移动端全屏聊天。
5. 检查 Markdown 和 MathJax 渲染后的排版。

### 第四阶段：留言和后台

1. 留言提交淡入。
2. 留言删除淡出。
3. 添加 toast。
4. 后台 tabs 和筛选体验优化。
5. 危险操作二次确认视觉优化。

## 13. 验收标准

完成后至少检查以下页面。

桌面端：

- `http://127.0.0.1:8000/zh/`
- `http://127.0.0.1:8000/zh/notes/`
- `http://127.0.0.1:8000/zh/projects/`
- `http://127.0.0.1:8000/zh/avatar/`
- `http://127.0.0.1:8000/zh/guestbook/`

移动端重点检查：

- 首页不横向滚动。
- 笔记公式不撑破页面。
- 碧影聊天不竖排。
- 碧影聊天输入框不被底部遮挡。
- 留言输入区可以正常提交。
- 语言切换不挤压导航。

常用命令：

```powershell
cd C:\Users\17597\Desktop\codex\biying-digital-garden
.venv\Scripts\python scripts\build_site.py
node --check docs\assets\javascripts\biying-chat.js
node --check docs\assets\javascripts\guestbook.js
node --check docs\assets\javascripts\notes-hub.js
node --check docs\assets\javascripts\note-reader.js
```

如果新增 JS，也要运行：

```powershell
node --check docs\assets\javascripts\reveal-on-scroll.js
node --check docs\assets\javascripts\toast.js
```

## 14. 最重要的注意事项

不要为了“动态”牺牲阅读。

这个网站的核心仍然是：

- 笔记可读。
- 项目清楚。
- 碧影自然。
- 留言舒服。
- 移动端稳定。

动态元素应该像呼吸一样存在，而不是抢走内容本身的注意力。
