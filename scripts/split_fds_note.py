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
SOURCE = ROOT / "note" / "FDS_数据结构基础讲义.md"
OVERVIEW = ROOT / "docs" / "zh" / "notes" / "fds-data-structures-lecture.md"
OUT_DIR = ROOT / "docs" / "zh" / "notes" / "fds-data-structures-lecture"

BASE_TAGS = ["data-structures", "algorithms", "course-note"]

CHAPTERS = {
    "0": {
        "slug": "chapter-00-course-view",
        "title": "0. 课程视角：为什么需要数据结构",
        "short": "课程视角",
        "summary": "数据组织方式、操作频率、规模增长和结构选择的基本问题。",
        "goal": "理解数据结构不是接口清单，而是用不变量和组织方式换取更好的时间/空间表现。",
        "prereq": "基础编程、数组、循环、函数和简单数学符号。",
        "time": "建议 1–2 小时：重点理解结构选择和复杂度压力。",
        "exercise": "找 3 个实际场景，说明为什么朴素存储会慢，以及可能换成什么结构。",
        "courseware": "FDS/DS00-2026.pdf",
    },
    "1": {
        "slug": "chapter-01-algorithm-analysis",
        "title": "1. 算法分析",
        "short": "算法分析",
        "summary": "算法与程序、分析对象、渐进记号、最大子列和、二分查找和复杂度检查。",
        "goal": "能判断算法成本来自哪里，并用渐进记号描述主要增长项。",
        "prereq": "基础 C/伪代码、循环、数组和简单函数增长。",
        "time": "建议 4–5 小时：渐进记号 2 小时，最大子列和 1–2 小时，二分查找 1 小时。",
        "exercise": "分析 4 段循环复杂度；比较最大子列和四种算法；手写二分查找并说明循环不变量。",
        "courseware": "FDS/DS01_Ch02_Algorithm Analysis(a)-2026.pdf, FDS/DS02_Ch02_Algorithm Analysis(b).ppt",
    },
    "2": {
        "slug": "chapter-02-lists",
        "title": "2. 抽象数据类型与线性表",
        "short": "线性表",
        "summary": "ADT、数组表、链表、双向循环链表、多项式 ADT、多重链表和游标实现。",
        "goal": "区分接口和实现，理解数组与链表在访问、插入、删除上的取舍。",
        "prereq": "结构体/指针或引用、数组和基础动态内存直觉。",
        "time": "建议 5–6 小时：ADT 1 小时，数组/链表 3 小时，多项式/游标 1–2 小时。",
        "exercise": "写出线性表 ADT；比较数组表和链表复杂度；手画一次链表插入和删除。",
        "courseware": "FDS/DS02_Ch03_List.ppt",
    },
    "3": {
        "slug": "chapter-03-stacks-queues",
        "title": "3. 栈与队列",
        "short": "栈与队列",
        "summary": "栈 ADT、括号匹配、表达式求值、中缀转后缀、系统栈、队列和循环队列。",
        "goal": "掌握 LIFO/FIFO 结构如何约束访问顺序，并能把表达式、递归、排队问题映射到栈或队列。",
        "prereq": "线性表、数组/链表实现和基础表达式求值。",
        "time": "建议 4–5 小时：栈应用 2–3 小时，队列与循环队列 1–2 小时。",
        "exercise": "实现括号匹配；手算后缀表达式求值；设计一个循环队列并解释判空/判满。",
        "courseware": "FDS/DS03_Ch03_Stack and Queue.ppt",
    },
    "4": {
        "slug": "chapter-04-trees",
        "title": "4. 树与二叉树",
        "short": "树",
        "summary": "树术语、树的表示、二叉树、表达式树、遍历、非递归遍历和线索二叉树。",
        "goal": "理解层次结构、递归定义和遍历顺序，并能把树结构转成存储表示。",
        "prereq": "递归、栈、链式结构和基本数学归纳直觉。",
        "time": "建议 5–6 小时：树/二叉树 2 小时，遍历 2–3 小时，线索二叉树 1 小时。",
        "exercise": "画三种遍历序列；用栈模拟非递归遍历；把一棵普通树转成孩子兄弟表示。",
        "courseware": "FDS/DS04_Ch04_Binary Trees.ppt",
    },
    "5": {
        "slug": "chapter-05-binary-search-trees",
        "title": "5. 二叉搜索树",
        "short": "BST",
        "summary": "二叉搜索树定义、查找、最值、插入、删除、懒惰删除和平均/退化情况。",
        "goal": "理解有序性如何支持查找，并掌握 BST 删除和退化风险。",
        "prereq": "二叉树、递归和比较大小的有序集合。",
        "time": "建议 3–4 小时：查找/插入 1 小时，删除 1–2 小时，复杂度讨论 1 小时。",
        "exercise": "手插一组键形成 BST；删除叶子/单子树/双子树节点；解释为什么可能退化为链表。",
        "courseware": "FDS/DS05_Ch04_Search Tree.pdf",
    },
    "6": {
        "slug": "chapter-06-heaps",
        "title": "6. 优先队列与二叉堆",
        "short": "堆",
        "summary": "优先队列 ADT、实现对比、堆序性、插入、删除最小值、建堆、应用和 d-堆。",
        "goal": "理解堆用近似完全二叉树支持高效优先级操作，并掌握上滤/下滤。",
        "prereq": "数组、二叉树层序编号和复杂度分析。",
        "time": "建议 4–5 小时：堆性质 1 小时，上滤/下滤 2 小时，建堆与应用 1–2 小时。",
        "exercise": "手算一组插入和 DeleteMin；比较 BuildHeap 与连续 Insert；说明 d-堆取舍。",
        "courseware": "FDS/DS06_Ch05_Priority Queues.ppt",
    },
    "7": {
        "slug": "chapter-07-union-find",
        "title": "7. 并查集",
        "short": "并查集",
        "summary": "等价关系、动态等价问题、基本表示、按大小/高度合并、路径压缩和典型应用。",
        "goal": "掌握动态连通性问题的代表元思想，并理解路径压缩为何接近常数均摊。",
        "prereq": "树、数组、等价关系和基本复杂度分析。",
        "time": "建议 3–4 小时：基本表示 1 小时，合并策略 1 小时，路径压缩与应用 1–2 小时。",
        "exercise": "手算一串 Union/Find；比较未优化与路径压缩后的树高；写出连通性应用。",
        "courseware": "FDS/DS07_Ch08_Union and Find.ppt",
    },
    "8": {
        "slug": "chapter-08-segment-trees",
        "title": "8. 线段树",
        "short": "线段树",
        "summary": "区间结构动机、适用算子、建树、区间查询、点更新、区间更新和懒标记。",
        "goal": "理解线段树如何把区间问题拆成少量节点，并掌握懒标记的边界。",
        "prereq": "递归、数组树表示、二分区间和常见聚合算子。",
        "time": "建议 5–6 小时：建树/查询 2 小时，点更新 1 小时，区间更新与懒标记 2–3 小时。",
        "exercise": "手建一棵线段树；执行一次区间查询和点更新；解释懒标记何时下传。",
        "courseware": "FDS/DS07_Segment Tree.pdf",
    },
    "9": {
        "slug": "chapter-09-graphs-toposort",
        "title": "9. 图与拓扑排序",
        "short": "图",
        "summary": "图定义、图存储、AOV 网络、拓扑序、朴素拓扑排序和队列优化拓扑排序。",
        "goal": "掌握图的基本表示，并能用入度维护拓扑排序过程。",
        "prereq": "队列、集合、数组/链表存储和复杂度分析。",
        "time": "建议 4–5 小时：图定义/存储 1–2 小时，AOV/拓扑排序 2–3 小时。",
        "exercise": "为一个有向图写邻接表；手算拓扑序；判断一个依赖图是否有环。",
        "courseware": "FDS/DS08_Ch09_Graph Definition_Topological Sort.ppt",
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
course: FDS 数据结构基础
category: algorithms
recommended: {'true' if recommended else 'false'}
updated: 2026-07-18
reading_order: {reading_order}
tags:
{tag_lines}
---

"""


def normalized_source_body() -> str:
    raw = SOURCE.read_text(encoding="utf-8")
    body = strip_original_h1(raw)
    body = remove_manual_toc(body)
    body = replace_missing_images(body)
    body = normalize_math_code_spans(body)
    return normalize_headings_for_sidebar(body, max_depth=4).strip()


def split_major_sections(body: str) -> tuple[str, list[dict[str, str]]]:
    pattern = re.compile(r"^## ([0-9]+)\.\s+(.+?)\s*\{\s*#(note-sec-\d+)\s*\}\s*$", re.M)
    matches = list(pattern.finditer(body))
    if not matches:
        raise SystemExit("No major sections found in normalized FDS note.")
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
    本页从《FDS 数据结构基础讲义》拆分而来，保留原章节锚点，方便从旧总览页和旧链接跳转。

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
- 课程来源：根据 `FDS/` 目录下的课件整理；本章对应课件：`{config['courseware']}`。
- 原始讲义文件：`note/FDS_数据结构基础讲义.md`。
- 引用边界：这是公开学习笔记，不替代课程正式教材、教师课件或考试要求；外部引用时请注明来自本网站整理版。

"""


def to_chapter_page(section: dict[str, str], config: dict[str, str], reading_order: int) -> str:
    heading, body = promote_first_heading(section["text"])
    return (
        frontmatter(config["title"], config["summary"], reading_order=reading_order, extra_tags=["chapter"])
        + heading
        + "\n\n"
        + chapter_intro(config)
        + body
        + "\n"
    )


def clean_appendix_body(text: str) -> str:
    text = text.replace("## 12. 增量补充区", "## 12. 后续扩展区")
    text = text.replace("### 待补充登记表", "### 后续扩展登记表")
    text = text.replace("| 待新增 | 待填写 | 待整理 | 待填写 |", "| 暂无新增文件 | 暂无新主题 | 未触发 | 后续确认 |")
    text = text.replace("### 新章节模板", "### 新主题记录格式")
    return text


def to_appendix_page(sections: list[dict[str, str]]) -> str:
    body = clean_appendix_body("\n\n".join(section["text"] for section in sections))
    heading, body = promote_first_heading(body)
    return (
        frontmatter(
            "FDS 数据结构基础讲义附录",
            "FDS 数据结构基础讲义的复杂度速查、结构选择模板和后续扩展记录。",
            reading_order=390,
            extra_tags=["appendix"],
        )
        + heading
        + "\n\n"
        + """!!! info "附录导引"
    本页保留原讲义复杂度速查、结构选择模板和维护区锚点，集中放置复习辅助内容与后续扩展边界。

## 参考资料与引用边界

- 整理者：Lumner。
- 课程来源：根据 `FDS/` 目录下现有数据结构课件整理。
- 原始讲义文件：`note/FDS_数据结构基础讲义.md`。
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
        url = f"fds-data-structures-lecture/{slug}.md"
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
    chapter_links.append(f"- [附录：复杂度速查与结构选择]( {page_url('appendix-reference')} )：复杂度表、选结构模板、后续扩展记录。".replace("( ", "(").replace(" )", ")"))

    anchor_rows = []
    for level, title, anchor in all_headings(clean_appendix_body(body)):
        target = anchor_targets.get(anchor, "#reading-guide")
        title = title.replace("增量补充区", "后续扩展区").replace("待补充登记表", "后续扩展登记表").replace("新章节模板", "新主题记录格式")
        indent = "  " if level == "###" else ""
        anchor_rows.append(f'{indent}- <span id="{anchor}"></span>[{title}]({target})')

    return (
        frontmatter(
            "FDS 数据结构基础讲义",
            "FDS 数据结构基础中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。",
            reading_order=30,
            recommended=True,
        )
        + f"""# FDS 数据结构基础讲义

!!! info "拆分状态"
    这页保留原来的 `/zh/notes/fds-data-structures-lecture/` 地址，作为 FDS 数据结构基础讲义总览和旧链接兼容层。章节正文已经拆分到稳定子路径；如果旧链接带有 `#note-sec-...` 锚点，可在本页的“旧锚点跳转表”找到对应新位置。

## 阅读导引 {{ #reading-guide }}

这门课的主线是：用合适的数据组织方式，让算法能在可接受的时间和空间内完成任务。阅读时不要只背接口名称，而要追问结构维护了什么不变量、操作如何保持不变量、复杂度来自哪里。

## 课程目标

- 掌握算法分析、ADT、线性结构、树、堆、并查集、线段树和图的核心结构。
- 能根据操作频率和不变量选择合适的数据结构。
- 能解释关键操作的时间复杂度和常见边界错误。

## 前置知识

- 基础 C/伪代码、数组、指针或引用、递归和简单数学符号。
- 能阅读 \\(O(N)\\)、\\(O(\\log N)\\)、\\(O(N\\log N)\\) 等复杂度记号。

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
        target.write_text(to_chapter_page(section, config, 300 + index), encoding="utf-8")
        print(f"Wrote {target.relative_to(ROOT)}")

    appendix_target = OUT_DIR / "appendix-reference.md"
    appendix_target.write_text(to_appendix_page(appendix_sections), encoding="utf-8")
    print(f"Wrote {appendix_target.relative_to(ROOT)}")

    OVERVIEW.write_text(overview_page(body, preface, chapter_sections, appendix_sections), encoding="utf-8")
    print(f"Wrote {OVERVIEW.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
