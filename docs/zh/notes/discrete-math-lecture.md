---
title: 离散数学讲义
summary: 离散数学中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。
description: 离散数学中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。
public: true
avatar_readable: true
author: Lumner
course: 离散数学
category: math
recommended: true
updated: 2026-07-18
reading_order: 10
tags:
  - math
  - discrete-math
  - course-note
---

# 离散数学讲义

!!! info "拆分状态"
    这页保留原来的 `/zh/notes/discrete-math-lecture/` 地址，作为离散数学讲义总览和旧链接兼容层。章节正文已经拆分到稳定子路径；如果旧链接带有 `#note-sec-...` 锚点，可在本页的“旧锚点跳转表”找到对应新位置。

## 阅读导引 { #reading-guide }

这份讲义按章节组织，目标不是逐页复述课件，而是把课件中的定义、定理、方法、例题类型和解题套路整理成可复习、可发布到笔记网站的 Markdown 文档。

建议阅读顺序：

1. 先从本页确认章节、资料来源和学习路线。
2. 进入具体章节页，先读“学习目标、前置知识、建议用时、练习建议”。
3. 章节内按原讲义结构学习定义、定理、例题和小结。
4. 需要查旧链接时，回到本页使用“旧锚点跳转表”。

## 课程目标

- 建立命题逻辑、谓词逻辑和证明方法的基础语言。
- 掌握集合、函数、序列、算法、归纳递归、计数和关系等离散结构。
- 能把定义、证明、复杂度和计数模型整理成可复习的知识网络。

## 前置知识

- 高中集合、函数和基础代数表达。
- 基本程序流程概念，例如条件、循环、递归和伪代码。
- 能阅读 Markdown 数学公式，例如 `$p \to q$`、`$\forall x P(x)$`、`$O(n\log n)$`。

## 总体建议用时

建议按 7 个真实章节分 4–6 周学习；每章 3–8 小时不等。若只是复习，可先读第 1、2、6、9 章，再回看算法、归纳和高级计数。

## 总体练习建议

- 每章至少整理一张概念表，记录定义、符号、典型题型和易错点。
- 对证明类章节，保留完整推理链，不只写结论。
- 对计数与关系类章节，优先写清对象、限制条件和建模方式。

## 课程来源与引用边界

- 整理者：Lumner。
- 内容来源：根据 `DM/` 目录下现有离散数学课件与 `note/离散数学讲义.md` 整理。
- 站内用途：作为公开学习笔记和碧影可读取的公共知识来源。
- 引用边界：这不是课程官方教材，也不替代教师课件、课堂说明或考试要求；外部引用时请注明来自本网站整理版。

## 章节入口

- [第 1 章 逻辑与证明](discrete-math-lecture/chapter-01-logic-proofs.md)：命题逻辑、谓词逻辑、推理规则和证明策略。（建议 4–6 小时）
- [第 2 章 基本结构：集合、函数、序列、基数和矩阵](discrete-math-lecture/chapter-02-basic-structures.md)：集合、函数、序列、基数和矩阵的基础语言。（建议 5–7 小时）
- [第 3 章 算法](discrete-math-lecture/chapter-03-algorithms.md)：算法定义、伪代码、搜索排序和函数增长。（建议 3–4 小时）
- [第 5 章 归纳与递归](discrete-math-lecture/chapter-05-induction-recursion.md)：数学归纳法、强归纳、递归定义和递归算法。（建议 4–6 小时）
- [第 6 章 计数](discrete-math-lecture/chapter-06-counting.md)：加法/乘法原则、排列组合、二项式系数和广义排列组合。（建议 5–7 小时）
- [第 8 章 高级计数技术](discrete-math-lecture/chapter-08-advanced-counting.md)：递推关系、分治递推、生成函数、容斥和错排。（建议 6–8 小时）
- [第 9 章 关系](discrete-math-lecture/chapter-09-relations.md)：关系定义、性质、矩阵/有向图表示、闭包和等价关系。（建议 5–6 小时）
- [附录：符号与证明模板](discrete-math-lecture/appendix-reference.md)：常用符号、证明模板、更新记录和后续扩展边界。

## 章节与课件对应表

| 章节 | 覆盖内容 | 对应课件 |
| --- | --- | --- |
| [第 1 章 逻辑与证明](discrete-math-lecture/chapter-01-logic-proofs.md) | 命题逻辑、谓词逻辑、推理规则和证明策略。 | `DM1.1(8).pdf, DM1.2-1.3(5).pdf, DM1.4(6).pdf, DM1.5(5).pdf, DM1.6(6).pdf, DM1.7-1.8(6).pdf` |
| [第 2 章 基本结构：集合、函数、序列、基数和矩阵](discrete-math-lecture/chapter-02-basic-structures.md) | 集合、函数、序列、基数和矩阵的基础语言。 | `DM2.1.pdf, DM2.2.pdf, DM2.3.pdf, DM2.4.pdf, DM2.5-2.6(5).pdf` |
| [第 3 章 算法](discrete-math-lecture/chapter-03-algorithms.md) | 算法定义、伪代码、搜索排序和函数增长。 | `DM3.1-3.3(4).pdf` |
| [第 5 章 归纳与递归](discrete-math-lecture/chapter-05-induction-recursion.md) | 数学归纳法、强归纳、递归定义和递归算法。 | `DM5.1-5.4(7).pdf` |
| [第 6 章 计数](discrete-math-lecture/chapter-06-counting.md) | 加法/乘法原则、排列组合、二项式系数和广义排列组合。 | `DM6.1(3).pdf, DM6.2(3).pdf, DM6.3-6.4(6).pdf, DM6.5(3).pdf` |
| [第 8 章 高级计数技术](discrete-math-lecture/chapter-08-advanced-counting.md) | 递推关系、分治递推、生成函数、容斥和错排。 | `DM8.1-8.2(6).pdf, DM8.3.pdf, DM8.4(6).pdf, DM8.5-8.6(9).pdf` |
| [第 9 章 关系](discrete-math-lecture/chapter-09-relations.md) | 关系定义、性质、矩阵/有向图表示、闭包和等价关系。 | `DM9.1-9.3(8).pdf, DM9.4(6).pdf, DM9.5(3).pdf` |

## 资料状态说明 { #courseware-status }

| 章节 | 当前处理 |
| --- | --- |
| 第 4 章 资料未提供章节 | 当前仓库没有对应课件，因此不生成空章节页；后续拿到资料后再补独立页面。 |
| 第 7 章 资料未提供章节 | 当前仓库没有对应课件，因此不生成空章节页；后续拿到资料后再补独立页面。 |

## 旧锚点跳转表

下面的条目用于兼容旧版长页面的 `#note-sec-...` 锚点。锚点本身保留在本页；点击条目会进入新的章节子页面或资料状态说明。

- <span id="note-sec-001"></span>[使用说明](#reading-guide)
- <span id="note-sec-002"></span>[现有课件索引](#reading-guide)
- <span id="note-sec-003"></span>[全书知识结构](#reading-guide)
- <span id="note-sec-004"></span>[第 1 章 逻辑与证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-004)
- <span id="note-sec-005"></span>[1.0 核心目标](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-005)
- <span id="note-sec-006"></span>[1.1 命题逻辑](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-006)
  - <span id="note-sec-007"></span>[命题](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-007)
  - <span id="note-sec-008"></span>[复合命题和联结词](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-008)
  - <span id="note-sec-009"></span>[条件命题的相关形式](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-009)
  - <span id="note-sec-010"></span>[真值表](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-010)
  - <span id="note-sec-011"></span>[运算优先级](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-011)
  - <span id="note-sec-012"></span>[位运算](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-012)
- <span id="note-sec-013"></span>[1.2 命题逻辑的应用](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-013)
  - <span id="note-sec-014"></span>[自然语言翻译](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-014)
  - <span id="note-sec-015"></span>[系统规格说明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-015)
  - <span id="note-sec-016"></span>[逻辑谜题](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-016)
- <span id="note-sec-017"></span>[1.3 命题等价式与范式](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-017)
  - <span id="note-sec-018"></span>[重言式、矛盾式、可满足式](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-018)
  - <span id="note-sec-019"></span>[常用逻辑等价式](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-019)
  - <span id="note-sec-020"></span>[用等价式化简](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-020)
  - <span id="note-sec-021"></span>[其他逻辑算子和函数完备性](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-021)
  - <span id="note-sec-022"></span>[对偶](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-022)
  - <span id="note-sec-023"></span>[析取范式和合取范式](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-023)
  - <span id="note-sec-024"></span>[主析取范式和主合取范式](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-024)
  - <span id="note-sec-025"></span>[SAT 和 n 皇后建模](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-025)
- <span id="note-sec-026"></span>[1.4 谓词与量词](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-026)
  - <span id="note-sec-027"></span>[为什么需要谓词逻辑](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-027)
  - <span id="note-sec-028"></span>[谓词和命题函数](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-028)
  - <span id="note-sec-029"></span>[量词](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-029)
  - <span id="note-sec-030"></span>[论域的重要性](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-030)
  - <span id="note-sec-031"></span>[限制量词](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-031)
  - <span id="note-sec-032"></span>[自然语言翻译](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-032)
  - <span id="note-sec-033"></span>[量词否定](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-033)
  - <span id="note-sec-034"></span>[程序正确性中的前置条件和后置条件](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-034)
- <span id="note-sec-035"></span>[1.5 嵌套量词与前束范式](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-035)
  - <span id="note-sec-036"></span>[嵌套量词](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-036)
  - <span id="note-sec-037"></span>[同类量词可交换](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-037)
  - <span id="note-sec-038"></span>[例：实数乘积](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-038)
  - <span id="note-sec-039"></span>[唯一性表达](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-039)
  - <span id="note-sec-040"></span>[极限定义的逻辑结构](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-040)
  - <span id="note-sec-041"></span>[前束范式](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-041)
- <span id="note-sec-042"></span>[1.6 推理规则](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-042)
  - <span id="note-sec-043"></span>[论证和有效性](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-043)
  - <span id="note-sec-044"></span>[命题逻辑推理规则](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-044)
  - <span id="note-sec-045"></span>[常见谬误](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-045)
  - <span id="note-sec-046"></span>[量词推理规则](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-046)
  - <span id="note-sec-047"></span>[苏格拉底论证](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-047)
- <span id="note-sec-048"></span>[1.7 证明导论](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-048)
  - <span id="note-sec-049"></span>[定理、命题、引理和推论](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-049)
  - <span id="note-sec-050"></span>[直接证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-050)
  - <span id="note-sec-051"></span>[逆否证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-051)
  - <span id="note-sec-052"></span>[空证明和显然证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-052)
  - <span id="note-sec-053"></span>[反证法](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-053)
  - <span id="note-sec-054"></span>[充要条件证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-054)
- <span id="note-sec-055"></span>[1.8 证明方法与策略](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-055)
  - <span id="note-sec-056"></span>[分情况证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-056)
  - <span id="note-sec-057"></span>[存在性证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-057)
  - <span id="note-sec-058"></span>[唯一性证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-058)
  - <span id="note-sec-059"></span>[反例证明](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-059)
  - <span id="note-sec-060"></span>[前向推理和后向推理](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-060)
  - <span id="note-sec-061"></span>[本章小结与补充位](discrete-math-lecture/chapter-01-logic-proofs.md#note-sec-061)
- <span id="note-sec-062"></span>[第 2 章 基本结构：集合、函数、序列、基数和矩阵](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-062)
- <span id="note-sec-063"></span>[2.0 核心目标](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-063)
- <span id="note-sec-064"></span>[2.1 集合](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-064)
  - <span id="note-sec-065"></span>[集合和元素](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-065)
  - <span id="note-sec-066"></span>[常见数集](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-066)
  - <span id="note-sec-067"></span>[子集和真子集](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-067)
  - <span id="note-sec-068"></span>[有限集和基数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-068)
  - <span id="note-sec-069"></span>[幂集](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-069)
  - <span id="note-sec-070"></span>[有序 n 元组和笛卡尔积](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-070)
- <span id="note-sec-071"></span>[2.2 集合运算](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-071)
  - <span id="note-sec-072"></span>[基本运算](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-072)
  - <span id="note-sec-073"></span>[集合恒等式](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-073)
  - <span id="note-sec-074"></span>[证明集合恒等式的方法](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-074)
  - <span id="note-sec-075"></span>[容斥思想的初步形式](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-075)
  - <span id="note-sec-076"></span>[广义并与广义交](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-076)
  - <span id="note-sec-077"></span>[用位串表示集合](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-077)
- <span id="note-sec-078"></span>[2.3 函数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-078)
  - <span id="note-sec-079"></span>[函数定义](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-079)
  - <span id="note-sec-080"></span>[单射、满射、双射](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-080)
  - <span id="note-sec-081"></span>[判断技巧](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-081)
  - <span id="note-sec-082"></span>[反函数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-082)
  - <span id="note-sec-083"></span>[函数组合](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-083)
  - <span id="note-sec-084"></span>[函数图像](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-084)
  - <span id="note-sec-085"></span>[取整函数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-085)
- <span id="note-sec-086"></span>[2.4 序列与递推](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-086)
  - <span id="note-sec-087"></span>[序列](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-087)
  - <span id="note-sec-088"></span>[字符串](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-088)
  - <span id="note-sec-089"></span>[递推关系](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-089)
  - <span id="note-sec-090"></span>[解递推关系](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-090)
- <span id="note-sec-091"></span>[2.5 集合的基数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-091)
  - <span id="note-sec-092"></span>[有限集合的基数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-092)
  - <span id="note-sec-093"></span>[相同基数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-093)
  - <span id="note-sec-094"></span>[可数集](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-094)
  - <span id="note-sec-095"></span>[整数集可数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-095)
  - <span id="note-sec-096"></span>[正有理数可数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-096)
  - <span id="note-sec-097"></span>[有限字母表上的有限字符串可数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-097)
  - <span id="note-sec-098"></span>[不可数集](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-098)
  - <span id="note-sec-099"></span>[不可计算函数的存在](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-099)
  - <span id="note-sec-100"></span>[幂集基数](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-100)
- <span id="note-sec-101"></span>[2.6 矩阵](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-101)
  - <span id="note-sec-102"></span>[矩阵定义](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-102)
  - <span id="note-sec-103"></span>[常见运算](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-103)
  - <span id="note-sec-104"></span>[与离散数学的关系](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-104)
- <span id="note-sec-105"></span>[本章小结与补充位](discrete-math-lecture/chapter-02-basic-structures.md#note-sec-105)
- <span id="note-sec-106"></span>[第 3 章 算法](discrete-math-lecture/chapter-03-algorithms.md#note-sec-106)
- <span id="note-sec-107"></span>[3.0 核心目标](discrete-math-lecture/chapter-03-algorithms.md#note-sec-107)
- <span id="note-sec-108"></span>[3.1 算法](discrete-math-lecture/chapter-03-algorithms.md#note-sec-108)
  - <span id="note-sec-109"></span>[算法定义](discrete-math-lecture/chapter-03-algorithms.md#note-sec-109)
  - <span id="note-sec-110"></span>[伪代码](discrete-math-lecture/chapter-03-algorithms.md#note-sec-110)
  - <span id="note-sec-111"></span>[搜索问题](discrete-math-lecture/chapter-03-algorithms.md#note-sec-111)
  - <span id="note-sec-112"></span>[排序问题](discrete-math-lecture/chapter-03-algorithms.md#note-sec-112)
  - <span id="note-sec-113"></span>[贪心算法](discrete-math-lecture/chapter-03-algorithms.md#note-sec-113)
- <span id="note-sec-114"></span>[3.2 函数增长](discrete-math-lecture/chapter-03-algorithms.md#note-sec-114)
  - <span id="note-sec-115"></span>[为什么关心增长率](discrete-math-lecture/chapter-03-algorithms.md#note-sec-115)
  - <span id="note-sec-116"></span>[Big-O](discrete-math-lecture/chapter-03-algorithms.md#note-sec-116)
  - <span id="note-sec-117"></span>[多项式增长](discrete-math-lecture/chapter-03-algorithms.md#note-sec-117)
  - <span id="note-sec-118"></span>[常见增长顺序](discrete-math-lecture/chapter-03-algorithms.md#note-sec-118)
  - <span id="note-sec-119"></span>[Big-Omega 和 Big-Theta](discrete-math-lecture/chapter-03-algorithms.md#note-sec-119)
  - <span id="note-sec-120"></span>[组合函数的增长](discrete-math-lecture/chapter-03-algorithms.md#note-sec-120)
- <span id="note-sec-121"></span>[3.3 算法复杂度](discrete-math-lecture/chapter-03-algorithms.md#note-sec-121)
  - <span id="note-sec-122"></span>[时间复杂度](discrete-math-lecture/chapter-03-algorithms.md#note-sec-122)
  - <span id="note-sec-123"></span>[最大值算法复杂度](discrete-math-lecture/chapter-03-algorithms.md#note-sec-123)
  - <span id="note-sec-124"></span>[线性搜索复杂度](discrete-math-lecture/chapter-03-algorithms.md#note-sec-124)
  - <span id="note-sec-125"></span>[二分搜索复杂度](discrete-math-lecture/chapter-03-algorithms.md#note-sec-125)
  - <span id="note-sec-126"></span>[可处理、不可处理、不可解](discrete-math-lecture/chapter-03-algorithms.md#note-sec-126)
- <span id="note-sec-127"></span>[本章小结与补充位](discrete-math-lecture/chapter-03-algorithms.md#note-sec-127)
- <span id="note-sec-128"></span>[第 4 章 资料未提供章节](#courseware-status)
- <span id="note-sec-129"></span>[4.1 整除与模运算](#courseware-status)
- <span id="note-sec-130"></span>[4.2 整数表示和算法](#courseware-status)
- <span id="note-sec-131"></span>[4.3 素数与最大公约数](#courseware-status)
- <span id="note-sec-132"></span>[4.4 同余](#courseware-status)
- <span id="note-sec-133"></span>[4.5 密码学应用](#courseware-status)
- <span id="note-sec-134"></span>[第 5 章 归纳与递归](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-134)
- <span id="note-sec-135"></span>[5.0 核心目标](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-135)
- <span id="note-sec-136"></span>[5.1 数学归纳法](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-136)
  - <span id="note-sec-137"></span>[第一数学归纳原理](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-137)
  - <span id="note-sec-138"></span>[归纳证明模板](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-138)
  - <span id="note-sec-139"></span>[为什么归纳法有效](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-139)
  - <span id="note-sec-140"></span>[例：有限集子集个数](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-140)
- <span id="note-sec-141"></span>[5.2 强归纳与良序性](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-141)
  - <span id="note-sec-142"></span>[强归纳原理](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-142)
  - <span id="note-sec-143"></span>[例：整数的素因子分解存在性](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-143)
  - <span id="note-sec-144"></span>[良序性](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-144)
  - <span id="note-sec-145"></span>[例：除法算法](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-145)
- <span id="note-sec-146"></span>[5.3 递归定义与结构归纳](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-146)
  - <span id="note-sec-147"></span>[递归定义函数](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-147)
  - <span id="note-sec-148"></span>[欧几里得算法的递归思想](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-148)
  - <span id="note-sec-149"></span>[递归定义集合](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-149)
  - <span id="note-sec-150"></span>[字符串集合](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-150)
  - <span id="note-sec-151"></span>[合式公式](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-151)
  - <span id="note-sec-152"></span>[结构归纳](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-152)
  - <span id="note-sec-153"></span>[树的递归定义](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-153)
- <span id="note-sec-154"></span>[5.4 递归算法](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-154)
  - <span id="note-sec-155"></span>[递归算法定义](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-155)
  - <span id="note-sec-156"></span>[递归算法正确性](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-156)
  - <span id="note-sec-157"></span>[递归与迭代](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-157)
  - <span id="note-sec-158"></span>[递归斐波那契算法](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-158)
- <span id="note-sec-159"></span>[本章小结与补充位](discrete-math-lecture/chapter-05-induction-recursion.md#note-sec-159)
- <span id="note-sec-160"></span>[第 6 章 计数](discrete-math-lecture/chapter-06-counting.md#note-sec-160)
- <span id="note-sec-161"></span>[6.0 核心目标](discrete-math-lecture/chapter-06-counting.md#note-sec-161)
- <span id="note-sec-162"></span>[6.1 计数基础](discrete-math-lecture/chapter-06-counting.md#note-sec-162)
  - <span id="note-sec-163"></span>[乘法法则](discrete-math-lecture/chapter-06-counting.md#note-sec-163)
  - <span id="note-sec-164"></span>[单射函数计数](discrete-math-lecture/chapter-06-counting.md#note-sec-164)
  - <span id="note-sec-165"></span>[幂集大小](discrete-math-lecture/chapter-06-counting.md#note-sec-165)
  - <span id="note-sec-166"></span>[加法法则](discrete-math-lecture/chapter-06-counting.md#note-sec-166)
  - <span id="note-sec-167"></span>[减法法则](discrete-math-lecture/chapter-06-counting.md#note-sec-167)
  - <span id="note-sec-168"></span>[包含重叠时的加法](discrete-math-lecture/chapter-06-counting.md#note-sec-168)
  - <span id="note-sec-169"></span>[除法法则](discrete-math-lecture/chapter-06-counting.md#note-sec-169)
  - <span id="note-sec-170"></span>[树图](discrete-math-lecture/chapter-06-counting.md#note-sec-170)
- <span id="note-sec-171"></span>[6.2 鸽巢原理](discrete-math-lecture/chapter-06-counting.md#note-sec-171)
  - <span id="note-sec-172"></span>[基本鸽巢原理](discrete-math-lecture/chapter-06-counting.md#note-sec-172)
  - <span id="note-sec-173"></span>[例：同余](discrete-math-lecture/chapter-06-counting.md#note-sec-173)
  - <span id="note-sec-174"></span>[广义鸽巢原理](discrete-math-lecture/chapter-06-counting.md#note-sec-174)
  - <span id="note-sec-175"></span>[例：抽球](discrete-math-lecture/chapter-06-counting.md#note-sec-175)
  - <span id="note-sec-176"></span>[整除链例题](discrete-math-lecture/chapter-06-counting.md#note-sec-176)
  - <span id="note-sec-177"></span>[单调子序列定理](discrete-math-lecture/chapter-06-counting.md#note-sec-177)
  - <span id="note-sec-178"></span>[六人朋友敌人问题](discrete-math-lecture/chapter-06-counting.md#note-sec-178)
- <span id="note-sec-179"></span>[6.3 排列与组合](discrete-math-lecture/chapter-06-counting.md#note-sec-179)
  - <span id="note-sec-180"></span>[排列](discrete-math-lecture/chapter-06-counting.md#note-sec-180)
  - <span id="note-sec-181"></span>[含指定字符串的排列](discrete-math-lecture/chapter-06-counting.md#note-sec-181)
  - <span id="note-sec-182"></span>[组合](discrete-math-lecture/chapter-06-counting.md#note-sec-182)
  - <span id="note-sec-183"></span>[对称性](discrete-math-lecture/chapter-06-counting.md#note-sec-183)
  - <span id="note-sec-184"></span>[组合证明](discrete-math-lecture/chapter-06-counting.md#note-sec-184)
- <span id="note-sec-185"></span>[6.4 二项式系数](discrete-math-lecture/chapter-06-counting.md#note-sec-185)
  - <span id="note-sec-186"></span>[二项式定理](discrete-math-lecture/chapter-06-counting.md#note-sec-186)
  - <span id="note-sec-187"></span>[帕斯卡恒等式](discrete-math-lecture/chapter-06-counting.md#note-sec-187)
  - <span id="note-sec-188"></span>[Vandermonde 恒等式](discrete-math-lecture/chapter-06-counting.md#note-sec-188)
  - <span id="note-sec-189"></span>[常见二项式恒等式](discrete-math-lecture/chapter-06-counting.md#note-sec-189)
- <span id="note-sec-190"></span>[6.5 广义排列与组合](discrete-math-lecture/chapter-06-counting.md#note-sec-190)
  - <span id="note-sec-191"></span>[允许重复的排列](discrete-math-lecture/chapter-06-counting.md#note-sec-191)
  - <span id="note-sec-192"></span>[允许重复的组合](discrete-math-lecture/chapter-06-counting.md#note-sec-192)
  - <span id="note-sec-193"></span>[带下界的整数解](discrete-math-lecture/chapter-06-counting.md#note-sec-193)
  - <span id="note-sec-194"></span>[不可区分对象的排列](discrete-math-lecture/chapter-06-counting.md#note-sec-194)
  - <span id="note-sec-195"></span>[盒子模型](discrete-math-lecture/chapter-06-counting.md#note-sec-195)
  - <span id="note-sec-196"></span>[Stirling 数](discrete-math-lecture/chapter-06-counting.md#note-sec-196)
- <span id="note-sec-197"></span>[本章小结与补充位](discrete-math-lecture/chapter-06-counting.md#note-sec-197)
- <span id="note-sec-198"></span>[第 7 章 资料未提供章节](#courseware-status)
- <span id="note-sec-199"></span>[7.1 有限概率](#courseware-status)
- <span id="note-sec-200"></span>[7.2 概率论基础](#courseware-status)
- <span id="note-sec-201"></span>[7.3 Bayes 定理](#courseware-status)
- <span id="note-sec-202"></span>[7.4 期望与方差](#courseware-status)
- <span id="note-sec-203"></span>[第 8 章 高级计数技术](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-203)
- <span id="note-sec-204"></span>[8.0 核心目标](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-204)
- <span id="note-sec-205"></span>[8.1 递推关系的应用](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-205)
  - <span id="note-sec-206"></span>[递推关系回顾](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-206)
  - <span id="note-sec-207"></span>[兔子问题和 Fibonacci 数](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-207)
  - <span id="note-sec-208"></span>[汉诺塔](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-208)
  - <span id="note-sec-209"></span>[不含连续 0 的位串](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-209)
  - <span id="note-sec-210"></span>[算法与递推](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-210)
- <span id="note-sec-211"></span>[8.2 线性递推关系](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-211)
  - <span id="note-sec-212"></span>[线性齐次常系数递推](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-212)
  - <span id="note-sec-213"></span>[二阶不同根](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-213)
  - <span id="note-sec-214"></span>[Fibonacci 闭式](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-214)
  - <span id="note-sec-215"></span>[重根情形](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-215)
  - <span id="note-sec-216"></span>[非齐次线性递推](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-216)
- <span id="note-sec-217"></span>[8.3 分治算法与递推](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-217)
  - <span id="note-sec-218"></span>[分治思想](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-218)
  - <span id="note-sec-219"></span>[二分搜索](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-219)
  - <span id="note-sec-220"></span>[快速整数乘法](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-220)
  - <span id="note-sec-221"></span>[Master Theorem](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-221)
- <span id="note-sec-222"></span>[8.4 生成函数](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-222)
  - <span id="note-sec-223"></span>[定义](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-223)
  - <span id="note-sec-224"></span>[常见生成函数](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-224)
  - <span id="note-sec-225"></span>[扩展二项式定理](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-225)
  - <span id="note-sec-226"></span>[用生成函数计数](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-226)
  - <span id="note-sec-227"></span>[有限制的选择](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-227)
  - <span id="note-sec-228"></span>[用生成函数解递推](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-228)
- <span id="note-sec-229"></span>[8.5 容斥原理](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-229)
  - <span id="note-sec-230"></span>[两个和三个集合](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-230)
  - <span id="note-sec-231"></span>[一般容斥公式](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-231)
  - <span id="note-sec-232"></span>[反向计数](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-232)
  - <span id="note-sec-233"></span>[例：不超过 1000 且不被 5、6、8 整除](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-233)
- <span id="note-sec-234"></span>[8.6 容斥的应用](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-234)
  - <span id="note-sec-235"></span>[满射函数计数](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-235)
  - <span id="note-sec-236"></span>[错排](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-236)
  - <span id="note-sec-237"></span>[帽子问题](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-237)
- <span id="note-sec-238"></span>[本章小结与补充位](discrete-math-lecture/chapter-08-advanced-counting.md#note-sec-238)
- <span id="note-sec-239"></span>[第 9 章 关系](discrete-math-lecture/chapter-09-relations.md#note-sec-239)
- <span id="note-sec-240"></span>[9.0 核心目标](discrete-math-lecture/chapter-09-relations.md#note-sec-240)
- <span id="note-sec-241"></span>[9.1 关系及其性质](discrete-math-lecture/chapter-09-relations.md#note-sec-241)
  - <span id="note-sec-242"></span>[二元关系](discrete-math-lecture/chapter-09-relations.md#note-sec-242)
  - <span id="note-sec-243"></span>[n 元关系](discrete-math-lecture/chapter-09-relations.md#note-sec-243)
  - <span id="note-sec-244"></span>[函数作为关系](discrete-math-lecture/chapter-09-relations.md#note-sec-244)
  - <span id="note-sec-245"></span>[关系的表示](discrete-math-lecture/chapter-09-relations.md#note-sec-245)
  - <span id="note-sec-246"></span>[连接矩阵](discrete-math-lecture/chapter-09-relations.md#note-sec-246)
  - <span id="note-sec-247"></span>[有向图表示](discrete-math-lecture/chapter-09-relations.md#note-sec-247)
  - <span id="note-sec-248"></span>[关系性质](discrete-math-lecture/chapter-09-relations.md#note-sec-248)
  - <span id="note-sec-249"></span>[例：整除关系](discrete-math-lecture/chapter-09-relations.md#note-sec-249)
  - <span id="note-sec-250"></span>[计数具有某性质的关系](discrete-math-lecture/chapter-09-relations.md#note-sec-250)
- <span id="note-sec-251"></span>[9.2 关系运算与复合](discrete-math-lecture/chapter-09-relations.md#note-sec-251)
  - <span id="note-sec-252"></span>[集合运算](discrete-math-lecture/chapter-09-relations.md#note-sec-252)
  - <span id="note-sec-253"></span>[逆关系](discrete-math-lecture/chapter-09-relations.md#note-sec-253)
  - <span id="note-sec-254"></span>[关系复合](discrete-math-lecture/chapter-09-relations.md#note-sec-254)
  - <span id="note-sec-255"></span>[关系的幂](discrete-math-lecture/chapter-09-relations.md#note-sec-255)
  - <span id="note-sec-256"></span>[传递性与关系幂](discrete-math-lecture/chapter-09-relations.md#note-sec-256)
- <span id="note-sec-257"></span>[9.3 关系的表示](discrete-math-lecture/chapter-09-relations.md#note-sec-257)
  - <span id="note-sec-258"></span>[矩阵运算](discrete-math-lecture/chapter-09-relations.md#note-sec-258)
  - <span id="note-sec-259"></span>[有向图和路径](discrete-math-lecture/chapter-09-relations.md#note-sec-259)
- <span id="note-sec-260"></span>[9.4 关系闭包](discrete-math-lecture/chapter-09-relations.md#note-sec-260)
  - <span id="note-sec-261"></span>[闭包定义](discrete-math-lecture/chapter-09-relations.md#note-sec-261)
  - <span id="note-sec-262"></span>[自反闭包](discrete-math-lecture/chapter-09-relations.md#note-sec-262)
  - <span id="note-sec-263"></span>[对称闭包](discrete-math-lecture/chapter-09-relations.md#note-sec-263)
  - <span id="note-sec-264"></span>[传递闭包](discrete-math-lecture/chapter-09-relations.md#note-sec-264)
  - <span id="note-sec-265"></span>[有限集合上的路径长度](discrete-math-lecture/chapter-09-relations.md#note-sec-265)
  - <span id="note-sec-266"></span>[Warshall 算法](discrete-math-lecture/chapter-09-relations.md#note-sec-266)
  - <span id="note-sec-267"></span>[多性质闭包](discrete-math-lecture/chapter-09-relations.md#note-sec-267)
- <span id="note-sec-268"></span>[9.5 等价关系](discrete-math-lecture/chapter-09-relations.md#note-sec-268)
  - <span id="note-sec-269"></span>[定义](discrete-math-lecture/chapter-09-relations.md#note-sec-269)
  - <span id="note-sec-270"></span>[等价类](discrete-math-lecture/chapter-09-relations.md#note-sec-270)
  - <span id="note-sec-271"></span>[模同余](discrete-math-lecture/chapter-09-relations.md#note-sec-271)
  - <span id="note-sec-272"></span>[由函数诱导的等价关系](discrete-math-lecture/chapter-09-relations.md#note-sec-272)
  - <span id="note-sec-273"></span>[字符串前缀等价](discrete-math-lecture/chapter-09-relations.md#note-sec-273)
  - <span id="note-sec-274"></span>[划分](discrete-math-lecture/chapter-09-relations.md#note-sec-274)
  - <span id="note-sec-275"></span>[等价关系与划分](discrete-math-lecture/chapter-09-relations.md#note-sec-275)
  - <span id="note-sec-276"></span>[等价类的基本性质](discrete-math-lecture/chapter-09-relations.md#note-sec-276)
  - <span id="note-sec-277"></span>[等价关系的组合](discrete-math-lecture/chapter-09-relations.md#note-sec-277)
- <span id="note-sec-278"></span>[本章小结与补充位](discrete-math-lecture/chapter-09-relations.md#note-sec-278)
- <span id="note-sec-279"></span>[附录 A：常用符号表](discrete-math-lecture/appendix-reference.md#note-sec-279)
- <span id="note-sec-280"></span>[附录 B：常用证明模板](discrete-math-lecture/appendix-reference.md#note-sec-280)
- <span id="note-sec-281"></span>[直接证明模板](discrete-math-lecture/appendix-reference.md#note-sec-281)
- <span id="note-sec-282"></span>[逆否证明模板](discrete-math-lecture/appendix-reference.md#note-sec-282)
- <span id="note-sec-283"></span>[反证法模板](discrete-math-lecture/appendix-reference.md#note-sec-283)
- <span id="note-sec-284"></span>[分情况证明模板](discrete-math-lecture/appendix-reference.md#note-sec-284)
- <span id="note-sec-285"></span>[数学归纳法模板](discrete-math-lecture/appendix-reference.md#note-sec-285)
- <span id="note-sec-286"></span>[强归纳模板](discrete-math-lecture/appendix-reference.md#note-sec-286)
- <span id="note-sec-287"></span>[结构归纳模板](discrete-math-lecture/appendix-reference.md#note-sec-287)
- <span id="note-sec-288"></span>[附录 C：后续更新记录](discrete-math-lecture/appendix-reference.md#note-sec-288)
- <span id="note-sec-289"></span>[附录 D：待补充清单](discrete-math-lecture/appendix-reference.md#note-sec-289)
