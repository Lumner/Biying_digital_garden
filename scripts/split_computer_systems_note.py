from __future__ import annotations

import re
from pathlib import Path

from import_course_notes import (
    normalize_headings_for_sidebar,
    normalize_math_code_spans,
    remove_manual_toc,
    replace_missing_images,
    strip_original_h1,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "note" / "SYS_计算机系统基础讲义.md"
OVERVIEW = ROOT / "docs" / "zh" / "notes" / "computer-systems-lecture.md"
OUT_DIR = ROOT / "docs" / "zh" / "notes" / "computer-systems-lecture"

BASE_TAGS = ["computer-systems", "risc-v", "course-note"]

CHAPTERS = {
    "0": {
        "slug": "chapter-00-system-view",
        "title": "0. 课程视角：从门电路到系统软件",
        "short": "系统视角",
        "summary": "从物理信号、逻辑门、RTL、ISA 到程序运行的整体抽象链路。",
        "goal": "建立从硬件到软件的层次化视角，知道本课程每一部分在系统链路中的位置。",
        "prereq": "能理解二进制、程序、硬件和操作系统这些基本概念即可。",
        "time": "建议 1–2 小时：重点看抽象层次和课程主线图。",
        "exercise": "用自己的话画一遍从物理信号到运行程序的链路，并标出最容易混淆的两个接口。",
        "courseware": "SYS/Lec00_Introduction.pptx",
    },
    "1": {
        "slug": "chapter-01-information-representation",
        "title": "1. 信息表示",
        "short": "信息表示",
        "summary": "二进制、进制转换、整数、补码、浮点数、字符和数据宽度。",
        "goal": "理解同一串比特如何因解释方式不同而表示不同数据，并能处理整数/浮点常见边界。",
        "prereq": "基础代数、二进制直觉，以及能阅读简单程序变量。",
        "time": "建议 5–7 小时：整数 2 小时，补码 1–2 小时，浮点 2–3 小时。",
        "exercise": "完成 5 个进制转换、3 个补码求值、2 个浮点特殊值判断，并解释大小端差异。",
        "courseware": "SYS/Lec01-Information Representation.pptx",
    },
    "2": {
        "slug": "chapter-02-boolean-logic",
        "title": "2. 布尔代数与数字逻辑基础",
        "short": "布尔逻辑",
        "summary": "逻辑变量、基本门、布尔代数、标准形式、Karnaugh Map 和多级优化。",
        "goal": "能把逻辑需求写成布尔函数，并用代数或 K-map 做基本化简。",
        "prereq": "命题逻辑、集合/代数基础，以及对 0/1 二值抽象的理解。",
        "time": "建议 5–6 小时：门电路 1 小时，布尔代数 2 小时，K-map 与优化 2–3 小时。",
        "exercise": "化简 3 个布尔函数；分别写出 SOP/POS；用 Bubble Pushing 改写一个多级电路。",
        "courseware": "SYS/Lec02_Boolean Algebra.pptx",
    },
    "3": {
        "slug": "chapter-03-combinational-logic",
        "title": "3. 组合逻辑设计与 Verilog HDL",
        "short": "组合逻辑",
        "summary": "HDL 设计流、Verilog 基础、组合逻辑设计、常用功能块和时序分析。",
        "goal": "能从规格说明出发写出组合逻辑表达或 Verilog 描述，并理解 decoder、encoder、MUX 等模块。",
        "prereq": "第 2 章布尔代数、基础编程语法和二进制编码。",
        "time": "建议 6–8 小时：Verilog 基础 2–3 小时，组合模块 2–3 小时，延迟/毛刺 1–2 小时。",
        "exercise": "写一个 3 开关控制灯的表达式；用 MUX 实现一个小真值表；检查一个组合逻辑是否遗漏赋值。",
        "courseware": "SYS/Lec03_Combinational Logic.pptx",
    },
    "4": {
        "slug": "chapter-04-arithmetic-alu",
        "title": "4. 运算部件与 ALU",
        "short": "运算部件",
        "summary": "加减乘除、进位加法器、溢出、移位器、Booth 算法、浮点运算和 ALU。",
        "goal": "理解算术运算如何由组合逻辑构成，并能解释 ALU 中常见操作和溢出判断。",
        "prereq": "第 1 章整数/浮点表示，第 2–3 章逻辑函数与组合模块。",
        "time": "建议 6–8 小时：加减法 2 小时，乘除/Booth 2–3 小时，浮点与 ALU 2–3 小时。",
        "exercise": "画 1 位全加器真值表；解释有符号溢出；手算一个 Booth 编码示例。",
        "courseware": "SYS/Lec04_Arithmetic Unit.pptx",
    },
    "5": {
        "slug": "chapter-05-sequential-logic",
        "title": "5. 时序逻辑设计",
        "short": "时序逻辑",
        "summary": "锁存器、触发器、时序参数、FSM、寄存器、总线、移位寄存器和计数器。",
        "goal": "理解带状态电路如何存储历史，并能把简单需求建模成 FSM 或寄存器传输。",
        "prereq": "组合逻辑、基本时钟概念和有限状态机直觉。",
        "time": "建议 6–8 小时：存储元件 2 小时，FSM 2–3 小时，寄存器/计数器 2–3 小时。",
        "exercise": "设计一个小序列检测器；列出状态转移表；解释 setup/hold 违例的后果。",
        "courseware": "SYS/Lec05_Sequential Logic.pptx",
    },
    "6": {
        "slug": "chapter-06-isa",
        "title": "6. 指令集体系结构 ISA",
        "short": "ISA",
        "summary": "ISA 概念、指令组成、寻址方式、编码方式、CISC/RISC 和 ISA 分类。",
        "goal": "理解 ISA 是软硬件契约，能分析指令格式设计和操作数/寻址方式的取舍。",
        "prereq": "二进制编码、寄存器/ALU 基础，以及对程序执行流程的基本理解。",
        "time": "建议 3–5 小时：ISA 概念 1 小时，格式/寻址 2 小时，CISC/RISC 比较 1–2 小时。",
        "exercise": "比较 0/1/2/3 地址指令；为一个简单操作设计指令字段；解释定长编码的优缺点。",
        "courseware": "SYS/Lec06-1_ISA.pptx",
    },
    "7": {
        "slug": "chapter-07-riscv-programs",
        "title": "7. RISC-V ISA、汇编与程序运行",
        "short": "RISC-V",
        "summary": "RISC-V 状态、指令格式、基础整数指令、控制流、调用约定、ELF、链接和装载。",
        "goal": "把 ISA、汇编、调用约定、目标文件和装载过程连成程序运行链路。",
        "prereq": "第 6 章 ISA、基础 C/汇编概念、栈和函数调用直觉。",
        "time": "建议 7–10 小时：指令与控制流 3 小时，调用约定/栈 2 小时，ELF/链接/装载 2–5 小时。",
        "exercise": "手写一段简单 RISC-V 函数调用；标出栈帧内容；解释静态链接和动态链接差异。",
        "courseware": "SYS/Lec06-2_RISCV.pptx",
    },
}


def frontmatter(
    title: str,
    summary: str,
    *,
    reading_order: int,
    recommended: bool = False,
    extra_tags: list[str] | None = None,
) -> str:
    tags = BASE_TAGS + (extra_tags or [])
    tag_lines = "\n".join(f"  - {tag}" for tag in tags)
    return f"""---
title: {title}
summary: {summary}
public: true
avatar_readable: true
author: Lumner
course: 计算机系统基础
category: systems
recommended: {'true' if recommended else 'false'}
updated: 2026-07-18
reading_order: {reading_order}
tags:
{tag_lines}
---

"""


def fill_image_notes(text: str) -> str:
    pattern = re.compile(
        r'!!! note "图像资源待补充：(.+?)"\n'
        r"    原始讲义引用了 `(.+?)`，但当前 `note/` 目录没有随附图片资源。后续补充图片后可恢复为 Markdown 图片。",
        re.M,
    )

    def repl(match: re.Match[str]) -> str:
        alt = match.group(1)
        path = match.group(2)
        return (
            f'!!! note "图像说明：{alt}"\n'
            f"    原课件包含 `{path}`。公开仓库当前不附带这张图片；本节保留文字化说明，阅读时可把它理解为“{alt}”的结构示意。"
        )

    return pattern.sub(repl, text)


def normalized_source_body() -> str:
    raw = SOURCE.read_text(encoding="utf-8")
    body = strip_original_h1(raw)
    body = remove_manual_toc(body)
    body = replace_missing_images(body)
    body = normalize_math_code_spans(body)
    body = normalize_headings_for_sidebar(body, max_depth=4)
    return fill_image_notes(body).strip()


def split_major_sections(body: str) -> tuple[str, list[dict[str, str]]]:
    pattern = re.compile(r"^## ([0-9]+)\.\s+(.+?)\s*\{\s*#(note-sec-\d+)\s*\}\s*$", re.M)
    matches = list(pattern.finditer(body))
    if not matches:
        raise SystemExit("No major sections found in normalized computer systems note.")
    preface = body[: matches[0].start()].strip()
    sections: list[dict[str, str]] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        sections.append(
            {
                "number": match.group(1),
                "title": f"{match.group(1)}. {match.group(2).strip()}",
                "anchor": match.group(3),
                "text": body[match.start() : end].strip(),
            }
        )
    return preface, sections


def all_headings(text: str) -> list[tuple[str, str, str]]:
    pattern = re.compile(r"^(#{2,3})\s+(.+?)\s*\{\s*#(note-sec-\d+)\s*\}\s*$", re.M)
    return [(match.group(1), match.group(2).strip(), match.group(3)) for match in pattern.finditer(text)]


def promote_first_heading(text: str) -> tuple[str, str]:
    lines = text.splitlines()
    if not lines or not lines[0].startswith("## "):
        raise ValueError("Expected a level-2 heading at the start of a major section.")
    heading = re.sub(r"^##\s+", "# ", lines[0], count=1)
    rest = "\n".join(lines[1:]).lstrip()
    return heading, rest


def chapter_intro(config: dict[str, str]) -> str:
    return f"""!!! info "章节导引"
    本页从《计算机系统基础讲义》拆分而来，保留原章节锚点，方便从旧总览页和旧链接跳转。

## 学习目标

{config['goal']}

## 前置知识

{config['prereq']}

## 建议用时

{config['time']}

## 练习建议

{config['exercise']}

## 参考资料与引用边界

- 整理者：Lumner。
- 课程来源：根据 `SYS/` 目录下的课件整理；本章对应课件：`{config['courseware']}`。
- 原始讲义文件：`note/SYS_计算机系统基础讲义.md`。
- 引用边界：这是公开学习笔记，不替代课程正式教材、教师课件或考试要求；外部引用时请注明来自本网站整理版。

"""


def to_chapter_page(section: dict[str, str], config: dict[str, str], reading_order: int) -> str:
    heading, body = promote_first_heading(section["text"])
    return (
        frontmatter(
            config["title"],
            config["summary"],
            reading_order=reading_order,
            extra_tags=["chapter"],
        )
        + heading
        + "\n\n"
        + chapter_intro(config)
        + body
        + "\n"
    )


def to_appendix_page(sections: list[dict[str, str]]) -> str:
    body = "\n\n".join(section["text"] for section in sections)
    heading, body = promote_first_heading(body)
    body = body.replace("## 9. 增量补充区", "## 9. 后续扩展区")
    return (
        frontmatter(
            "计算机系统基础讲义附录",
            "计算机系统基础讲义的速查表、更新规则和后续扩展记录。",
            reading_order=290,
            extra_tags=["appendix"],
        )
        + heading
        + "\n\n"
        + """!!! info "附录导引"
    本页保留原讲义速查表与维护区锚点，集中放置常用结论、寄存器速记和后续扩展边界。

## 参考资料与引用边界

- 整理者：Lumner。
- 课程来源：根据 `SYS/` 目录下现有计算机系统基础课件整理。
- 原始讲义文件：`note/SYS_计算机系统基础讲义.md`。
- 引用边界：附录用于辅助复习，不替代课程正式教材、教师课件或考试要求。

"""
        + body
        + "\n"
    )


def overview_page(
    body: str,
    preface: str,
    chapters: list[tuple[dict[str, str], dict[str, str]]],
    appendix_sections: list[dict[str, str]],
) -> str:
    def page_url(slug: str, anchor: str | None = None) -> str:
        url = f"computer-systems-lecture/{slug}.md"
        if anchor:
            url += f"#{anchor}"
        return url

    anchor_targets: dict[str, str] = {}
    for section, config in chapters:
        for _, _, anchor in all_headings(section["text"]):
            anchor_targets[anchor] = page_url(config["slug"], anchor)
    for _, _, anchor in all_headings(preface):
        anchor_targets[anchor] = "#reading-guide"
    for section in appendix_sections:
        for _, _, anchor in all_headings(section["text"]):
            anchor_targets[anchor] = page_url("appendix-reference", anchor)

    chapter_links = []
    table_rows = []
    for section, config in chapters:
        chapter_links.append(f"- [{config['title']}]({page_url(config['slug'])})：{config['summary']}（{config['time'].split('：', 1)[0]}）")
        table_rows.append(f"| [{config['title']}]({page_url(config['slug'])}) | {config['summary']} | `{config['courseware']}` |")
    chapter_links.append(f"- [附录：速查表与后续扩展]({page_url('appendix-reference')})：常用结论、寄存器速记、更新规则和后续扩展边界。")

    anchor_rows = []
    for level, title, anchor in all_headings(body):
        target = anchor_targets.get(anchor, "#reading-guide")
        title = title.replace("增量补充区", "后续扩展区")
        indent = "  " if level == "###" else ""
        anchor_rows.append(f'{indent}- <span id="{anchor}"></span>[{title}]({target})')

    return (
        frontmatter(
            "计算机系统基础讲义",
            "计算机系统基础中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。",
            reading_order=20,
            recommended=True,
        )
        + f"""# 计算机系统基础讲义

!!! info "拆分状态"
    这页保留原来的 `/zh/notes/computer-systems-lecture/` 地址，作为计算机系统基础讲义总览和旧链接兼容层。章节正文已经拆分到稳定子路径；如果旧链接带有 `#note-sec-...` 锚点，可在本页的“旧锚点跳转表”找到对应新位置。

## 阅读导引 {{ #reading-guide }}

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

{chr(10).join(chapter_links)}

## 章节与课件对应表

| 章节 | 覆盖内容 | 对应课件 |
| --- | --- | --- |
{chr(10).join(table_rows)}

## 旧锚点跳转表

下面的条目用于兼容旧版长页面的 `#note-sec-...` 锚点。锚点本身保留在本页；点击条目会进入新的章节子页面或附录页。

{chr(10).join(anchor_rows)}
"""
    )


def main() -> None:
    body = normalized_source_body()
    preface, sections = split_major_sections(body)

    chapter_sections: list[tuple[dict[str, str], dict[str, str]]] = []
    appendix_sections: list[dict[str, str]] = []
    for section in sections:
        config = CHAPTERS.get(section["number"])
        if config:
            chapter_sections.append((section, config))
        else:
            appendix_sections.append(section)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for index, (section, config) in enumerate(chapter_sections, start=1):
        target = OUT_DIR / f"{config['slug']}.md"
        target.write_text(to_chapter_page(section, config, 200 + index), encoding="utf-8")
        print(f"Wrote {target.relative_to(ROOT)}")

    appendix_target = OUT_DIR / "appendix-reference.md"
    appendix_target.write_text(to_appendix_page(appendix_sections), encoding="utf-8")
    print(f"Wrote {appendix_target.relative_to(ROOT)}")

    OVERVIEW.write_text(overview_page(body, preface, chapter_sections, appendix_sections), encoding="utf-8")
    print(f"Wrote {OVERVIEW.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
