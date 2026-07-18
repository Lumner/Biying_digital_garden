---
title: 计算机系统基础讲义
summary: 计算机系统基础中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。
description: 计算机系统基础中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。
public: true
avatar_readable: true
author: Lumner
course: 计算机系统基础
category: systems
recommended: true
updated: 2026-07-18
reading_order: 20
tags:
  - computer-systems
  - risc-v
  - course-note
---

# 计算机系统基础讲义

!!! info "拆分状态"
    这页保留原来的 `/zh/notes/computer-systems-lecture/` 地址，作为计算机系统基础讲义总览和旧链接兼容层。章节正文已经拆分到稳定子路径；如果旧链接带有 `#note-sec-...` 锚点，可在本页的“旧锚点跳转表”找到对应新位置。

## 阅读导引 { #reading-guide }

这份讲义把数字逻辑、运算部件、时序逻辑、ISA、RISC-V、汇编、ELF、链接和装载放在同一条系统链路里。建议先从总览理解层次，再按章节阅读。

## 课程目标

- 建立从物理信号到运行程序的层次化视角。
- 掌握信息表示、布尔逻辑、组合逻辑、运算部件、时序逻辑和 ISA 的核心接口。
- 能把 RISC-V 指令、调用约定、目标文件、链接和装载串成程序执行过程。

## 前置知识

- 二进制、基础编程和简单代数。
- 对函数调用、内存、寄存器和汇编有基本直觉会更顺。
- 能阅读 Markdown 数学公式与代码块。

## 总体建议用时

建议按 8 个主体章节分 5–8 周学习；如果只做快速复习，可优先读第 1、2、4、6、7 章，再查附录。

## 总体练习建议

- 每章至少整理一张“接口表”：输入、输出、关键约束和常见错误。
- 对硬件章节，优先画真值表、状态图或数据通路草图。
- 对 ISA 与程序运行章节，优先手算指令字段、栈帧和符号重定位过程。

## 课程来源与引用边界

- 整理者：Lumner。
- 内容来源：根据 `SYS/` 目录下现有计算机系统基础课件与 `note/SYS_计算机系统基础讲义.md` 整理。
- 图片边界：源讲义引用的图片未随公开仓库发布；页面中用“图像说明”保留上下文，不再把缺图当作空占位。
- 站内用途：作为公开学习笔记和碧影可读取的公共知识来源。
- 引用边界：这不是课程官方教材，也不替代教师课件、课堂说明或考试要求；外部引用时请注明来自本网站整理版。

## 章节入口

- [0. 课程视角：从门电路到系统软件](computer-systems-lecture/chapter-00-system-view.md)：从物理信号、逻辑门、RTL、ISA 到程序运行的整体抽象链路。（建议 1–2 小时）
- [1. 信息表示](computer-systems-lecture/chapter-01-information-representation.md)：二进制、进制转换、整数、补码、浮点数、字符和数据宽度。（建议 5–7 小时）
- [2. 布尔代数与数字逻辑基础](computer-systems-lecture/chapter-02-boolean-logic.md)：逻辑变量、基本门、布尔代数、标准形式、Karnaugh Map 和多级优化。（建议 5–6 小时）
- [3. 组合逻辑设计与 Verilog HDL](computer-systems-lecture/chapter-03-combinational-logic.md)：HDL 设计流、Verilog 基础、组合逻辑设计、常用功能块和时序分析。（建议 6–8 小时）
- [4. 运算部件与 ALU](computer-systems-lecture/chapter-04-arithmetic-alu.md)：加减乘除、进位加法器、溢出、移位器、Booth 算法、浮点运算和 ALU。（建议 6–8 小时）
- [5. 时序逻辑设计](computer-systems-lecture/chapter-05-sequential-logic.md)：锁存器、触发器、时序参数、FSM、寄存器、总线、移位寄存器和计数器。（建议 6–8 小时）
- [6. 指令集体系结构 ISA](computer-systems-lecture/chapter-06-isa.md)：ISA 概念、指令组成、寻址方式、编码方式、CISC/RISC 和 ISA 分类。（建议 3–5 小时）
- [7. RISC-V ISA、汇编与程序运行](computer-systems-lecture/chapter-07-riscv-programs.md)：RISC-V 状态、指令格式、基础整数指令、控制流、调用约定、ELF、链接和装载。（建议 7–10 小时）
- [附录：速查表与后续扩展](computer-systems-lecture/appendix-reference.md)：常用结论、寄存器速记、更新规则和后续扩展边界。

## 章节与课件对应表

| 章节 | 覆盖内容 | 对应课件 |
| --- | --- | --- |
| [0. 课程视角：从门电路到系统软件](computer-systems-lecture/chapter-00-system-view.md) | 从物理信号、逻辑门、RTL、ISA 到程序运行的整体抽象链路。 | `SYS/Lec00_Introduction.pptx` |
| [1. 信息表示](computer-systems-lecture/chapter-01-information-representation.md) | 二进制、进制转换、整数、补码、浮点数、字符和数据宽度。 | `SYS/Lec01-Information Representation.pptx` |
| [2. 布尔代数与数字逻辑基础](computer-systems-lecture/chapter-02-boolean-logic.md) | 逻辑变量、基本门、布尔代数、标准形式、Karnaugh Map 和多级优化。 | `SYS/Lec02_Boolean Algebra.pptx` |
| [3. 组合逻辑设计与 Verilog HDL](computer-systems-lecture/chapter-03-combinational-logic.md) | HDL 设计流、Verilog 基础、组合逻辑设计、常用功能块和时序分析。 | `SYS/Lec03_Combinational Logic.pptx` |
| [4. 运算部件与 ALU](computer-systems-lecture/chapter-04-arithmetic-alu.md) | 加减乘除、进位加法器、溢出、移位器、Booth 算法、浮点运算和 ALU。 | `SYS/Lec04_Arithmetic Unit.pptx` |
| [5. 时序逻辑设计](computer-systems-lecture/chapter-05-sequential-logic.md) | 锁存器、触发器、时序参数、FSM、寄存器、总线、移位寄存器和计数器。 | `SYS/Lec05_Sequential Logic.pptx` |
| [6. 指令集体系结构 ISA](computer-systems-lecture/chapter-06-isa.md) | ISA 概念、指令组成、寻址方式、编码方式、CISC/RISC 和 ISA 分类。 | `SYS/Lec06-1_ISA.pptx` |
| [7. RISC-V ISA、汇编与程序运行](computer-systems-lecture/chapter-07-riscv-programs.md) | RISC-V 状态、指令格式、基础整数指令、控制流、调用约定、ELF、链接和装载。 | `SYS/Lec06-2_RISCV.pptx` |

## 旧锚点跳转表

下面的条目用于兼容旧版长页面的 `#note-sec-...` 锚点。锚点本身保留在本页；点击条目会进入新的章节子页面或附录页。

- <span id="note-sec-001"></span>[资料来源](#reading-guide)
- <span id="note-sec-002"></span>[0. 课程视角：从门电路到系统软件](computer-systems-lecture/chapter-00-system-view.md#note-sec-002)
  - <span id="note-sec-003"></span>[0.1 抽象层次](computer-systems-lecture/chapter-00-system-view.md#note-sec-003)
  - <span id="note-sec-004"></span>[0.2 本课程主线](computer-systems-lecture/chapter-00-system-view.md#note-sec-004)
- <span id="note-sec-005"></span>[1. 信息表示](computer-systems-lecture/chapter-01-information-representation.md#note-sec-005)
  - <span id="note-sec-006"></span>[1.1 信息、信号与二值抽象](computer-systems-lecture/chapter-01-information-representation.md#note-sec-006)
  - <span id="note-sec-007"></span>[1.2 外部信息与内部数据](computer-systems-lecture/chapter-01-information-representation.md#note-sec-007)
  - <span id="note-sec-008"></span>[1.3 进位计数制](computer-systems-lecture/chapter-01-information-representation.md#note-sec-008)
  - <span id="note-sec-009"></span>[1.4 十进制到其他进制](computer-systems-lecture/chapter-01-information-representation.md#note-sec-009)
  - <span id="note-sec-010"></span>[1.5 二进制、八进制、十六进制互转](computer-systems-lecture/chapter-01-information-representation.md#note-sec-010)
  - <span id="note-sec-011"></span>[1.6 2 的幂与容量单位](computer-systems-lecture/chapter-01-information-representation.md#note-sec-011)
  - <span id="note-sec-012"></span>[1.7 定点整数表示](computer-systems-lecture/chapter-01-information-representation.md#note-sec-012)
  - <span id="note-sec-013"></span>[1.8 补码求负与符号扩展](computer-systems-lecture/chapter-01-information-representation.md#note-sec-013)
  - <span id="note-sec-014"></span>[1.9 浮点数表示](computer-systems-lecture/chapter-01-information-representation.md#note-sec-014)
  - <span id="note-sec-015"></span>[1.10 IEEE 754 特殊值](computer-systems-lecture/chapter-01-information-representation.md#note-sec-015)
  - <span id="note-sec-016"></span>[1.11 舍入与浮点运算陷阱](computer-systems-lecture/chapter-01-information-representation.md#note-sec-016)
  - <span id="note-sec-017"></span>[1.12 BCD、Gray Code 与 Excess-3](computer-systems-lecture/chapter-01-information-representation.md#note-sec-017)
  - <span id="note-sec-018"></span>[1.13 字符与非数值数据](computer-systems-lecture/chapter-01-information-representation.md#note-sec-018)
  - <span id="note-sec-019"></span>[1.14 数据宽度、字长与大小端](computer-systems-lecture/chapter-01-information-representation.md#note-sec-019)
- <span id="note-sec-020"></span>[2. 布尔代数与数字逻辑基础](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-020)
  - <span id="note-sec-021"></span>[2.1 为什么使用数字逻辑](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-021)
  - <span id="note-sec-022"></span>[2.2 逻辑变量与基本逻辑运算](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-022)
  - <span id="note-sec-023"></span>[2.3 晶体管与逻辑门](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-023)
  - <span id="note-sec-024"></span>[2.4 布尔代数基本律](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-024)
  - <span id="note-sec-025"></span>[2.5 对偶性](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-025)
  - <span id="note-sec-026"></span>[2.6 逻辑函数表示](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-026)
  - <span id="note-sec-027"></span>[2.7 最小项、最大项与标准形式](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-027)
  - <span id="note-sec-028"></span>[2.8 化简目标与代价](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-028)
  - <span id="note-sec-029"></span>[2.9 Karnaugh Map](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-029)
  - <span id="note-sec-030"></span>[2.10 Bubble Pushing 与多级优化](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-030)
  - <span id="note-sec-031"></span>[2.11 XOR、奇偶校验与三态逻辑](computer-systems-lecture/chapter-02-boolean-logic.md#note-sec-031)
- <span id="note-sec-032"></span>[3. 组合逻辑设计与 Verilog HDL](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-032)
  - <span id="note-sec-033"></span>[3.1 HDL 设计流](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-033)
  - <span id="note-sec-034"></span>[3.2 Verilog 基础](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-034)
  - <span id="note-sec-035"></span>[3.3 Verilog 数字与数据类型](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-035)
  - <span id="note-sec-036"></span>[3.4 运算符与建模方式](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-036)
  - <span id="note-sec-037"></span>[3.5 组合逻辑电路定义](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-037)
  - <span id="note-sec-038"></span>[3.6 组合逻辑设计流程](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-038)
  - <span id="note-sec-039"></span>[3.7 例：三开关控制单灯](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-039)
  - <span id="note-sec-040"></span>[3.8 常用组合功能块](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-040)
  - <span id="note-sec-046"></span>[3.9 时序分析、关键路径与毛刺](computer-systems-lecture/chapter-03-combinational-logic.md#note-sec-046)
- <span id="note-sec-047"></span>[4. 运算部件与 ALU](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-047)
  - <span id="note-sec-048"></span>[4.1 迭代组合电路](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-048)
  - <span id="note-sec-049"></span>[4.2 半加器与全加器](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-049)
  - <span id="note-sec-050"></span>[4.3 多位加法器](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-050)
  - <span id="note-sec-051"></span>[4.4 减法与溢出](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-051)
  - <span id="note-sec-052"></span>[4.5 ALU](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-052)
  - <span id="note-sec-053"></span>[4.6 移位器](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-053)
  - <span id="note-sec-054"></span>[4.7 乘法](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-054)
  - <span id="note-sec-055"></span>[4.8 Booth 算法](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-055)
  - <span id="note-sec-056"></span>[4.9 除法](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-056)
  - <span id="note-sec-057"></span>[4.10 浮点加法与乘法](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-057)
  - <span id="note-sec-058"></span>[4.11 数据通路中的 ALU](computer-systems-lecture/chapter-04-arithmetic-alu.md#note-sec-058)
- <span id="note-sec-059"></span>[5. 时序逻辑设计](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-059)
  - <span id="note-sec-060"></span>[5.1 时序逻辑模型](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-060)
  - <span id="note-sec-061"></span>[5.2 反馈、稳定与存储](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-061)
  - <span id="note-sec-062"></span>[5.3 SR Latch、D Latch 与 Flip-Flop](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-062)
  - <span id="note-sec-063"></span>[5.4 触发器时序参数](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-063)
  - <span id="note-sec-064"></span>[5.5 时序电路分析流程](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-064)
  - <span id="note-sec-065"></span>[5.6 Moore 与 Mealy](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-065)
  - <span id="note-sec-066"></span>[5.7 状态等价与化简](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-066)
  - <span id="note-sec-067"></span>[5.8 时序逻辑设计流程](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-067)
  - <span id="note-sec-068"></span>[5.9 例：序列检测器 1101](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-068)
  - <span id="note-sec-069"></span>[5.10 未使用状态与自启动](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-069)
  - <span id="note-sec-070"></span>[5.11 寄存器与寄存器传输](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-070)
  - <span id="note-sec-071"></span>[5.12 总线结构](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-071)
  - <span id="note-sec-072"></span>[5.13 移位寄存器](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-072)
  - <span id="note-sec-073"></span>[5.14 计数器](computer-systems-lecture/chapter-05-sequential-logic.md#note-sec-073)
- <span id="note-sec-074"></span>[6. 指令集体系结构 ISA](computer-systems-lecture/chapter-06-isa.md#note-sec-074)
  - <span id="note-sec-075"></span>[6.1 ISA 是什么](computer-systems-lecture/chapter-06-isa.md#note-sec-075)
  - <span id="note-sec-076"></span>[6.2 指令的组成](computer-systems-lecture/chapter-06-isa.md#note-sec-076)
  - <span id="note-sec-077"></span>[6.3 指令格式设计因素](computer-systems-lecture/chapter-06-isa.md#note-sec-077)
  - <span id="note-sec-078"></span>[6.4 操作数个数](computer-systems-lecture/chapter-06-isa.md#note-sec-078)
  - <span id="note-sec-079"></span>[6.5 寻址方式](computer-systems-lecture/chapter-06-isa.md#note-sec-079)
  - <span id="note-sec-080"></span>[6.6 操作类型](computer-systems-lecture/chapter-06-isa.md#note-sec-080)
  - <span id="note-sec-081"></span>[6.7 编码方式：定长、变长、混合](computer-systems-lecture/chapter-06-isa.md#note-sec-081)
  - <span id="note-sec-082"></span>[6.8 CISC 与 RISC](computer-systems-lecture/chapter-06-isa.md#note-sec-082)
  - <span id="note-sec-083"></span>[6.9 ISA 分类](computer-systems-lecture/chapter-06-isa.md#note-sec-083)
- <span id="note-sec-084"></span>[7. RISC-V ISA、汇编与程序运行](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-084)
  - <span id="note-sec-085"></span>[7.1 RISC-V 概览](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-085)
  - <span id="note-sec-086"></span>[7.2 RISC-V 处理器状态](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-086)
  - <span id="note-sec-087"></span>[7.3 指令格式](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-087)
  - <span id="note-sec-088"></span>[7.4 基础整数指令](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-088)
  - <span id="note-sec-092"></span>[7.5 控制流](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-092)
  - <span id="note-sec-096"></span>[7.6 RISC-V 调用约定](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-096)
  - <span id="note-sec-097"></span>[7.7 栈帧与内存布局](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-097)
  - <span id="note-sec-098"></span>[7.8 特权模式](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-098)
  - <span id="note-sec-099"></span>[7.9 从 C 源码到运行程序](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-099)
  - <span id="note-sec-100"></span>[7.10 ELF 目标文件](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-100)
  - <span id="note-sec-101"></span>[7.11 链接器](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-101)
  - <span id="note-sec-102"></span>[7.12 静态链接与动态链接](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-102)
  - <span id="note-sec-103"></span>[7.13 装载器、PIC 与 Lazy Binding](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-103)
  - <span id="note-sec-104"></span>[7.14 程序真正入口：`_start` 与 `crt0`](computer-systems-lecture/chapter-07-riscv-programs.md#note-sec-104)
- <span id="note-sec-105"></span>[8. 快速查表](computer-systems-lecture/appendix-reference.md#note-sec-105)
  - <span id="note-sec-106"></span>[8.1 常用 2 的幂](computer-systems-lecture/appendix-reference.md#note-sec-106)
  - <span id="note-sec-107"></span>[8.2 n 位整数范围](computer-systems-lecture/appendix-reference.md#note-sec-107)
  - <span id="note-sec-108"></span>[8.3 补码常用结论](computer-systems-lecture/appendix-reference.md#note-sec-108)
  - <span id="note-sec-109"></span>[8.4 浮点特殊编码](computer-systems-lecture/appendix-reference.md#note-sec-109)
  - <span id="note-sec-110"></span>[8.5 常用布尔定理](computer-systems-lecture/appendix-reference.md#note-sec-110)
  - <span id="note-sec-111"></span>[8.6 常用 RISC-V 寄存器](computer-systems-lecture/appendix-reference.md#note-sec-111)
  - <span id="note-sec-112"></span>[8.7 RISC-V 指令格式速记](computer-systems-lecture/appendix-reference.md#note-sec-112)
- <span id="note-sec-113"></span>[9. 后续扩展区](computer-systems-lecture/appendix-reference.md#note-sec-113)
  - <span id="note-sec-114"></span>[9.1 后续新增资料的写入规则](computer-systems-lecture/appendix-reference.md#note-sec-114)
  - <span id="note-sec-115"></span>[9.2 建议预留章节](computer-systems-lecture/appendix-reference.md#note-sec-115)
  - <span id="note-sec-116"></span>[9.3 更新日志](computer-systems-lecture/appendix-reference.md#note-sec-116)
