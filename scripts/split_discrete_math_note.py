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
SOURCE = ROOT / "note" / "离散数学讲义.md"
OVERVIEW = ROOT / "docs" / "zh" / "notes" / "discrete-math-lecture.md"
OUT_DIR = ROOT / "docs" / "zh" / "notes" / "discrete-math-lecture"

BASE_TAGS = ["math", "discrete-math", "course-note"]

CHAPTERS = {
    "第 1 章": {
        "slug": "chapter-01-logic-proofs",
        "short": "逻辑与证明",
        "summary": "命题逻辑、谓词逻辑、推理规则和证明策略。",
        "goal": "建立离散数学的形式语言，能把自然语言、系统规格和基础证明转成可检查的逻辑结构。",
        "prereq": "高中集合语言、基础代数表达，以及能区分定义、命题和推理步骤。",
        "time": "建议 4–6 小时：命题逻辑 2 小时，谓词与量词 2 小时，证明方法 1–2 小时。",
        "exercise": "用真值表验证 3 个等价式；把 5 句自然语言翻译成谓词逻辑；各写 1 个直接证明、逆否证明和反证法。",
        "courseware": "DM1.1(8).pdf, DM1.2-1.3(5).pdf, DM1.4(6).pdf, DM1.5(5).pdf, DM1.6(6).pdf, DM1.7-1.8(6).pdf",
    },
    "第 2 章": {
        "slug": "chapter-02-basic-structures",
        "short": "基本结构",
        "summary": "集合、函数、序列、基数和矩阵的基础语言。",
        "goal": "掌握集合与函数的基本定义，把序列、递推、基数和矩阵视为后续算法与关系内容的共同工具。",
        "prereq": "第 1 章的逻辑表达、基本代数运算和对函数符号的熟悉度。",
        "time": "建议 5–7 小时：集合 2 小时，函数 2 小时，序列/基数/矩阵 1–3 小时。",
        "exercise": "证明 2 个集合恒等式；判断 5 个函数是否为单射/满射/双射；写出 2 个递推关系的前几项。",
        "courseware": "DM2.1.pdf, DM2.2.pdf, DM2.3.pdf, DM2.4.pdf, DM2.5-2.6(5).pdf",
    },
    "第 3 章": {
        "slug": "chapter-03-algorithms",
        "short": "算法",
        "summary": "算法定义、伪代码、搜索排序和函数增长。",
        "goal": "把问题描述成算法步骤，并能用渐近记号比较算法规模增长。",
        "prereq": "第 2 章的函数和序列，基础程序流程，以及对循环/递归的直观理解。",
        "time": "建议 3–4 小时：算法表达 1 小时，搜索排序 1 小时，复杂度比较 1–2 小时。",
        "exercise": "为搜索或排序写一段伪代码；估算 3 段循环的 Big-O；比较两组函数增长顺序。",
        "courseware": "DM3.1-3.3(4).pdf",
    },
    "第 5 章": {
        "slug": "chapter-05-induction-recursion",
        "short": "归纳与递归",
        "summary": "数学归纳法、强归纳、递归定义和递归算法。",
        "goal": "能用归纳证明处理整数命题、递归结构和递归算法正确性。",
        "prereq": "第 1 章证明方法、第 2 章序列与递推，以及基本函数/算法语言。",
        "time": "建议 4–6 小时：普通归纳 2 小时，强归纳 1–2 小时，递归结构与算法 1–2 小时。",
        "exercise": "完成 2 个数学归纳证明；用强归纳证明一个分解类命题；为一个递归定义写出前几项。",
        "courseware": "DM5.1-5.4(7).pdf",
    },
    "第 6 章": {
        "slug": "chapter-06-counting",
        "short": "计数",
        "summary": "加法/乘法原则、排列组合、二项式系数和广义排列组合。",
        "goal": "识别计数问题的对象、限制和是否允许重复，选择合适的排列组合模型。",
        "prereq": "集合运算、函数概念、基础代数展开，以及能按条件拆分问题。",
        "time": "建议 5–7 小时：基本原则 1 小时，排列组合 2–3 小时，二项式与广义模型 2–3 小时。",
        "exercise": "各做 3 道加法/乘法原则、排列、组合题；解释每题为什么允许或不允许重复。",
        "courseware": "DM6.1(3).pdf, DM6.2(3).pdf, DM6.3-6.4(6).pdf, DM6.5(3).pdf",
    },
    "第 8 章": {
        "slug": "chapter-08-advanced-counting",
        "short": "高级计数",
        "summary": "递推关系、分治递推、生成函数、容斥和错排。",
        "goal": "能在直接计数困难时，转向递推、生成函数或容斥模型。",
        "prereq": "第 3 章函数增长、第 5 章递归、第 6 章排列组合与二项式系数。",
        "time": "建议 6–8 小时：递推 2 小时，分治递推 1–2 小时，生成函数 2 小时，容斥/错排 1–2 小时。",
        "exercise": "解 2 个线性递推；用生成函数解释一个组合模型；用容斥解决一个带禁位的计数题。",
        "courseware": "DM8.1-8.2(6).pdf, DM8.3.pdf, DM8.4(6).pdf, DM8.5-8.6(9).pdf",
    },
    "第 9 章": {
        "slug": "chapter-09-relations",
        "short": "关系",
        "summary": "关系定义、性质、矩阵/有向图表示、闭包和等价关系。",
        "goal": "把二元关系看作集合、矩阵和图之间可以互相转换的结构，并掌握闭包与等价类。",
        "prereq": "第 2 章集合与矩阵，第 3 章算法思想，以及第 1 章的证明语言。",
        "time": "建议 5–6 小时：关系性质 2 小时，表示与运算 1–2 小时，闭包与等价关系 2 小时。",
        "exercise": "判断 5 个关系是否自反/对称/传递；画 2 个关系的有向图；求一个小关系的传递闭包。",
        "courseware": "DM9.1-9.3(8).pdf, DM9.4(6).pdf, DM9.5(3).pdf",
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
course: 离散数学
category: math
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
    pattern = re.compile(
        r"^## (第\s+\d+\s+章.+?|附录\s+[A-D]：.+?)\s*\{\s*#(note-sec-\d+)\s*\}\s*$",
        re.M,
    )
    matches = list(pattern.finditer(body))
    if not matches:
        raise SystemExit("No major sections found in normalized discrete math note.")

    preface = body[: matches[0].start()].strip()
    sections: list[dict[str, str]] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        sections.append(
            {
                "title": match.group(1).strip(),
                "anchor": match.group(2),
                "text": body[match.start() : end].strip(),
            }
        )
    return preface, sections


def section_key(title: str) -> str | None:
    match = re.match(r"第\s+(\d+)\s+章", title)
    if not match:
        return None
    return f"第 {int(match.group(1))} 章"


def all_headings(text: str) -> list[tuple[str, str, str]]:
    pattern = re.compile(r"^(#{2,3})\s+(.+?)\s*\{\s*#(note-sec-\d+)\s*\}\s*$", re.M)
    return [(match.group(1), match.group(2).strip(), match.group(3)) for match in pattern.finditer(text)]


def chapter_intro(config: dict[str, str]) -> str:
    return f"""!!! info "章节导引"
    本页从《离散数学讲义》拆分而来，保留原章节锚点，方便从旧总览页和旧链接跳转。

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
- 课程来源：根据 `DM/` 目录下的课件整理；本章对应课件：`{config['courseware']}`。
- 原始讲义文件：`note/离散数学讲义.md`。
- 引用边界：这是公开学习笔记，不替代课程正式教材、教师课件或考试要求；外部引用时请注明来自本网站整理版。

"""


def promote_first_heading(text: str) -> tuple[str, str]:
    lines = text.splitlines()
    if not lines or not lines[0].startswith("## "):
        raise ValueError("Expected a level-2 heading at the start of a major section.")
    heading = re.sub(r"^##\s+", "# ", lines[0], count=1)
    rest = "\n".join(lines[1:]).lstrip()
    return heading, rest


def to_chapter_page(section: dict[str, str], config: dict[str, str], reading_order: int) -> str:
    heading, body = promote_first_heading(section["text"])
    body = body.replace("本章小结与补充位", "本章小结与后续扩展")
    return (
        frontmatter(
            section["title"],
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
    body = body.replace("## 附录 D：待补充清单 { #note-sec-289 }", "## 附录 D：后续扩展清单 { #note-sec-289 }")
    body = body.replace("补充位", "后续扩展")
    return (
        frontmatter(
            "离散数学讲义附录",
            "离散数学讲义的符号表、证明模板和后续扩展记录。",
            reading_order=190,
            extra_tags=["appendix"],
        )
        + heading
        + "\n\n"
        + """!!! info "附录导引"
    本页保留原讲义附录锚点，集中放置符号、证明模板、更新记录和后续扩展边界。

## 参考资料与引用边界

- 整理者：Lumner。
- 课程来源：根据 `DM/` 目录下现有离散数学课件整理。
- 原始讲义文件：`note/离散数学讲义.md`。
- 引用边界：附录用于辅助复习，不替代课程正式教材、教师课件或考试要求。

"""
        + body
        + "\n"
    )


def overview_page(
    body: str,
    preface: str,
    real_sections: list[tuple[dict[str, str], dict[str, str]]],
    skipped_sections: list[dict[str, str]],
) -> str:
    def page_url(slug: str, anchor: str | None = None) -> str:
        url = f"discrete-math-lecture/{slug}.md"
        if anchor:
            url += f"#{anchor}"
        return url

    anchor_targets: dict[str, str] = {}
    for section, config in real_sections:
        for _, _, anchor in all_headings(section["text"]):
            anchor_targets[anchor] = page_url(config["slug"], anchor)
    for _, _, anchor in all_headings(preface):
        anchor_targets[anchor] = "#reading-guide"
    for section in skipped_sections:
        for _, _, anchor in all_headings(section["text"]):
            anchor_targets[anchor] = "#courseware-status"

    appendix_anchors = [anchor for _, _, anchor in all_headings(body) if int(anchor.removeprefix("note-sec-")) >= 279]
    for anchor in appendix_anchors:
        anchor_targets[anchor] = page_url("appendix-reference", anchor)

    chapter_links = []
    table_rows = []
    for section, config in real_sections:
        chapter_links.append(f"- [{section['title']}]({page_url(config['slug'])})：{config['summary']}（{config['time'].split('：', 1)[0]}）")
        table_rows.append(f"| [{section['title']}]({page_url(config['slug'])}) | {config['summary']} | `{config['courseware']}` |")

    chapter_links.append(f"- [附录：符号与证明模板]({page_url('appendix-reference')})：常用符号、证明模板、更新记录和后续扩展边界。")

    skipped_rows = []
    for section in skipped_sections:
        title = section["title"].replace("待补充章节", "资料未提供章节")
        skipped_rows.append(f"| {title} | 当前仓库没有对应课件，因此不生成空章节页；后续拿到资料后再补独立页面。 |")

    anchor_rows = []
    for level, title, anchor in all_headings(body):
        target = anchor_targets.get(anchor, "#reading-guide")
        if target == "#courseware-status":
            title = title.replace("待补充章节", "资料未提供章节")
        indent = "  " if level == "###" else ""
        anchor_rows.append(f'{indent}- <span id="{anchor}"></span>[{title}]({target})')

    return (
        frontmatter(
            "离散数学讲义",
            "离散数学中文讲义总览；正文已按章节拆分，并保留旧 URL 与旧锚点跳转入口。",
            reading_order=10,
            recommended=True,
        )
        + f"""# 离散数学讲义

!!! info "拆分状态"
    这页保留原来的 `/zh/notes/discrete-math-lecture/` 地址，作为离散数学讲义总览和旧链接兼容层。章节正文已经拆分到稳定子路径；如果旧链接带有 `#note-sec-...` 锚点，可在本页的“旧锚点跳转表”找到对应新位置。

## 阅读导引 {{ #reading-guide }}

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
- 能阅读 Markdown 数学公式，例如 `$p \\to q$`、`$\\forall x P(x)$`、`$O(n\\log n)$`。

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

{chr(10).join(chapter_links)}

## 章节与课件对应表

| 章节 | 覆盖内容 | 对应课件 |
| --- | --- | --- |
{chr(10).join(table_rows)}

## 资料状态说明 {{ #courseware-status }}

| 章节 | 当前处理 |
| --- | --- |
{chr(10).join(skipped_rows)}

## 旧锚点跳转表

下面的条目用于兼容旧版长页面的 `#note-sec-...` 锚点。锚点本身保留在本页；点击条目会进入新的章节子页面或资料状态说明。

{chr(10).join(anchor_rows)}
"""
    )


def main() -> None:
    body = normalized_source_body()
    preface, sections = split_major_sections(body)

    real_sections: list[tuple[dict[str, str], dict[str, str]]] = []
    skipped_sections: list[dict[str, str]] = []
    appendix_sections: list[dict[str, str]] = []

    for section in sections:
        if section["title"].startswith("附录"):
            appendix_sections.append(section)
            continue
        key = section_key(section["title"])
        if key and key in CHAPTERS:
            real_sections.append((section, CHAPTERS[key]))
        else:
            skipped_sections.append(section)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for index, (section, config) in enumerate(real_sections, start=1):
        target = OUT_DIR / f"{config['slug']}.md"
        target.write_text(to_chapter_page(section, config, 100 + index), encoding="utf-8")
        print(f"Wrote {target.relative_to(ROOT)}")

    appendix_target = OUT_DIR / "appendix-reference.md"
    appendix_target.write_text(to_appendix_page(appendix_sections), encoding="utf-8")
    print(f"Wrote {appendix_target.relative_to(ROOT)}")

    OVERVIEW.write_text(overview_page(body, preface, real_sections, skipped_sections), encoding="utf-8")
    print(f"Wrote {OVERVIEW.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
