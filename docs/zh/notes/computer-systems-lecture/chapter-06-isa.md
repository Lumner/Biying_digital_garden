---
title: 6. 指令集体系结构 ISA
summary: ISA 概念、指令组成、寻址方式、编码方式、CISC/RISC 和 ISA 分类。
public: true
avatar_readable: true
author: Lumner
course: 计算机系统基础
category: systems
recommended: false
updated: 2026-07-18
reading_order: 207
tags:
  - computer-systems
  - risc-v
  - course-note
  - chapter
---

# 6. 指令集体系结构 ISA { #note-sec-074 }

!!! info "章节导引"
    本页从《计算机系统基础讲义》拆分而来，保留原章节锚点，方便从旧总览页和旧链接跳转。

## 学习目标

理解 ISA 是软硬件契约，能分析指令格式设计和操作数/寻址方式的取舍。

## 前置知识

二进制编码、寄存器/ALU 基础，以及对程序执行流程的基本理解。

## 建议用时

建议 3–5 小时：ISA 概念 1 小时，格式/寻址 2 小时，CISC/RISC 比较 1–2 小时。

## 练习建议

比较 0/1/2/3 地址指令；为一个简单操作设计指令字段；解释定长编码的优缺点。

## 参考资料与引用边界

- 整理者：Lumner。
- 课程来源：根据 `SYS/` 目录下的课件整理；本章对应课件：`SYS/Lec06-1_ISA.pptx`。
- 原始讲义文件：`note/SYS_计算机系统基础讲义.md`。
- 引用边界：这是公开学习笔记，不替代课程正式教材、教师课件或考试要求；外部引用时请注明来自本网站整理版。

### 6.1 ISA 是什么 { #note-sec-075 }

ISA 是软件与硬件之间的契约。它定义程序员可见的机器接口，包括：

- 指令集合。
- 寄存器数量、宽度和用途。
- 内存组织与地址空间。
- 数据类型。
- 寻址方式。
- 异常、中断、特权行为。

ISA 与微体系结构不同。同一个 ISA 可以有多个实现，例如不同 x86 处理器共享相似 ISA，但内部流水线、缓存、乱序执行实现不同。

### 6.2 指令的组成 { #note-sec-076 }

一条指令通常包含：

| 部分 | 含义 |
|---|---|
| opcode | 做什么操作 |
| source operands | 从哪里取操作数 |
| result operand | 结果放到哪里 |
| next instruction reference | 下一条指令在哪里，通常隐式为 `PC + instruction_length` |

操作数可能在：

- 主存。
- CPU 寄存器。
- I/O 设备。
- 指令立即数字段中。

### 6.3 指令格式设计因素 { #note-sec-077 }

设计 ISA 时要考虑：

- 指令长度：定长、变长、混合。
- 操作数个数：3、2、1、0 地址。
- 可寻址寄存器数量。
- 内存是按字节还是按字寻址。
- 支持哪些寻址方式。
- opcode 是否预留扩展空间。
- 字段位置是否规则。
- 指令对齐要求。

Hennessy 和 Patterson 的设计原则：

1. Simplicity favors regularity：简单源于规则。
2. Make the common case fast：让常见情况更快。
3. Smaller is faster：更小通常更快。
4. Good design demands good compromises：好设计需要折中。

### 6.4 操作数个数 { #note-sec-078 }

以：

```text
Y = (A - B) / (C + D × E)
```

为例。

三地址指令：

```asm
SUB R1, A, B
MUL R2, D, E
ADD R2, R2, C
DIV R1, R1, R2
```

优点是表达清晰且不破坏原操作数；缺点是指令较长。

二地址指令：

```asm
SUB A, B
MUL D, E
ADD D, C
DIV A, D
```

结果覆盖第一个操作数，可能需要额外 MOV 保存原值。

一地址指令常使用累加器：

```asm
LDA D
MUL E
ADD C
STO R1
LDA A
SUB B
DIV R1
```

零地址指令使用栈：

```asm
PUSH B
PUSH A
SUB
PUSH E
PUSH D
MUL
PUSH C
ADD
DIV
POP Y
```

权衡：

| 更多操作数 | 更少操作数 |
|---|---|
| 指令数少，表达灵活 | 指令短，CPU 可能更简单 |
| 指令编码更长 | 程序可能更长 |
| 寄存器需求更明显 | 隐式操作数可能成为瓶颈 |

### 6.5 寻址方式 { #note-sec-079 }

有效地址是实际访问操作数的位置。常见寻址方式：

| 方式 | 示例 | 含义 |
|---|---|---|
| Immediate | `ADD #5` | 操作数就是常数 5 |
| Direct | `ADD 100` | 访问内存地址 100 的内容 |
| Indirect | `ADD [100]` | 地址 100 中存着真正地址 |
| Register direct | `ADD R5` | 操作数在寄存器 R5 |
| Register indirect | `ADD [R3]` | R3 中存着内存地址 |
| Relative | `PC + offset` | 常用于分支 |
| Indexed | `base + index` | 常用于数组 |
| Based | `base register + displacement` | 常用于结构体、栈帧 |

寻址方式越丰富，编程越方便，但解码和执行硬件越复杂。

### 6.6 操作类型 { #note-sec-080 }

典型 ISA 操作几十年来变化不大：

- 数据移动：load、store、move、push、pop、I/O。
- 算术：add、sub、mul、div。
- 逻辑：and、or、xor、not、set、clear。
- 移位：shift、rotate。
- 控制流：jump、branch、call、return。
- 系统：halt、interrupt、mode switch。
- 字符串或向量操作。

### 6.7 编码方式：定长、变长、混合 { #note-sec-081 }

| 编码 | 优点 | 缺点 |
|---|---|---|
| 定长 | 解码简单、便于流水线 | 代码密度较低 |
| 变长 | 代码密度高 | 解码复杂 |
| 混合 | 兼顾性能和密度 | 设计复杂 |

嵌入式 ISA 常引入 16 位压缩指令模式，以改善代码密度。

### 6.8 CISC 与 RISC { #note-sec-082 }

CISC 动机：

- 缩小高级语言与机器指令之间的语义差距。
- 降低代码大小。
- 在内存昂贵的时代减少程序体积。
- 常用微码实现复杂指令。

RISC 动机：

- 实际常用指令较少。
- 复杂指令会拖慢整体解码和实现。
- 简化指令格式和寻址方式，方便流水线。
- 把更多优化责任交给编译器。

典型对比：

| CISC | RISC |
|---|---|
| 变长指令 | 固定长度指令 |
| 指令和寻址方式多 | 指令和寻址方式少 |
| 解码复杂 | 解码简单 |
| 支持内存到内存操作 | load/store 架构 |
| 常用微码 | 通常硬连线控制 |
| 代码密度较好 | 易流水线、易超标量 |

现实中 CISC/RISC 不是绝对二分。现代 x86 外部是 CISC ISA，内部常把复杂指令解码为类似 RISC 的 micro-ops。

### 6.9 ISA 分类 { #note-sec-083 }

按操作数位置分类：

| 类型 | 示例 | 特点 |
|---|---|---|
| Accumulator | `add A`，`acc <- acc + mem[A]` | 硬件简单，累加器瓶颈明显 |
| Stack | `add`，操作栈顶 | 指令短，难并行优化 |
| Memory-Memory | `add A,B,C` | 指令数少，内存流量大 |
| Register-Memory | `add R1,A` | 代码密度好，操作数不对称 |
| Load-Store | `add R1,R2,R3` | 算术只用寄存器，访存只用 load/store |

现代新 ISA 几乎都采用 load-store，因为：

- 寄存器比内存快。
- 固定长度编码简单。
- 指令周期更一致。
- 易流水线和超标量。
- 寄存器字段比内存地址字段短。

缺点是：

- 指令条数可能更多。
- 编译器必须更好地分配寄存器。
- 函数调用和上下文切换要保存/恢复寄存器。

---
