---
title: 第 1 章 逻辑与证明
summary: 命题逻辑、谓词逻辑、推理规则和证明策略。
public: true
avatar_readable: true
author: Lumner
course: 离散数学
category: math
recommended: false
updated: 2026-07-18
reading_order: 101
tags:
  - math
  - discrete-math
  - course-note
  - chapter
---

# 第 1 章 逻辑与证明 { #note-sec-004 }

!!! info "章节导引"
    本页从《离散数学讲义》拆分而来，保留原章节锚点，方便从旧总览页和旧链接跳转。

## 学习目标

建立离散数学的形式语言，能把自然语言、系统规格和基础证明转成可检查的逻辑结构。

## 前置知识

高中集合语言、基础代数表达，以及能区分定义、命题和推理步骤。

## 建议用时

建议 4–6 小时：命题逻辑 2 小时，谓词与量词 2 小时，证明方法 1–2 小时。

## 练习建议

用真值表验证 3 个等价式；把 5 句自然语言翻译成谓词逻辑；各写 1 个直接证明、逆否证明和反证法。

## 参考资料与引用边界

- 整理者：Lumner。
- 课程来源：根据 `DM/` 目录下的课件整理；本章对应课件：`DM1.1(8).pdf, DM1.2-1.3(5).pdf, DM1.4(6).pdf, DM1.5(5).pdf, DM1.6(6).pdf, DM1.7-1.8(6).pdf`。
- 原始讲义文件：`note/离散数学讲义.md`。
- 引用边界：这是公开学习笔记，不替代课程正式教材、教师课件或考试要求；外部引用时请注明来自本网站整理版。

## 1.0 核心目标 { #note-sec-005 }

本章要建立离散数学的语言基础。命题逻辑用于刻画“真或假”的陈述，谓词逻辑用于刻画带变量的数学语句，推理规则和证明方法用于把前提严谨地推到结论。

学完本章应能做到：

- 判断一句话是否为命题，并写出复合命题的形式。
- 使用真值表、逻辑等价式、范式分析命题。
- 把自然语言翻译成谓词逻辑表达式。
- 正确使用全称量词、存在量词和嵌套量词。
- 使用推理规则构造有效论证。
- 区分直接证明、逆否证明、反证法、分情况证明、存在性证明和反例证明。

## 1.1 命题逻辑 { #note-sec-006 }

### 命题 { #note-sec-007 }

命题是一个具有确定真值的陈述句。它要么为真，要么为假，不能二者同时成立。

常见判断：

| 句子 | 是否为命题 | 原因 |
| --- | --- | --- |
| “2022 年冬奥会在北京举行。” | 是 | 有确定真值 |
| “9 是素数。” | 是 | 有确定真值，且为假 |
| “请打开书。” | 否 | 命令句，没有真假 |
| “现在几点？” | 否 | 疑问句，没有真假 |
| $x+1=4$ | 通常不是 | 未指定 $x$ 时没有确定真值 |

通常用 $p,q,r,\ldots$ 表示命题变量。真值可记为 `T/F`，也可记为 `1/0`。

### 复合命题和联结词 { #note-sec-008 }

复合命题由命题变量和逻辑联结词构成。

| 名称 | 符号 | 读法 | 为真的条件 |
| --- | --- | --- | --- |
| 否定 | $\neg p$ | 非 $p$ | $p$ 为假 |
| 合取 | $p \land q$ | $p$ 且 $q$ | $p,q$ 都真 |
| 析取 | $p \lor q$ | $p$ 或 $q$ | 至少一个真 |
| 异或 | $p \oplus q$ | 要么 $p$ 要么 $q$ | 恰好一个真 |
| 条件 | $p \to q$ | 若 $p$ 则 $q$ | 只有 $p$ 真、$q$ 假时为假 |
| 双条件 | $p \leftrightarrow q$ | $p$ 当且仅当 $q$ | $p,q$ 真值相同 |

条件命题 $p \to q$ 中，$p$ 称为前件，$q$ 称为后件。它的真假只由前件和后件的真值决定，不要求二者存在因果关系。课件中把它类比为“承诺”：只有承诺条件发生而结果没有发生时，承诺才被违反。

### 条件命题的相关形式 { #note-sec-009 }

从 $p \to q$ 可构造：

| 名称 | 形式 | 与原命题的关系 |
| --- | --- | --- |
| 逆命题 | $q \to p$ | 不一定等价 |
| 否命题 | $\neg p \to \neg q$ | 不一定等价 |
| 逆否命题 | $\neg q \to \neg p$ | 与原命题等价 |

因此证明 $p \to q$ 时，经常改证 $\neg q \to \neg p$。

### 真值表 { #note-sec-010 }

真值表列出命题变量的全部可能赋值。若有 $n$ 个命题变量，则真值表有 $2^n$ 行。

例：证明 $p \to q$ 与 $\neg p \lor q$ 等价。

| $p$ | $q$ | $p \to q$ | $\neg p \lor q$ |
| --- | --- | --- | --- |
| T | T | T | T |
| T | F | F | F |
| F | T | T | T |
| F | F | T | T |

两列完全相同，所以 $p \to q \equiv \neg p \lor q$。

### 运算优先级 { #note-sec-011 }

常用优先级从高到低为：

1. 括号。
2. 否定 $\neg$。
3. 合取 $\land$。
4. 析取 $\lor$。
5. 条件 $\to$。
6. 双条件 $\leftrightarrow$。

表达复杂公式时应尽量加括号，避免歧义。

### 位运算 { #note-sec-012 }

计算机中比特 `0/1` 可看作假/真。位串上的按位运算是把逻辑运算逐位推广。

例：设两个位串为 `0110110110` 与 `1100011101`。

- 按位 OR：对应位至少一个为 `1` 时为 `1`。
- 按位 AND：对应位都为 `1` 时为 `1`。
- 按位 XOR：对应位恰好一个为 `1` 时为 `1`。

这说明命题逻辑不仅是证明语言，也是数字系统和程序判断的基础。

## 1.2 命题逻辑的应用 { #note-sec-013 }

### 自然语言翻译 { #note-sec-014 }

把自然语言翻译成命题逻辑的目的，是消除自然语言中的歧义，使推理可以形式化。

步骤：

1. 找出原子命题。
2. 给每个原子命题命名。
3. 判断关键词对应的联结词。
4. 注意“only if”“unless”“necessary”“sufficient”等短语。

例：“You can access the Internet from campus only if you are a computer science major or you are not a freshman.”

设：

- $a$：你可以从校园访问互联网。
- $c$：你是计算机科学专业学生。
- $f$：你是一年级学生。

“$p$ only if $q$” 表示 $p \to q$。所以原句翻译为：

$a \to (c \lor \neg f)$

### 系统规格说明 { #note-sec-015 }

软件和系统工程中，经常把自然语言需求翻译成逻辑公式。

若一组规格说明可以同时为真，则称其一致；若不存在任何赋值能让所有公式同时为真，则不一致。

例：

$p \to q$、$p$、$\neg q$ 三条规格不一致，因为由前两条可推出 $q$，与第三条矛盾。

### 逻辑谜题 { #note-sec-016 }

骑士与骗子问题、宝箱问题等都可以通过命题变量建模。基本套路：

1. 用命题变量描述“某人说真话”“某箱有宝物”等事实。
2. 把每句话翻译为逻辑表达式。
3. 加入题目约束，例如“骑士总说真话，骗子总说假话”。
4. 用真值表、等价变形或反证排除不可能情况。

## 1.3 命题等价式与范式 { #note-sec-017 }

### 重言式、矛盾式、可满足式 { #note-sec-018 }

| 名称 | 定义 | 例子 |
| --- | --- | --- |
| 重言式 | 在所有赋值下都为真 | $p \lor \neg p$ |
| 矛盾式 | 在所有赋值下都为假 | $p \land \neg p$ |
| 偶然式 | 有时真、有时假 | $p \to q$ |
| 可满足式 | 至少存在一个赋值使其为真 | $p \lor q$ |
| 不可满足式 | 没有赋值使其为真 | $p \land \neg p$ |

两个命题公式 $P,Q$ 逻辑等价，当且仅当 $P \leftrightarrow Q$ 是重言式，记作 $P \equiv Q$。

### 常用逻辑等价式 { #note-sec-019 }

| 名称 | 等价式 |
| --- | --- |
| 恒等律 | $p \land T \equiv p$, $p \lor F \equiv p$ |
| 支配律 | $p \lor T \equiv T$, $p \land F \equiv F$ |
| 幂等律 | $p \lor p \equiv p$, $p \land p \equiv p$ |
| 双重否定律 | $\neg(\neg p) \equiv p$ |
| 交换律 | $p \lor q \equiv q \lor p$, $p \land q \equiv q \land p$ |
| 结合律 | $(p\lor q)\lor r \equiv p\lor(q\lor r)$, $(p\land q)\land r \equiv p\land(q\land r)$ |
| 分配律 | $p\lor(q\land r)\equiv(p\lor q)\land(p\lor r)$ |
| 分配律 | $p\land(q\lor r)\equiv(p\land q)\lor(p\land r)$ |
| 德摩根律 | $\neg(p\land q)\equiv \neg p\lor \neg q$ |
| 德摩根律 | $\neg(p\lor q)\equiv \neg p\land \neg q$ |
| 吸收律 | $p\lor(p\land q)\equiv p$, $p\land(p\lor q)\equiv p$ |
| 条件等价 | $p\to q\equiv \neg p\lor q$ |
| 双条件等价 | $p\leftrightarrow q\equiv(p\to q)\land(q\to p)$ |

扩展德摩根律：

$\neg(p_1\lor p_2\lor\cdots\lor p_n)\equiv \neg p_1\land\neg p_2\land\cdots\land\neg p_n$

$\neg(p_1\land p_2\land\cdots\land p_n)\equiv \neg p_1\lor\neg p_2\lor\cdots\lor\neg p_n$

### 用等价式化简 { #note-sec-020 }

例：证明 $\neg(p\lor(\neg p\land q))\equiv \neg p\land\neg q$。

推导：

$p\lor(\neg p\land q)$

$\equiv (p\lor\neg p)\land(p\lor q)$

$\equiv T\land(p\lor q)$

$\equiv p\lor q$

所以：

$\neg(p\lor(\neg p\land q))\equiv \neg(p\lor q)\equiv \neg p\land\neg q$

### 其他逻辑算子和函数完备性 { #note-sec-021 }

Sheffer stroke：

$p|q\equiv\neg(p\land q)$

它就是 NAND。仅用 NAND 可以表示所有命题公式，因此 `{NAND}` 是函数完备的。

类似地，NOR：

$p\downarrow q\equiv\neg(p\lor q)$

仅用 NOR 也能表示所有命题公式。

### 对偶 { #note-sec-022 }

只含 $\land,\lor,T,F$ 的公式，把 $\land$ 与 $\lor$ 互换，把 $T$ 与 $F$ 互换，得到其对偶式。

若某个等价式成立，则它的对偶式也成立。例如：

$p\lor F\equiv p$ 的对偶为 $p\land T\equiv p$。

### 析取范式和合取范式 { #note-sec-023 }

文字是命题变量或其否定，如 $p$、$\neg q$。

析取范式 DNF 是若干合取项的析取，例如：

$(p\land \neg q)\lor(\neg p\land r)$

合取范式 CNF 是若干析取项的合取，例如：

$(p\lor q)\land(\neg p\lor r)$

任何命题公式都可转化为 DNF，也可转化为 CNF。常用步骤：

1. 消去 $\to,\leftrightarrow$。
2. 用德摩根律把否定推进到变量前。
3. 使用分配律整理成 DNF 或 CNF。

### 主析取范式和主合取范式 { #note-sec-024 }

极小项是包含每个变量一次的合取项，例如变量为 $p,q,r$ 时：

$p\land \neg q\land r$

主析取范式是由极小项组成的析取式。可由真值表中使公式为真的行得到。

极大项是包含每个变量一次的析取项。主合取范式可由真值表中使公式为假的行得到。

### SAT 和 n 皇后建模 { #note-sec-025 }

可满足性问题 SAT 问的是：是否存在变量赋值使公式为真。

n 皇后问题可建模为 SAT：

- 用 $p_{i,j}$ 表示第 $i$ 行第 $j$ 列放置皇后。
- 每一行至少一个皇后。
- 每一行至多一个皇后。
- 每一列至多一个皇后。
- 每一条对角线至多一个皇后。

这类建模体现了逻辑在人工智能、软件测试、自动证明、排程和电路设计中的应用。

## 1.4 谓词与量词 { #note-sec-026 }

### 为什么需要谓词逻辑 { #note-sec-027 }

命题逻辑无法表达内部结构。例如：

“所有人都会死。苏格拉底是人。所以苏格拉底会死。”

若只用命题逻辑，会看不出“人”和“会死”之间的普遍关系。谓词逻辑引入变量、谓词和量词。

### 谓词和命题函数 { #note-sec-028 }

谓词是带变量的陈述，如 $P(x)$。当变量取具体值后，命题函数变成命题。

例：设 $P(x)$ 表示 $x>0$，论域为整数。

- $P(3)$ 为真。
- $P(-2)$ 为假。
- $P(x)$ 本身不是命题，因为 $x$ 未确定。

多元谓词如 $R(x,y,z)$ 可表示 $x+y=z$。

### 量词 { #note-sec-029 }

全称量词：

$\forall x P(x)$

读作“对所有 $x$，$P(x)$ 成立”。

存在量词：

$\exists x P(x)$

读作“存在某个 $x$，使 $P(x)$ 成立”。

唯一存在量词：

$\exists!x P(x)$

表示恰有一个 $x$ 使 $P(x)$ 成立。

若论域有限：

$\forall x P(x)$ 相当于所有实例的合取。

$\exists x P(x)$ 相当于所有实例的析取。

### 论域的重要性 { #note-sec-030 }

量词命题的真假依赖论域。

命题 $\forall x(x^2\ge 0)$：

- 若论域为实数，真。
- 若论域为复数，表达式中的大小关系未必适用，需要重新定义。

写谓词逻辑表达式时必须明确论域，或在公式中限制变量范围。

### 限制量词 { #note-sec-031 }

$\forall x\in S\,P(x)$ 等价于：

$\forall x(x\in S\to P(x))$

$\exists x\in S\,P(x)$ 等价于：

$\exists x(x\in S\land P(x))$

注意：全称限制通常用条件，存在限制通常用合取。

### 自然语言翻译 { #note-sec-032 }

例：“Every student in this class has taken a course in Java.”

设：

- $S(x)$：$x$ 是本班学生。
- $J(x)$：$x$ 学过 Java 课程。

公式：

$\forall x(S(x)\to J(x))$

例：“Some student in this class has taken a course in Java.”

公式：

$\exists x(S(x)\land J(x))$

### 量词否定 { #note-sec-033 }

德摩根律在量词中的形式：

$\neg\forall x P(x)\equiv \exists x\neg P(x)$

$\neg\exists x P(x)\equiv \forall x\neg P(x)$

自然语言中：

- “并非所有学生都学过 Java”等价于“至少有一个学生没学过 Java”。
- “不存在学生学过 Java”等价于“所有学生都没学过 Java”。

### 程序正确性中的前置条件和后置条件 { #note-sec-034 }

谓词可描述程序执行前后应满足的性质。

- 前置条件：程序开始前必须满足。
- 后置条件：程序结束后应满足。

例如交换变量 $x,y$ 的程序，前置条件可设为 $x=a\land y=b$，后置条件应为 $x=b\land y=a$。程序正确性证明就是说明：若前置条件成立，执行程序后后置条件一定成立。

## 1.5 嵌套量词与前束范式 { #note-sec-035 }

### 嵌套量词 { #note-sec-036 }

多个量词嵌套时，量词顺序通常很重要。

$\forall x\exists y P(x,y)$ 表示：对每个 $x$，都能找到一个可能依赖于 $x$ 的 $y$。

$\exists y\forall x P(x,y)$ 表示：存在同一个 $y$，对所有 $x$ 都成立。

第二个通常比第一个强。

### 同类量词可交换 { #note-sec-037 }

$\forall x\forall y P(x,y)\equiv \forall y\forall x P(x,y)$

$\exists x\exists y P(x,y)\equiv \exists y\exists x P(x,y)$

但不同类量词一般不能交换：

$\forall x\exists y P(x,y)$ 与 $\exists y\forall x P(x,y)$ 不等价。

### 例：实数乘积 { #note-sec-038 }

设论域为实数，$P(x,y)$ 表示 $xy=0$。

- $\forall x\exists y P(x,y)$ 为真。对任意 $x$，取 $y=0$。
- $\exists y\forall x P(x,y)$ 为真。取 $y=0$，任意 $x$ 都有 $xy=0$。

若 $P(x,y)$ 表示 $x/y=1$，则要注意 $y\ne 0$ 的隐含条件，且不同量词顺序会产生不同真假。

### 唯一性表达 { #note-sec-039 }

“每个人恰有一个最好的朋友”可写为：

$\forall x\exists y(B(x,y)\land \forall z(B(x,z)\to z=y))$

也可使用唯一存在量词：

$\forall x\exists!y B(x,y)$

展开唯一存在的常见格式：

$\exists x(P(x)\land \forall y(P(y)\to y=x))$

### 极限定义的逻辑结构 { #note-sec-040 }

函数 $f(x)$ 在 $a$ 处极限为 $L$ 的定义可写为：

$\forall \varepsilon>0\,\exists \delta>0\,\forall x(0<|x-a|<\delta\to |f(x)-L|<\varepsilon)$

此例体现嵌套量词的依赖关系：$\delta$ 可以依赖 $\varepsilon$，而 $x$ 是在给定 $\delta$ 后任取的。

### 前束范式 { #note-sec-041 }

前束范式是把所有量词放到公式最前面，其后跟不含量词的公式：

$Q_1x_1Q_2x_2\cdots Q_nx_n\,M$

其中 $Q_i$ 是 $\forall$ 或 $\exists$，$M$ 不含量词。

转换思路：

1. 消去 $\to,\leftrightarrow$。
2. 把否定推进到谓词前。
3. 变量必要时改名，避免变量捕获。
4. 利用量词与逻辑联结词的等价式，把量词移到前面。

前束范式常用于自动定理证明和逻辑标准化。

## 1.6 推理规则 { #note-sec-042 }

### 论证和有效性 { #note-sec-043 }

论证由一列命题组成，最后一个是结论，前面的为前提。若所有前提为真时结论必真，则论证有效。

形式化地，前提 $p_1,p_2,\ldots,p_n$ 推出结论 $q$，等价于：

$(p_1\land p_2\land\cdots\land p_n)\to q$

是重言式。

### 命题逻辑推理规则 { #note-sec-044 }

| 名称 | 形式 |
| --- | --- |
| 假言推理 Modus Ponens | $p,\ p\to q\ \therefore q$ |
| 拒取式 Modus Tollens | $\neg q,\ p\to q\ \therefore \neg p$ |
| 假言三段论 | $p\to q,\ q\to r\ \therefore p\to r$ |
| 析取三段论 | $p\lor q,\ \neg p\ \therefore q$ |
| 合取引入 | $p,\ q\ \therefore p\land q$ |
| 简化 | $p\land q\ \therefore p$ |
| 附加 | $p\ \therefore p\lor q$ |
| 消解 | $p\lor q,\ \neg p\lor r\ \therefore q\lor r$ |

消解法适合自动推理。若把公式化为子句集合，反复使用消解可检查结论是否由前提推出。

### 常见谬误 { #note-sec-045 }

肯定后件：

$p\to q,\ q\ \therefore p$

这是无效推理。

否定前件：

$p\to q,\ \neg p\ \therefore \neg q$

这也是无效推理。

### 量词推理规则 { #note-sec-046 }

| 名称 | 形式 | 说明 |
| --- | --- | --- |
| 全称实例化 UI | $\forall xP(x)\ \therefore P(c)$ | 从所有对象成立推出某个对象成立 |
| 全称推广 UG | $P(c)\ \therefore \forall xP(x)$ | $c$ 必须是任意对象 |
| 存在实例化 EI | $\exists xP(x)\ \therefore P(c)$ | $c$ 是新的代表元 |
| 存在推广 EG | $P(c)\ \therefore \exists xP(x)$ | 某个对象成立则存在对象成立 |

综合规则：

全称假言推理：

$\forall x(P(x)\to Q(x)),\ P(a)\ \therefore Q(a)$

全称拒取式：

$\forall x(P(x)\to Q(x)),\ \neg Q(a)\ \therefore \neg P(a)$

### 苏格拉底论证 { #note-sec-047 }

前提：

1. 所有人都会死。
2. 苏格拉底是人。

设 $M(x)$ 表示 $x$ 是人，$D(x)$ 表示 $x$ 会死，$s$ 表示苏格拉底。

形式化：

1. $\forall x(M(x)\to D(x))$
2. $M(s)$

由全称实例化得 $M(s)\to D(s)$，再由假言推理得 $D(s)$。

## 1.7 证明导论 { #note-sec-048 }

### 定理、命题、引理和推论 { #note-sec-049 }

| 名称 | 含义 |
| --- | --- |
| 定理 theorem | 被证明为真的重要命题 |
| 命题 proposition | 重要性较低的定理 |
| 引理 lemma | 为证明其他结论服务的辅助定理 |
| 推论 corollary | 可由定理直接推出的结果 |
| 证明 proof | 由前提到结论的有效论证 |

### 直接证明 { #note-sec-050 }

证明 $p\to q$ 时，假设 $p$ 为真，通过定义和已知定理推出 $q$。

例：若 $n$ 为奇数，则 $n^2$ 为奇数。

证明：设 $n=2k+1$，其中 $k$ 为整数。则：

$n^2=(2k+1)^2=4k^2+4k+1=2(2k^2+2k)+1$

所以 $n^2$ 是奇数。

### 逆否证明 { #note-sec-051 }

证明 $p\to q$ 可等价地证明 $\neg q\to \neg p$。

适用情况：结论的否定更容易使用，或目标与奇偶、整除等定义有关。

例：若 $n^2$ 为偶数，则 $n$ 为偶数。可证逆否命题：若 $n$ 为奇数，则 $n^2$ 为奇数。

### 空证明和显然证明 { #note-sec-052 }

空证明：若前件 $p$ 永假，则 $p\to q$ 为真。

显然证明：若后件 $q$ 永真，则 $p\to q$ 为真。

它们在形式逻辑中有效，但在写数学证明时应说明原因，避免看起来像跳步。

### 反证法 { #note-sec-053 }

证明命题 $p$ 时，假设 $\neg p$ 为真，然后推出矛盾，因此 $p$ 为真。

经典例：素数有无穷多个。

证明思路：假设只有有限多个素数 $p_1,p_2,\ldots,p_n$。令：

$N=p_1p_2\cdots p_n+1$

任一 $p_i$ 都不能整除 $N$。因此 $N$ 要么是新素数，要么有不在列表中的素因子，矛盾。

### 充要条件证明 { #note-sec-054 }

证明 $p\leftrightarrow q$，通常分两步：

1. 证明 $p\to q$。
2. 证明 $q\to p$。

若要证明多个命题 $p_1,p_2,\ldots,p_n$ 等价，可以证明循环链：

$p_1\to p_2\to\cdots\to p_n\to p_1$

## 1.8 证明方法与策略 { #note-sec-055 }

### 分情况证明 { #note-sec-056 }

要证明：

$(p_1\lor p_2\lor\cdots\lor p_n)\to q$

可分别证明每个 $p_i\to q$。

例：若整数 $n$ 不被 3 整除，则 $n^2\equiv 1\pmod 3$。

证明：不被 3 整除时，$n\equiv 1$ 或 $n\equiv 2\pmod 3$。

- 若 $n\equiv1$，则 $n^2\equiv1$。
- 若 $n\equiv2$，则 $n^2\equiv4\equiv1$。

所以结论成立。

### 存在性证明 { #note-sec-057 }

构造性存在证明：给出一个具体对象 $c$，并验证 $P(c)$。

非构造性存在证明：证明对象存在，但不明确给出对象。常通过反证法、鸽巢原理或中间值思想完成。

### 唯一性证明 { #note-sec-058 }

证明“存在唯一”通常分两步：

1. 存在性：证明至少有一个对象满足性质。
2. 唯一性：假设 $a,b$ 都满足该性质，推出 $a=b$。

### 反例证明 { #note-sec-059 }

要否定全称命题 $\forall xP(x)$，只需找到一个 $c$ 使 $P(c)$ 为假。即：

$\neg\forall xP(x)\equiv \exists x\neg P(x)$

反例必须满足原命题的前提，且使结论失败。

### 前向推理和后向推理 { #note-sec-060 }

前向推理：从已知前提出发，逐步推出目标。

后向推理：从目标出发，思考要证明它需要什么条件，再回到前提寻找这些条件。

写正式证明时，常用前向形式呈现；寻找证明时，后向推理很有用。

### 本章小结与后续扩展 { #note-sec-061 }

本章现有材料已经覆盖命题逻辑、谓词逻辑、推理规则和基础证明策略。后续若新增课件，可优先补充：

- 更多自然语言翻译例题。
- 范式转换的完整步骤题。
- 一阶逻辑推理的复杂例题。
- 证明题常见错误整理。
