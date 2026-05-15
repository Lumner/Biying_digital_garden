from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTE = ROOT / "note"
DOCS = ROOT / "docs"

COURSES = [
    {
        "source": "离散数学讲义.md",
        "slug": "discrete-math-lecture",
        "zh_title": "离散数学讲义",
        "en_title": "Discrete Mathematics Lecture Notes",
        "summary_zh": "离散数学课程讲义，覆盖逻辑与证明、集合与函数、算法、归纳递归、计数、关系等主题。",
        "summary_en": "Lecture notes for discrete mathematics, covering logic and proofs, sets and functions, algorithms, induction and recursion, counting, and relations.",
        "tags": ["math", "discrete-math", "course-note"],
        "category": "math",
        "recommended": True,
        "reading_order": 10,
        "outline": [
            ("Logic and Proofs", "Propositional logic, predicate logic, inference rules, and proof strategies."),
            ("Basic Structures", "Sets, functions, sequences, sums, and matrices as discrete objects."),
            ("Algorithms", "Algorithmic thinking, complexity notation, and common analysis patterns."),
            ("Induction and Recursion", "Mathematical induction, strong induction, recursive definitions, and structural reasoning."),
            ("Counting", "Permutations, combinations, binomial coefficients, and counting strategies."),
            ("Advanced Counting", "Recurrence relations, inclusion-exclusion, generating functions, and derangements."),
            ("Relations", "Relations, closures, equivalence relations, partial orders, and partitions."),
        ],
    },
    {
        "source": "SYS_计算机系统基础讲义.md",
        "slug": "computer-systems-lecture",
        "zh_title": "计算机系统基础讲义",
        "en_title": "Computer Systems Fundamentals Lecture Notes",
        "summary_zh": "计算机系统基础讲义，覆盖信息表示、布尔代数、组合逻辑、运算部件、时序逻辑、ISA 与 RISC-V。",
        "summary_en": "Lecture notes for computer systems fundamentals, covering information representation, Boolean algebra, combinational logic, arithmetic units, sequential logic, ISA, and RISC-V.",
        "tags": ["computer-systems", "risc-v", "course-note"],
        "category": "systems",
        "recommended": True,
        "reading_order": 20,
        "outline": [
            ("System Perspective", "How physical signals, logic gates, RTL components, ISA, assembly, linking, and loading connect into a computer system."),
            ("Information Representation", "Binary encoding, integers, floating-point numbers, characters, and data interpretation."),
            ("Boolean Algebra and Logic", "Logic gates, Boolean identities, circuit parameters, and digital abstraction."),
            ("Combinational Logic and Verilog", "Functional blocks, HDL descriptions, and design flow."),
            ("Arithmetic Units and ALU", "Addition, subtraction, multiplication, division, shifting, and floating-point arithmetic."),
            ("Sequential Logic", "Latches, flip-flops, registers, counters, finite-state machines, and timing."),
            ("ISA and RISC-V", "Instruction formats, registers, calling conventions, ELF files, linking, loading, and program execution."),
        ],
    },
    {
        "source": "FDS_数据结构基础讲义.md",
        "slug": "fds-data-structures-lecture",
        "zh_title": "FDS 数据结构基础讲义",
        "en_title": "FDS Data Structures Fundamentals Lecture Notes",
        "summary_zh": "数据结构基础讲义，覆盖算法分析、线性表、栈队列、树、堆、并查集、线段树、图与拓扑排序。",
        "summary_en": "Lecture notes for data structures, covering algorithm analysis, lists, stacks and queues, trees, heaps, union-find, segment trees, graphs, and topological sorting.",
        "tags": ["data-structures", "algorithms", "course-note"],
        "category": "algorithms",
        "recommended": True,
        "reading_order": 30,
        "outline": [
            ("Algorithm Analysis", "Asymptotic notation, common complexity classes, and the source of time and space costs."),
            ("Abstract Data Types and Lists", "Interface design, linear lists, linked lists, cursor implementation, and polynomial examples."),
            ("Stacks and Queues", "LIFO/FIFO structures, expression conversion, recursion stacks, and circular queues."),
            ("Trees and Binary Trees", "Tree terminology, traversal, expression trees, threaded trees, and recursive structure."),
            ("Search Trees and Heaps", "Binary search trees, priority queues, binary heaps, and heap applications."),
            ("Union-Find and Segment Trees", "Dynamic equivalence, path compression, interval query, point update, range update, and lazy propagation."),
            ("Graphs", "Graph definitions, storage methods, AOV networks, and topological sorting."),
        ],
    },
]


def frontmatter(
    title: str,
    summary: str,
    tags: list[str],
    category: str,
    recommended: bool,
    reading_order: int,
) -> str:
    tag_lines = "\n".join(f"  - {tag}" for tag in tags)
    return (
        "---\n"
        f"title: {title}\n"
        f"summary: {summary}\n"
        "public: true\n"
        "avatar_readable: true\n"
        f"category: {category}\n"
        f"recommended: {'true' if recommended else 'false'}\n"
        "updated: 2026-05-13\n"
        f"reading_order: {reading_order}\n"
        "tags:\n"
        f"{tag_lines}\n"
        "---\n\n"
    )


def strip_original_h1(text: str) -> str:
    return re.sub(r"^# .+?\n+", "", text, count=1)


def remove_manual_toc(text: str) -> str:
    return re.sub(r"## 目录\n\n(?:- .+\n)+\n", "", text, count=1)


def replace_missing_images(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        alt = match.group(1)
        path = match.group(2)
        return (
            f'!!! note "图像资源待补充：{alt}"\n'
            f"    原始讲义引用了 `{path}`，但当前 `note/` 目录没有随附图片资源。后续补充图片后可恢复为 Markdown 图片。\n"
        )

    return re.sub(r"!\[([^\]]+)\]\((\.\/sys_notes_assets\/[^)]+)\)", repl, text)


def normalize_math_code_spans(text: str) -> str:
    """Turn code-styled LaTeX such as `$n$` into real math spans.

    The source lecture notes use backticks around many formulas. MkDocs renders
    those as code before MathJax can see them, so formulas stay raw. This pass
    only touches inline code spans that clearly contain LaTeX delimiters, and it
    leaves fenced code blocks untouched.
    """

    fence_pattern = re.compile(r"(```.*?```)", re.S)
    pieces = fence_pattern.split(text)
    for index, piece in enumerate(pieces):
        if index % 2 == 1:
            continue
        piece = re.sub(r"`(\$[^`\n]+\$)`", r"\1", piece)
        piece = re.sub(r"`(\\\([^`\n]+\\\))`", r"\1", piece)
        piece = re.sub(r"`(\\\[[\s\S]*?\\\])`", r"\1", piece)
        piece = re.sub(r"`(\$[^`\n]+\$)", r"\1", piece)
        pieces[index] = piece
    return "".join(pieces)


def normalize_headings_for_sidebar(text: str, max_depth: int = 4) -> str:
    lines = text.splitlines()
    output: list[str] = []
    counter = 1
    in_fence = False

    for line in lines:
        if line.startswith("```"):
            in_fence = not in_fence
            output.append(line)
            continue

        match = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
        if not in_fence and match:
            original_level = len(match.group(1))
            # The page already has one H1 title. Course chapters written as H1
            # in the source become H2, while existing H2/H3 sections keep their
            # natural depth so the Material right sidebar becomes the index.
            level = max(original_level, 2)
            title = match.group(2).strip()
            if level <= max_depth:
                anchor = f"note-sec-{counter:03d}"
                counter += 1
                output.append(f"{'#' * level} {title} {{ #{anchor} }}")
            else:
                output.append(f"{'#' * level} {title}")
            continue

        output.append(line)

    return "\n".join(output)


def write_chinese(course: dict) -> None:
    source = NOTE / course["source"]
    body = source.read_text(encoding="utf-8")
    body = normalize_math_code_spans(
        replace_missing_images(remove_manual_toc(strip_original_h1(body)))
    )
    body = normalize_headings_for_sidebar(body, max_depth=4)
    target = DOCS / "zh" / "notes" / f"{course['slug']}.md"
    target.write_text(
        frontmatter(
            course["zh_title"],
            course["summary_zh"],
            course["tags"],
            course["category"],
            course["recommended"],
            course["reading_order"],
        )
        + f"# {course['zh_title']}\n\n"
        + body.strip()
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {target.relative_to(ROOT)}")


def extract_formula_examples(text: str, limit: int = 10) -> list[str]:
    formulas = []
    patterns = [r"\$\$.*?\$\$", r"\\\(.*?\\\)", r"\$[^$\n]+\$"]
    for pattern in patterns:
        for match in re.finditer(pattern, text, flags=re.S):
            snippet = match.group(0).strip()
            if len(snippet) <= 180 and snippet not in formulas:
                formulas.append(snippet)
            if len(formulas) >= limit:
                return formulas
    return formulas


def write_english(course: dict) -> None:
    source = NOTE / course["source"]
    source_text = source.read_text(encoding="utf-8")
    formulas = extract_formula_examples(source_text)
    outline = "\n".join(
        f"- **{title}**: {description}" for title, description in course["outline"]
    )
    formula_block = "\n".join(f"- `{formula}`" for formula in formulas) or "- No compact formula examples extracted."
    zh_url = f"../../zh/notes/{course['slug']}.md"
    body = f"""# {course['en_title']}

!!! info "Translation status"
    This is an English companion version generated for the bilingual site. It summarizes and translates the structure of the Chinese source while keeping key mathematical and technical notation intact. A full line-by-line translation can be generated later with `scripts/translate.py` after an API key is configured.

## Source

- Chinese source page: [{course['zh_title']}]({zh_url})
- Original file: `note/{course['source']}`

## What This Note Covers

{course['summary_en']}

## Study Outline

{outline}

## Preserved Notation Examples

The Chinese source contains mathematical notation and technical symbols. Examples preserved for cross-language lookup:

{formula_block}

## How to Use This Page

Use this English page as a quick map before reading the Chinese lecture note. The Chinese page contains the complete detailed content, formulas, examples, tables, and course structure. This companion page makes the topic discoverable to English visitors and gives Biying enough English context to explain what the note is about.
"""
    target = DOCS / "en" / "notes" / f"{course['slug']}.md"
    target.write_text(
        frontmatter(
            course["en_title"],
            course["summary_en"],
            course["tags"],
            course["category"],
            course["recommended"],
            course["reading_order"],
        )
        + body.strip()
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {target.relative_to(ROOT)}")


def main() -> None:
    for course in COURSES:
        write_chinese(course)
        write_english(course)


if __name__ == "__main__":
    main()
