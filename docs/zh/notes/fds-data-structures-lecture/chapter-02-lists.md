---
title: 2. 抽象数据类型与线性表
summary: ADT、数组表、链表、双向循环链表、多项式 ADT、多重链表和游标实现。
public: true
avatar_readable: true
author: Lumner
course: FDS 数据结构基础
category: algorithms
recommended: false
updated: 2026-07-18
reading_order: 303
tags:
  - data-structures
  - algorithms
  - course-note
  - chapter
---

# 2. 抽象数据类型与线性表 { #note-sec-016 }

!!! info "章节导引"
    本页从《FDS 数据结构基础讲义》拆分而来，保留原章节锚点，方便从旧总览页和旧链接跳转。

## 学习目标

区分接口和实现，理解数组与链表在访问、插入、删除上的取舍。

## 前置知识

结构体/指针或引用、数组和基础动态内存直觉。

## 建议用时

建议 5–6 小时：ADT 1 小时，数组/链表 3 小时，多项式/游标 1–2 小时。

## 练习建议

写出线性表 ADT；比较数组表和链表复杂度；手画一次链表插入和删除。

## 参考资料与引用边界

- 整理者：Lumner。
- 课程来源：根据 `FDS/` 目录下的课件整理；本章对应课件：`FDS/DS02_Ch03_List.ppt`。
- 原始讲义文件：`note/FDS_数据结构基础讲义.md`。
- 引用边界：这是公开学习笔记，不替代课程正式教材、教师课件或考试要求；外部引用时请注明来自本网站整理版。

### 2.1 ADT：把“是什么”和“怎么做”分开 { #note-sec-017 }

数据类型可以看成 `{对象集合} + {操作集合}`。抽象数据类型 ADT 更强调接口和语义，而不是具体实现。

以线性表为例：

- 对象：\((item_0,item_1,\ldots,item_{N-1})\)。
- 操作：求长度、打印、查找第 k 个元素、查找某元素位置、插入、删除等。
- 实现：数组、链表、游标链表都可以实现同一个 List ADT。

这就是抽象的价值：用户只关心 `Insert`、`Delete`、`Find` 的行为；实现者负责选择结构并控制复杂度。

### 2.2 数组实现线性表 { #note-sec-018 }

数组实现使用连续内存，天然支持随机访问：

| 操作 | 复杂度 | 原因 |
|---|---:|---|
| `Find_Kth(k)` | \(O(1)\) | 地址可直接计算 |
| `Find(x)` | \(O(N)\) | 需要顺序扫描 |
| 在末尾插入 | 平均可为 \(O(1)\) | 若容量足够 |
| 在中间插入 | \(O(N)\) | 后续元素需要右移 |
| 删除中间元素 | \(O(N)\) | 后续元素需要左移 |

数组的主要问题是容量需要预估，扩容需要搬迁元素；中间插入删除代价高。

### 2.3 链表实现线性表 { #note-sec-019 }

链表由节点组成，每个节点保存数据和指向下一节点的指针。

```c
typedef struct Node *PtrToNode;
struct Node {
    ElementType Element;
    PtrToNode Next;
};
typedef PtrToNode List;
typedef PtrToNode Position;
```

使用头节点可以统一空表、首元节点插入和普通插入的处理。

#### 插入 { #note-sec-020 }

在位置 `P` 后插入 `X`：

```c
void Insert(ElementType X, List L, Position P) {
    Position TmpCell = malloc(sizeof(struct Node));
    if (TmpCell == NULL)
        FatalError("Out of space");
    TmpCell->Element = X;
    TmpCell->Next = P->Next;
    P->Next = TmpCell;
}
```

链表插入本身是 \(O(1)\)，但前提是已经拿到位置 `P`。如果还要先查找 `P`，总复杂度会包含查找的 \(O(N)\)。

#### 删除 { #note-sec-021 }

删除值为 `X` 的第一个节点：

```c
void Delete(ElementType X, List L) {
    Position P = FindPrevious(X, L);
    if (!IsLast(P, L)) {
        Position TmpCell = P->Next;
        P->Next = TmpCell->Next;
        free(TmpCell);
    }
}
```

删除需要找到前驱节点，因为单链表无法从当前节点直接回到前一个节点。

### 2.4 双向循环链表 { #note-sec-022 }

双向链表节点有 `Prev` 和 `Next` 两个方向。循环链表让尾节点指向头节点，使“从末尾回到开头”变成自然操作。

适合场景：

- 需要频繁向前、向后移动。
- 需要在已知节点前后插入删除。
- 需要轮转处理任务，例如循环调度。

代价：

- 每个节点多一个指针，空间增加。
- 插入删除时要维护两条链接，代码更容易写错。

### 2.5 多项式 ADT { #note-sec-023 }

多项式可表示为若干项 `<指数, 系数>`：

\(P(x)=a_1x^{e_1}+a_2x^{e_2}+\cdots+a_nx^{e_n}\)

两种常见表示：

| 表示 | 适合场景 | 缺点 |
|---|---|---|
| 系数数组 | 最高次数不大且较密集 | 稀疏多项式浪费空间 |
| 按指数有序链表 | 稀疏多项式 | 查找某次项较慢 |

多项式相加的核心是“归并”：

```c
while (P != NULL && Q != NULL) {
    if (P->Exponent > Q->Exponent) {
        Attach(P->Coefficient, P->Exponent, &Rear);
        P = P->Next;
    } else if (P->Exponent < Q->Exponent) {
        Attach(Q->Coefficient, Q->Exponent, &Rear);
        Q = Q->Next;
    } else {
        int sum = P->Coefficient + Q->Coefficient;
        if (sum != 0)
            Attach(sum, P->Exponent, &Rear);
        P = P->Next;
        Q = Q->Next;
    }
}
```

这和合并两个有序表类似，复杂度为两个多项式项数之和。

### 2.6 多重链表与稀疏矩阵 { #note-sec-024 }

多重链表用于一个节点同时属于多个逻辑链表。例如课程注册系统：

- 从课程角度：一门课连接所有选课学生。
- 从学生角度：一个学生连接所有已选课程。

同一个“选课关系”节点可以同时挂在课程链和学生链上，避免重复存储关系。

稀疏矩阵也常用类似思想：只存非零元素，并为行、列分别建立链接。若非零元素个数为 \(K\)，空间就能从 \(O(RC)\) 降到 \(O(K)\)。

### 2.7 游标实现链表 { #note-sec-025 }

某些语言或场景没有指针，可以用数组下标模拟指针。课件称为 cursor implementation。

```c
typedef int PtrToNode;
typedef PtrToNode List;
typedef PtrToNode Position;

struct Node {
    ElementType Element;
    Position Next;
};

struct Node CursorSpace[SpaceSize];
```

`CursorSpace[i].Next` 存下一个节点的下标。数组 0 号位置通常作为空闲链表头，模拟 `malloc` 和 `free`。

核心思想：指针本质上也是“地址”。当真实地址不可用时，下标也可以承担连接关系。
