---
title: FDS Data Structures Fundamentals Lecture Notes
summary: Lecture notes for data structures, covering algorithm analysis, lists, stacks and queues, trees, heaps, union-find, segment trees, graphs, and topological sorting.
public: true
avatar_readable: true
tags:
  - data-structures
  - algorithms
  - course-note
---

# FDS Data Structures Fundamentals Lecture Notes

Data structures are less about containers than tradeoffs. The same task can behave very differently once the data is organized to support the operations that matter most.

## What This Note Is About

Lecture notes for data structures, covering algorithm analysis, lists, stacks and queues, trees, heaps, union-find, segment trees, graphs, and topological sorting.

## Reading Thread

- **Algorithm Analysis**: Asymptotic notation, common complexity classes, and the source of time and space costs.
- **Abstract Data Types and Lists**: Interface design, linear lists, linked lists, cursor implementation, and polynomial examples.
- **Stacks and Queues**: LIFO/FIFO structures, expression conversion, recursion stacks, and circular queues.
- **Trees and Binary Trees**: Tree terminology, traversal, expression trees, threaded trees, and recursive structure.
- **Search Trees and Heaps**: Binary search trees, priority queues, binary heaps, and heap applications.
- **Union-Find and Segment Trees**: Dynamic equivalence, path compression, interval query, point update, range update, and lazy propagation.
- **Graphs**: Graph definitions, storage methods, AOV networks, and topological sorting.

## Questions to Keep in Mind

- What invariant does this structure preserve?
- Which operations become faster, and which ones become more expensive?
- Where does the stated complexity actually come from?
- When the access pattern changes, is the original structure still the right one?
- If the name of a structure is familiar but its tradeoff is not, what understanding is still missing?

## Key Notation

Representative notation used throughout the note:

- `\(O(N\log N)\)`
- `\(O(N)\)`
- `\(O(1)\)`
- `\(O(\log N)\)`
- `\(N\)`
- `\(O(N^2)\)`
- `\(N/2\)`
- `\(T(N)=O(f(N))\)`
- `\(T\)`
- `\(f\)`
