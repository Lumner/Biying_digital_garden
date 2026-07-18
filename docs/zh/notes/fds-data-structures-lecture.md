---
title: FDS 数据结构基础讲义
summary: FDS 数据结构基础中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。
description: FDS 数据结构基础中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。
public: true
avatar_readable: true
author: Lumner
course: FDS 数据结构基础
category: algorithms
recommended: true
updated: 2026-07-18
reading_order: 30
tags:
  - data-structures
  - algorithms
  - course-note
---

# FDS 数据结构基础讲义

!!! info "拆分状态"
    这页保留原来的 `/zh/notes/fds-data-structures-lecture/` 地址，作为 FDS 数据结构基础讲义总览和旧链接兼容层。章节正文已经拆分到稳定子路径；如果旧链接带有 `#note-sec-...` 锚点，可在本页的“旧锚点跳转表”找到对应新位置。

## 阅读导引 { #reading-guide }

这门课的主线是：用合适的数据组织方式，让算法能在可接受的时间和空间内完成任务。阅读时不要只背接口名称，而要追问结构维护了什么不变量、操作如何保持不变量、复杂度来自哪里。

## 课程目标

- 掌握算法分析、ADT、线性结构、树、堆、并查集、线段树和图的核心结构。
- 能根据操作频率和不变量选择合适的数据结构。
- 能解释关键操作的时间复杂度和常见边界错误。

## 前置知识

- 基础 C/伪代码、数组、指针或引用、递归和简单数学符号。
- 能阅读 \(O(N)\)、\(O(\log N)\)、\(O(N\log N)\) 等复杂度记号。

## 总体建议用时

建议按 10 个主体章节分 5–8 周学习；如果只做复习，可先读第 1、2、3、4、6、7、8、9 章，再查附录。

## 总体练习建议

- 每章至少写一张“结构卡”：存储方式、不变量、关键操作、复杂度、易错点。
- 对算法过程，手算一个小样例，再写伪代码。
- 对复杂度，说明瓶颈来自循环、递归深度、树高还是边数。

## 课程来源与引用边界

- 整理者：Lumner。
- 内容来源：根据 `FDS/` 目录下现有数据结构课件与 `note/FDS_数据结构基础讲义.md` 整理。
- 站内用途：作为公开学习笔记和碧影可读取的公共知识来源。
- 引用边界：这不是课程官方教材，也不替代教师课件、课堂说明或考试要求；外部引用时请注明来自本网站整理版。

## 章节入口

- [0. 课程视角：为什么需要数据结构](fds-data-structures-lecture/chapter-00-course-view.md)：数据组织方式、操作频率、规模增长和结构选择的基本问题。（建议 1–2 小时）
- [1. 算法分析](fds-data-structures-lecture/chapter-01-algorithm-analysis.md)：算法与程序、分析对象、渐进记号、最大子列和、二分查找和复杂度检查。（建议 4–5 小时）
- [2. 抽象数据类型与线性表](fds-data-structures-lecture/chapter-02-lists.md)：ADT、数组表、链表、双向循环链表、多项式 ADT、多重链表和游标实现。（建议 5–6 小时）
- [3. 栈与队列](fds-data-structures-lecture/chapter-03-stacks-queues.md)：栈 ADT、括号匹配、表达式求值、中缀转后缀、系统栈、队列和循环队列。（建议 4–5 小时）
- [4. 树与二叉树](fds-data-structures-lecture/chapter-04-trees.md)：树术语、树的表示、二叉树、表达式树、遍历、非递归遍历和线索二叉树。（建议 5–6 小时）
- [5. 二叉搜索树](fds-data-structures-lecture/chapter-05-binary-search-trees.md)：二叉搜索树定义、查找、最值、插入、删除、懒惰删除和平均/退化情况。（建议 3–4 小时）
- [6. 优先队列与二叉堆](fds-data-structures-lecture/chapter-06-heaps.md)：优先队列 ADT、实现对比、堆序性、插入、删除最小值、建堆、应用和 d-堆。（建议 4–5 小时）
- [7. 并查集](fds-data-structures-lecture/chapter-07-union-find.md)：等价关系、动态等价问题、基本表示、按大小/高度合并、路径压缩和典型应用。（建议 3–4 小时）
- [8. 线段树](fds-data-structures-lecture/chapter-08-segment-trees.md)：区间结构动机、适用算子、建树、区间查询、点更新、区间更新和懒标记。（建议 5–6 小时）
- [9. 图与拓扑排序](fds-data-structures-lecture/chapter-09-graphs-toposort.md)：图定义、图存储、AOV 网络、拓扑序、朴素拓扑排序和队列优化拓扑排序。（建议 4–5 小时）
- [附录：复杂度速查与结构选择](fds-data-structures-lecture/appendix-reference.md)：复杂度表、选结构模板、后续扩展记录。

## 章节与课件对应表

| 章节 | 覆盖内容 | 对应课件 |
| --- | --- | --- |
| [0. 课程视角：为什么需要数据结构](fds-data-structures-lecture/chapter-00-course-view.md) | 数据组织方式、操作频率、规模增长和结构选择的基本问题。 | `FDS/DS00-2026.pdf` |
| [1. 算法分析](fds-data-structures-lecture/chapter-01-algorithm-analysis.md) | 算法与程序、分析对象、渐进记号、最大子列和、二分查找和复杂度检查。 | `FDS/DS01_Ch02_Algorithm Analysis(a)-2026.pdf, FDS/DS02_Ch02_Algorithm Analysis(b).ppt` |
| [2. 抽象数据类型与线性表](fds-data-structures-lecture/chapter-02-lists.md) | ADT、数组表、链表、双向循环链表、多项式 ADT、多重链表和游标实现。 | `FDS/DS02_Ch03_List.ppt` |
| [3. 栈与队列](fds-data-structures-lecture/chapter-03-stacks-queues.md) | 栈 ADT、括号匹配、表达式求值、中缀转后缀、系统栈、队列和循环队列。 | `FDS/DS03_Ch03_Stack and Queue.ppt` |
| [4. 树与二叉树](fds-data-structures-lecture/chapter-04-trees.md) | 树术语、树的表示、二叉树、表达式树、遍历、非递归遍历和线索二叉树。 | `FDS/DS04_Ch04_Binary Trees.ppt` |
| [5. 二叉搜索树](fds-data-structures-lecture/chapter-05-binary-search-trees.md) | 二叉搜索树定义、查找、最值、插入、删除、懒惰删除和平均/退化情况。 | `FDS/DS05_Ch04_Search Tree.pdf` |
| [6. 优先队列与二叉堆](fds-data-structures-lecture/chapter-06-heaps.md) | 优先队列 ADT、实现对比、堆序性、插入、删除最小值、建堆、应用和 d-堆。 | `FDS/DS06_Ch05_Priority Queues.ppt` |
| [7. 并查集](fds-data-structures-lecture/chapter-07-union-find.md) | 等价关系、动态等价问题、基本表示、按大小/高度合并、路径压缩和典型应用。 | `FDS/DS07_Ch08_Union and Find.ppt` |
| [8. 线段树](fds-data-structures-lecture/chapter-08-segment-trees.md) | 区间结构动机、适用算子、建树、区间查询、点更新、区间更新和懒标记。 | `FDS/DS07_Segment Tree.pdf` |
| [9. 图与拓扑排序](fds-data-structures-lecture/chapter-09-graphs-toposort.md) | 图定义、图存储、AOV 网络、拓扑序、朴素拓扑排序和队列优化拓扑排序。 | `FDS/DS08_Ch09_Graph Definition_Topological Sort.ppt` |

## 旧锚点跳转表

下面的条目用于兼容旧版长页面的 `#note-sec-...` 锚点。锚点本身保留在本页；点击条目会进入新的章节子页面或附录页。

- <span id="note-sec-001"></span>[使用说明](#reading-guide)
- <span id="note-sec-002"></span>[资料来源索引](#reading-guide)
- <span id="note-sec-003"></span>[全课知识结构](#reading-guide)
- <span id="note-sec-004"></span>[0. 课程视角：为什么需要数据结构](fds-data-structures-lecture/chapter-00-course-view.md#note-sec-004)
- <span id="note-sec-005"></span>[1. 算法分析](fds-data-structures-lecture/chapter-01-algorithm-analysis.md#note-sec-005)
  - <span id="note-sec-006"></span>[1.1 算法与程序](fds-data-structures-lecture/chapter-01-algorithm-analysis.md#note-sec-006)
  - <span id="note-sec-007"></span>[1.2 分析什么](fds-data-structures-lecture/chapter-01-algorithm-analysis.md#note-sec-007)
  - <span id="note-sec-008"></span>[1.3 渐进记号](fds-data-structures-lecture/chapter-01-algorithm-analysis.md#note-sec-008)
  - <span id="note-sec-009"></span>[1.4 最大子列和：同一问题的四种算法](fds-data-structures-lecture/chapter-01-algorithm-analysis.md#note-sec-009)
  - <span id="note-sec-014"></span>[1.5 二分查找与对数复杂度](fds-data-structures-lecture/chapter-01-algorithm-analysis.md#note-sec-014)
  - <span id="note-sec-015"></span>[1.6 检查复杂度分析](fds-data-structures-lecture/chapter-01-algorithm-analysis.md#note-sec-015)
- <span id="note-sec-016"></span>[2. 抽象数据类型与线性表](fds-data-structures-lecture/chapter-02-lists.md#note-sec-016)
  - <span id="note-sec-017"></span>[2.1 ADT：把“是什么”和“怎么做”分开](fds-data-structures-lecture/chapter-02-lists.md#note-sec-017)
  - <span id="note-sec-018"></span>[2.2 数组实现线性表](fds-data-structures-lecture/chapter-02-lists.md#note-sec-018)
  - <span id="note-sec-019"></span>[2.3 链表实现线性表](fds-data-structures-lecture/chapter-02-lists.md#note-sec-019)
  - <span id="note-sec-022"></span>[2.4 双向循环链表](fds-data-structures-lecture/chapter-02-lists.md#note-sec-022)
  - <span id="note-sec-023"></span>[2.5 多项式 ADT](fds-data-structures-lecture/chapter-02-lists.md#note-sec-023)
  - <span id="note-sec-024"></span>[2.6 多重链表与稀疏矩阵](fds-data-structures-lecture/chapter-02-lists.md#note-sec-024)
  - <span id="note-sec-025"></span>[2.7 游标实现链表](fds-data-structures-lecture/chapter-02-lists.md#note-sec-025)
- <span id="note-sec-026"></span>[3. 栈与队列](fds-data-structures-lecture/chapter-03-stacks-queues.md#note-sec-026)
  - <span id="note-sec-027"></span>[3.1 栈 ADT](fds-data-structures-lecture/chapter-03-stacks-queues.md#note-sec-027)
  - <span id="note-sec-028"></span>[3.2 栈应用一：括号匹配](fds-data-structures-lecture/chapter-03-stacks-queues.md#note-sec-028)
  - <span id="note-sec-029"></span>[3.3 栈应用二：后缀表达式求值](fds-data-structures-lecture/chapter-03-stacks-queues.md#note-sec-029)
  - <span id="note-sec-030"></span>[3.4 栈应用三：中缀转后缀](fds-data-structures-lecture/chapter-03-stacks-queues.md#note-sec-030)
  - <span id="note-sec-031"></span>[3.5 系统栈与递归](fds-data-structures-lecture/chapter-03-stacks-queues.md#note-sec-031)
  - <span id="note-sec-032"></span>[3.6 队列 ADT](fds-data-structures-lecture/chapter-03-stacks-queues.md#note-sec-032)
  - <span id="note-sec-033"></span>[3.7 循环队列](fds-data-structures-lecture/chapter-03-stacks-queues.md#note-sec-033)
- <span id="note-sec-034"></span>[4. 树与二叉树](fds-data-structures-lecture/chapter-04-trees.md#note-sec-034)
  - <span id="note-sec-035"></span>[4.1 树的基本术语](fds-data-structures-lecture/chapter-04-trees.md#note-sec-035)
  - <span id="note-sec-036"></span>[4.2 树的表示](fds-data-structures-lecture/chapter-04-trees.md#note-sec-036)
  - <span id="note-sec-039"></span>[4.3 二叉树](fds-data-structures-lecture/chapter-04-trees.md#note-sec-039)
  - <span id="note-sec-040"></span>[4.4 表达式树](fds-data-structures-lecture/chapter-04-trees.md#note-sec-040)
  - <span id="note-sec-041"></span>[4.5 树遍历](fds-data-structures-lecture/chapter-04-trees.md#note-sec-041)
  - <span id="note-sec-046"></span>[4.6 递归遍历与非递归遍历](fds-data-structures-lecture/chapter-04-trees.md#note-sec-046)
  - <span id="note-sec-047"></span>[4.7 线索二叉树](fds-data-structures-lecture/chapter-04-trees.md#note-sec-047)
- <span id="note-sec-048"></span>[5. 二叉搜索树](fds-data-structures-lecture/chapter-05-binary-search-trees.md#note-sec-048)
  - <span id="note-sec-049"></span>[5.1 定义](fds-data-structures-lecture/chapter-05-binary-search-trees.md#note-sec-049)
  - <span id="note-sec-050"></span>[5.2 查找](fds-data-structures-lecture/chapter-05-binary-search-trees.md#note-sec-050)
  - <span id="note-sec-051"></span>[5.3 查找最小值和最大值](fds-data-structures-lecture/chapter-05-binary-search-trees.md#note-sec-051)
  - <span id="note-sec-052"></span>[5.4 插入](fds-data-structures-lecture/chapter-05-binary-search-trees.md#note-sec-052)
  - <span id="note-sec-053"></span>[5.5 删除](fds-data-structures-lecture/chapter-05-binary-search-trees.md#note-sec-053)
  - <span id="note-sec-054"></span>[5.6 懒惰删除](fds-data-structures-lecture/chapter-05-binary-search-trees.md#note-sec-054)
  - <span id="note-sec-055"></span>[5.7 平均情况与退化](fds-data-structures-lecture/chapter-05-binary-search-trees.md#note-sec-055)
- <span id="note-sec-056"></span>[6. 优先队列与二叉堆](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-056)
  - <span id="note-sec-057"></span>[6.1 优先队列 ADT](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-057)
  - <span id="note-sec-058"></span>[6.2 简单实现对比](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-058)
  - <span id="note-sec-059"></span>[6.3 二叉堆的两个性质](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-059)
  - <span id="note-sec-060"></span>[6.4 插入：上滤](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-060)
  - <span id="note-sec-061"></span>[6.5 删除最小值：下滤](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-061)
  - <span id="note-sec-062"></span>[6.6 建堆](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-062)
  - <span id="note-sec-063"></span>[6.7 其他操作和应用](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-063)
  - <span id="note-sec-064"></span>[6.8 d-堆](fds-data-structures-lecture/chapter-06-heaps.md#note-sec-064)
- <span id="note-sec-065"></span>[7. 并查集](fds-data-structures-lecture/chapter-07-union-find.md#note-sec-065)
  - <span id="note-sec-066"></span>[7.1 等价关系](fds-data-structures-lecture/chapter-07-union-find.md#note-sec-066)
  - <span id="note-sec-067"></span>[7.2 动态等价问题](fds-data-structures-lecture/chapter-07-union-find.md#note-sec-067)
  - <span id="note-sec-068"></span>[7.3 基本表示](fds-data-structures-lecture/chapter-07-union-find.md#note-sec-068)
  - <span id="note-sec-069"></span>[7.4 按大小合并与按高度合并](fds-data-structures-lecture/chapter-07-union-find.md#note-sec-069)
  - <span id="note-sec-070"></span>[7.5 路径压缩](fds-data-structures-lecture/chapter-07-union-find.md#note-sec-070)
  - <span id="note-sec-071"></span>[7.6 复杂度](fds-data-structures-lecture/chapter-07-union-find.md#note-sec-071)
  - <span id="note-sec-072"></span>[7.7 典型应用](fds-data-structures-lecture/chapter-07-union-find.md#note-sec-072)
- <span id="note-sec-073"></span>[8. 线段树](fds-data-structures-lecture/chapter-08-segment-trees.md#note-sec-073)
  - <span id="note-sec-074"></span>[8.1 动机](fds-data-structures-lecture/chapter-08-segment-trees.md#note-sec-074)
  - <span id="note-sec-075"></span>[8.2 适用的“算子”](fds-data-structures-lecture/chapter-08-segment-trees.md#note-sec-075)
  - <span id="note-sec-076"></span>[8.3 建树](fds-data-structures-lecture/chapter-08-segment-trees.md#note-sec-076)
  - <span id="note-sec-077"></span>[8.4 区间查询](fds-data-structures-lecture/chapter-08-segment-trees.md#note-sec-077)
  - <span id="note-sec-078"></span>[8.5 点更新](fds-data-structures-lecture/chapter-08-segment-trees.md#note-sec-078)
  - <span id="note-sec-079"></span>[8.6 区间更新与懒标记](fds-data-structures-lecture/chapter-08-segment-trees.md#note-sec-079)
  - <span id="note-sec-080"></span>[8.7 线段树常见错误](fds-data-structures-lecture/chapter-08-segment-trees.md#note-sec-080)
- <span id="note-sec-081"></span>[9. 图与拓扑排序](fds-data-structures-lecture/chapter-09-graphs-toposort.md#note-sec-081)
  - <span id="note-sec-082"></span>[9.1 图的基本定义](fds-data-structures-lecture/chapter-09-graphs-toposort.md#note-sec-082)
  - <span id="note-sec-083"></span>[9.2 图的存储](fds-data-structures-lecture/chapter-09-graphs-toposort.md#note-sec-083)
  - <span id="note-sec-086"></span>[9.3 AOV 网络](fds-data-structures-lecture/chapter-09-graphs-toposort.md#note-sec-086)
  - <span id="note-sec-087"></span>[9.4 拓扑序](fds-data-structures-lecture/chapter-09-graphs-toposort.md#note-sec-087)
  - <span id="note-sec-088"></span>[9.5 朴素拓扑排序](fds-data-structures-lecture/chapter-09-graphs-toposort.md#note-sec-088)
  - <span id="note-sec-089"></span>[9.6 队列优化拓扑排序](fds-data-structures-lecture/chapter-09-graphs-toposort.md#note-sec-089)
  - <span id="note-sec-090"></span>[9.7 拓扑排序的本质](fds-data-structures-lecture/chapter-09-graphs-toposort.md#note-sec-090)
- <span id="note-sec-091"></span>[10. 全课复杂度速查](fds-data-structures-lecture/appendix-reference.md#note-sec-091)
- <span id="note-sec-092"></span>[11. 选结构的思考模板](fds-data-structures-lecture/appendix-reference.md#note-sec-092)
- <span id="note-sec-093"></span>[12. 后续扩展区](fds-data-structures-lecture/appendix-reference.md#note-sec-093)
  - <span id="note-sec-094"></span>[后续扩展登记表](fds-data-structures-lecture/appendix-reference.md#note-sec-094)
  - <span id="note-sec-095"></span>[新主题记录格式](fds-data-structures-lecture/appendix-reference.md#note-sec-095)
