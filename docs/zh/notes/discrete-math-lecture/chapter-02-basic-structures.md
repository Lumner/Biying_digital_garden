---
title: 第 2 章 基本结构：集合、函数、序列、基数和矩阵
summary: 集合、函数、序列、基数和矩阵的基础语言。
public: true
avatar_readable: true
author: Lumner
course: 离散数学
category: math
recommended: false
updated: 2026-07-18
reading_order: 102
tags:
  - math
  - discrete-math
  - course-note
  - chapter
---

# 第 2 章 基本结构：集合、函数、序列、基数和矩阵 { #note-sec-062 }

!!! info "章节导引"
    本页从《离散数学讲义》拆分而来，保留原章节锚点，方便从旧总览页和旧链接跳转。

## 学习目标

掌握集合与函数的基本定义，把序列、递推、基数和矩阵视为后续算法与关系内容的共同工具。

## 前置知识

第 1 章的逻辑表达、基本代数运算和对函数符号的熟悉度。

## 建议用时

建议 5–7 小时：集合 2 小时，函数 2 小时，序列/基数/矩阵 1–3 小时。

## 练习建议

证明 2 个集合恒等式；判断 5 个函数是否为单射/满射/双射；写出 2 个递推关系的前几项。

## 参考资料与引用边界

- 整理者：Lumner。
- 课程来源：根据 `DM/` 目录下的课件整理；本章对应课件：`DM2.1.pdf, DM2.2.pdf, DM2.3.pdf, DM2.4.pdf, DM2.5-2.6(5).pdf`。
- 原始讲义文件：`note/离散数学讲义.md`。
- 引用边界：这是公开学习笔记，不替代课程正式教材、教师课件或考试要求；外部引用时请注明来自本网站整理版。

## 2.0 核心目标 { #note-sec-063 }

本章提供离散结构的基本对象：集合描述对象范围，函数描述映射关系，序列描述有序对象，矩阵可表示关系和计算结构，基数用于比较集合大小。

## 2.1 集合 { #note-sec-064 }

### 集合和元素 { #note-sec-065 }

集合是对象的无序汇集。对象称为元素或成员。

常用记号：

- $x\in A$：$x$ 是集合 $A$ 的元素。
- $x\notin A$：$x$ 不是集合 $A$ 的元素。
- $\varnothing$ 或 `{}`：空集。
- $U$：全集，即当前讨论范围内所有对象的集合。

集合可用列举法：

$A=\{1,2,3,4\}$

也可用描述法：

$A=\{x\mid x\text{ 是小于 }10\text{ 的正奇数}\}$

### 常见数集 { #note-sec-066 }

| 记号 | 含义 |
| --- | --- |
| $\mathbb N$ | 自然数集，课件中采用 $\{0,1,2,\ldots\}$ |
| $\mathbb Z$ | 整数集 |
| $\mathbb Z^+$ | 正整数集 |
| $\mathbb Q$ | 有理数集 |
| $\mathbb R$ | 实数集 |

注意：不同教材对 $\mathbb N$ 是否包含 0 可能不同，使用时应说明。

### 子集和真子集 { #note-sec-067 }

$A\subseteq B$ 表示 $A$ 是 $B$ 的子集：

$A\subseteq B\iff \forall x(x\in A\to x\in B)$

集合相等：

$A=B\iff A\subseteq B\land B\subseteq A$

真子集：

$A\subset B\iff A\subseteq B\land A\ne B$

等价地：

$A\subset B\iff \forall x(x\in A\to x\in B)\land \exists x(x\in B\land x\notin A)$

### 有限集和基数 { #note-sec-068 }

若集合 $S$ 恰有 $n$ 个不同元素，称 $S$ 为有限集，记：

$|S|=n$

例：$A=\{1,3,5,7,9\}$，则 $|A|=5$。

### 幂集 { #note-sec-069 }

集合 $S$ 的幂集是 $S$ 所有子集构成的集合，记为 $\mathcal P(S)$。

若 $|S|=n$，则：

$|\mathcal P(S)|=2^n$

例：若 $S=\{a,b\}$，则：

$\mathcal P(S)=\{\varnothing,\{a\},\{b\},\{a,b\}\}$

### 有序 n 元组和笛卡尔积 { #note-sec-070 }

有序 n 元组：

$(a_1,a_2,\ldots,a_n)$

顺序重要。

笛卡尔积：

$A\times B=\{(a,b)\mid a\in A,\ b\in B\}$

若 $|A|=m$、$|B|=n$，则：

$|A\times B|=mn$

## 2.2 集合运算 { #note-sec-071 }

### 基本运算 { #note-sec-072 }

| 运算 | 记号 | 定义 |
| --- | --- | --- |
| 并集 | $A\cup B$ | $\{x\mid x\in A\lor x\in B\}$ |
| 交集 | $A\cap B$ | $\{x\mid x\in A\land x\in B\}$ |
| 差集 | $A-B$ | $\{x\mid x\in A\land x\notin B\}$ |
| 补集 | $\overline A$ 或 $A^c$ | $\{x\in U\mid x\notin A\}$ |
| 对称差 | $A\oplus B$ | $(A-B)\cup(B-A)$ |

### 集合恒等式 { #note-sec-073 }

集合恒等式与逻辑等价式高度对应。

| 名称 | 恒等式 |
| --- | --- |
| 恒等律 | $A\cup\varnothing=A$, $A\cap U=A$ |
| 支配律 | $A\cup U=U$, $A\cap\varnothing=\varnothing$ |
| 幂等律 | $A\cup A=A$, $A\cap A=A$ |
| 补元律 | $A\cup A^c=U$, $A\cap A^c=\varnothing$ |
| 交换律 | $A\cup B=B\cup A$, $A\cap B=B\cap A$ |
| 结合律 | $(A\cup B)\cup C=A\cup(B\cup C)$ |
| 分配律 | $A\cup(B\cap C)=(A\cup B)\cap(A\cup C)$ |
| 德摩根律 | $(A\cup B)^c=A^c\cap B^c$ |
| 德摩根律 | $(A\cap B)^c=A^c\cup B^c$ |
| 吸收律 | $A\cup(A\cap B)=A$, $A\cap(A\cup B)=A$ |

### 证明集合恒等式的方法 { #note-sec-074 }

子集法：

1. 证明左边是右边的子集。
2. 证明右边是左边的子集。

成员法：

对任意 $x$，把 $x\in$ 左边逐步等价变形为 $x\in$ 右边。

成员表：

类似真值表，用 0/1 表示元素是否属于各集合。

### 容斥思想的初步形式 { #note-sec-075 }

两个有限集合：

$|A\cup B|=|A|+|B|-|A\cap B|$

三个有限集合：

$|A\cup B\cup C|=|A|+|B|+|C|-|A\cap B|-|A\cap C|-|B\cap C|+|A\cap B\cap C|$

容斥原理会在第 8 章进一步系统展开。

### 广义并与广义交 { #note-sec-076 }

对集合族 $A_1,A_2,\ldots,A_n$：

$\bigcup_{i=1}^nA_i=\{x\mid \exists i,\ x\in A_i\}$

$\bigcap_{i=1}^nA_i=\{x\mid \forall i,\ x\in A_i\}$

无限集合族也可类似定义。

### 用位串表示集合 { #note-sec-077 }

若全集有限，例如 $U=\{u_1,u_2,\ldots,u_n\}$，集合 $A$ 可用长度 $n$ 的位串表示：

第 $i$ 位为 1 当且仅当 $u_i\in A$。

这样：

- 并集对应按位 OR。
- 交集对应按位 AND。
- 补集对应按位 NOT。

## 2.3 函数 { #note-sec-078 }

### 函数定义 { #note-sec-079 }

设 $A,B$ 为非空集合。函数 $f:A\to B$ 是把 $A$ 中每个元素都指定到 $B$ 中唯一一个元素的规则。

其中：

- $A$ 是定义域。
- $B$ 是陪域。
- $f(a)$ 是 $a$ 的像。
- 值域或像集为 $f(A)=\{f(a)\mid a\in A\}$。
- $b$ 的原像集合为 $f^{-1}(b)=\{a\in A\mid f(a)=b\}$。

函数也可看作关系，但必须满足：每个定义域元素恰好对应一个陪域元素。

### 单射、满射、双射 { #note-sec-080 }

单射 injective：

$f(a_1)=f(a_2)\to a_1=a_2$

不同输入不会有相同输出。

满射 surjective：

$\forall b\in B\,\exists a\in A(f(a)=b)$

陪域中每个元素都被命中。

双射 bijective：

既单射又满射。

双射用于说明两个集合“大小相同”，在无限集合的基数比较中尤其重要。

### 判断技巧 { #note-sec-081 }

证明单射：从 $f(x_1)=f(x_2)$ 出发，推出 $x_1=x_2$。

证明非单射：找 $x_1\ne x_2$，但 $f(x_1)=f(x_2)$。

证明满射：任取 $y\in B$，构造 $x\in A$ 使 $f(x)=y$。

证明非满射：找一个 $y\in B$ 不可能作为函数值。

### 反函数 { #note-sec-082 }

若 $f:A\to B$ 是双射，则存在反函数 $f^{-1}:B\to A$，满足：

$f^{-1}(b)=a\iff f(a)=b$

只有双射一定有双侧意义上的反函数。

### 函数组合 { #note-sec-083 }

若 $f:A\to B$，$g:B\to C$，则组合函数：

$(g\circ f)(a)=g(f(a))$

组合顺序很重要，通常 $g\circ f\ne f\circ g$。

### 函数图像 { #note-sec-084 }

函数 $f:A\to B$ 的图像是：

$\{(a,b)\mid a\in A,\ b=f(a)\}$

这是 $A\times B$ 的一个子集。

### 取整函数 { #note-sec-085 }

下取整：

$\lfloor x\rfloor$ 是不超过 $x$ 的最大整数。

上取整：

$\lceil x\rceil$ 是不小于 $x$ 的最小整数。

基本性质：

$\lfloor x\rfloor=n\iff n\le x<n+1$

$\lceil x\rceil=n\iff n-1<x\le n$

若 $m$ 为整数：

$\lfloor x+m\rfloor=\lfloor x\rfloor+m$

$\lceil x+m\rceil=\lceil x\rceil+m$

常见恒等式：

$\lfloor 2x\rfloor=\lfloor x\rfloor+\lfloor x+\frac12\rfloor$

证明可令 $x=n+\varepsilon$，其中 $n$ 为整数且 $0\le\varepsilon<1$，再分 $0\le\varepsilon<1/2$ 和 $1/2\le\varepsilon<1$ 两种情况。

## 2.4 序列与递推 { #note-sec-086 }

### 序列 { #note-sec-087 }

序列是从整数子集到某个集合 $S$ 的函数。常记为：

$a_0,a_1,a_2,\ldots$

或：

$\{a_n\}$

几何数列：

$a,ar,ar^2,\ldots,ar^n,\ldots$

其中 $a$ 是首项，$r$ 是公比。

### 字符串 { #note-sec-088 }

字符串是来自有限字母表的有限序列。空字符串常记为 $\lambda$。字符串思想会在递归定义中继续出现。

### 递推关系 { #note-sec-089 }

递推关系用前面的项定义后面的项。

例：

$a_n=a_{n-1}+3,\quad a_0=2$

则：

$a_1=5,\ a_2=8,\ a_3=11$

斐波那契数列：

$f_0=0,\quad f_1=1,\quad f_n=f_{n-1}+f_{n-2}\ (n\ge2)$

### 解递推关系 { #note-sec-090 }

找到 $a_n$ 的闭式公式，称为解递推关系。

对 $a_n=a_{n-1}+3,\ a_1=2$：

向前展开：

$a_2=5,\ a_3=8$

可猜测：

$a_n=2+3(n-1)=3n-1$

向后代换：

$a_n=a_{n-1}+3=a_{n-2}+6=\cdots=a_1+3(n-1)=3n-1$

更系统的线性递推解法在第 8 章讨论。

## 2.5 集合的基数 { #note-sec-091 }

### 有限集合的基数 { #note-sec-092 }

有限集合的基数就是元素个数。

无限集合需要新的比较方式：通过是否存在双射、单射比较大小。

### 相同基数 { #note-sec-093 }

集合 $A,B$ 有相同基数，当且仅当存在双射 $f:A\to B$，记：

$|A|=|B|$

例：正整数集 $\mathbb Z^+$ 与正偶数集 $E=\{2,4,6,\ldots\}$ 有相同基数，因为：

$f(n)=2n$

是从 $\mathbb Z^+$ 到 $E$ 的双射。

### 可数集 { #note-sec-094 }

集合若是有限集，或与正整数集有相同基数，则称为可数。无限且可数的集合称为可数无限。

判断无限集合可数的一种方式：能否把所有元素排成一个序列。

### 整数集可数 { #note-sec-095 }

可按如下顺序列出整数：

$0,1,-1,2,-2,3,-3,\ldots$

因此 $\mathbb Z$ 可数。

### 正有理数可数 { #note-sec-096 }

每个正有理数可写为 $p/q$，其中 $p,q\in\mathbb Z^+$。将所有正整数对 $(p,q)$ 放入网格，按对角线枚举并跳过重复分数，可列出所有正有理数。因此 $\mathbb Q^+$ 可数。

进一步可推出 $\mathbb Q$ 可数。

### 有限字母表上的有限字符串可数 { #note-sec-097 }

若字母表有限，则所有长度为 0 的字符串有限个，长度为 1 的字符串有限个，依此类推。按长度从小到大、同长度按字典序排列，可以列出所有有限字符串。

因此所有 Java 程序可看作某个有限字符集上的有限字符串集合的子集，所以 Java 程序集合可数。

### 不可数集 { #note-sec-098 }

实数区间 $(0,1)$ 不可数。康托尔对角线法证明思路：

假设 $(0,1)$ 中所有实数可列为：

$r_1,r_2,r_3,\ldots$

把它们写成小数。构造新实数 $r$，使 $r$ 的第 $i$ 位小数不同于 $r_i$ 的第 $i$ 位。则 $r$ 与列表中每个 $r_i$ 至少一位不同，矛盾。

因此 $(0,1)$ 不可数，进而 $\mathbb R$ 不可数。

### 不可计算函数的存在 { #note-sec-099 }

程序集合可数，但从正整数到正整数的函数集合不可数。因此存在无法由任何程序计算的函数。这是计算理论的重要起点。

### 幂集基数 { #note-sec-100 }

对任意集合 $A$：

$|A|<|\mathcal P(A)|$

这说明不存在“最大的无限基数”，无限大小有层级。

连续统假设 CH 断言：不存在基数严格介于 $\aleph_0$ 与实数基数之间。该命题在通常集合论公理系统中既不能被证明，也不能被否定。

## 2.6 矩阵 { #note-sec-101 }

课件当前只给出了矩阵章节的入口，后续内容需要补充。为了便于后续扩展，这里先保留基础框架。

### 矩阵定义 { #note-sec-102 }

一个 $m\times n$ 矩阵是按 $m$ 行 $n$ 列排列的元素表：

$A=[a_{ij}]$

其中 $a_{ij}$ 表示第 $i$ 行第 $j$ 列元素。

### 常见运算 { #note-sec-103 }

后续可补充：

- 矩阵加法。
- 标量乘法。
- 矩阵乘法。
- 转置。
- 矩阵幂。
- 0-1 矩阵的布尔运算。

### 与离散数学的关系 { #note-sec-104 }

矩阵可用于表示：

- 有向图的邻接矩阵。
- 关系的连接矩阵。
- 状态转移。
- 线性变换。

第 9 章关系会大量使用 0-1 矩阵。

## 本章小结与后续扩展 { #note-sec-105 }

本章已覆盖集合、集合运算、函数、序列和基数。矩阵部分课件目前较少，后续应优先补充矩阵运算和 0-1 矩阵运算的例题。
