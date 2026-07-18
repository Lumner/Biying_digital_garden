import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("project index stays honest while only one real case is public", async ({ page }) => {
  const locales = [
    {
      route: "/zh/projects/",
      caseTitle: "个人数字花园与碧影",
      pendingText: "至少有 2–3 个真实案例"
    },
    {
      route: "/en/projects/",
      caseTitle: "Personal Digital Garden + Biying",
      pendingText: "at least 2–3 real public cases"
    }
  ];

  for (const locale of locales) {
    const response = await page.goto(`${site.url}${locale.route}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator(".work-card")).toHaveCount(1);
    await expect(page.locator(".work-card h3")).toHaveText(locale.caseTitle);
    await expect(page.locator("main")).toContainText(locale.pendingText);
  }
});

test("public project case uses the required case-study structure", async ({ page }) => {
  const cases = [
    {
      route: "/zh/projects/personal-site-avatar/",
      headings: [
        "项目摘要",
        "背景与问题",
        "我的职责",
        "约束条件",
        "关键决策",
        "实现过程",
        "结果与证据",
        "不足与下一步",
        "链接与截图"
      ]
    },
    {
      route: "/en/projects/personal-site-avatar/",
      headings: [
        "Project Summary",
        "Background and Problem",
        "My Role",
        "Constraints",
        "Key Decisions",
        "Implementation Process",
        "Results and Evidence",
        "Limitations and Next Steps",
        "Links and Screenshots"
      ]
    }
  ];

  for (const item of cases) {
    const response = await page.goto(`${site.url}${item.route}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const headings = await page.locator("article h2").allTextContents();
    for (const heading of item.headings) {
      expect(headings.map((text) => text.replace(/\s*¶$/, "").trim())).toContain(heading);
    }
    await expect(page.locator("main")).not.toContainText(/虚构指标|invented metrics/i);
  }
});

test("english course pages are labeled as overviews and link back to Chinese full notes", async ({ page }) => {
  const courses = [
    {
      slug: "discrete-math-lecture",
      title: "Discrete Mathematics English Overview"
    },
    {
      slug: "computer-systems-lecture",
      title: "Computer Systems English Overview"
    },
    {
      slug: "fds-data-structures-lecture",
      title: "FDS Data Structures English Overview"
    }
  ];

  for (const course of courses) {
    const response = await page.goto(`${site.url}/en/notes/${course.slug}/`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("article h1")).toContainText(course.title);
    await expect(page.locator("main")).toContainText("English overview");
    await expect(page.locator("main")).toContainText("not a full line-by-line translation");
    await expect(page.locator("main")).toContainText("Chinese full version");
    const chineseLinks = await page.locator(`main a[href*="zh/notes/${course.slug}"]`).count();
    expect(chineseLinks).toBeGreaterThanOrEqual(1);
  }
});

test("english notes index presents course entries as overviews", async ({ page }) => {
  const response = await page.goto(`${site.url}/en/notes/`, { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  const article = page.locator("article.md-content__inner");

  await expect(article).toContainText("The English course pages are overview entrances");
  await expect(article).toContainText("Discrete Mathematics English Overview");
  await expect(article).toContainText("Computer Systems English Overview");
  await expect(article).toContainText("FDS Data Structures English Overview");
  await expect(article).not.toContainText("Discrete Mathematics Lecture Notes");
  await expect(article).not.toContainText("Computer Systems Fundamentals Lecture Notes");
  await expect(article).not.toContainText("FDS Data Structures Fundamentals Lecture Notes");
});

test("discrete math Chinese note keeps old URL while chapters move to stable subpaths", async ({ page }) => {
  const overviewResponse = await page.goto(`${site.url}/zh/notes/discrete-math-lecture/`, { waitUntil: "networkidle" });
  expect(overviewResponse?.status()).toBe(200);

  const overview = page.locator("main");
  await expect(overview).toContainText("章节正文已经拆分到稳定子路径");
  await expect(overview).toContainText("课程来源与引用边界");
  await expect(overview).toContainText("资料状态说明");
  await expect(overview).not.toContainText("待补充章节");
  await expect(overview).not.toContainText("图像资源待补充");

  expect(await page.locator("#note-sec-004").count()).toBeGreaterThanOrEqual(1);
  expect(await page.locator('main a[href*="chapter-01-logic-proofs"][href*="note-sec-004"]').count()).toBeGreaterThanOrEqual(1);
  expect(await page.locator('main a[href*="chapter-05-induction-recursion"][href*="note-sec-134"]').count()).toBeGreaterThanOrEqual(1);

  const chapters = [
    { slug: "chapter-01-logic-proofs", title: "第 1 章 逻辑与证明" },
    { slug: "chapter-02-basic-structures", title: "第 2 章 基本结构" },
    { slug: "chapter-03-algorithms", title: "第 3 章 算法" },
    { slug: "chapter-05-induction-recursion", title: "第 5 章 归纳与递归" },
    { slug: "chapter-06-counting", title: "第 6 章 计数" },
    { slug: "chapter-08-advanced-counting", title: "第 8 章 高级计数技术" },
    { slug: "chapter-09-relations", title: "第 9 章 关系" }
  ];

  for (const chapter of chapters) {
    const response = await page.goto(`${site.url}/zh/notes/discrete-math-lecture/${chapter.slug}/`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const main = page.locator("main");
    await expect(page.locator("article h1")).toContainText(chapter.title);
    await expect(main).toContainText("学习目标");
    await expect(main).toContainText("前置知识");
    await expect(main).toContainText("建议用时");
    await expect(main).toContainText("练习建议");
    await expect(main).toContainText("参考资料与引用边界");
    await expect(main).toContainText("原始讲义文件");
  }
});

test("computer systems Chinese note keeps old URL and replaces image placeholders", async ({ page }) => {
  const overviewResponse = await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "networkidle" });
  expect(overviewResponse?.status()).toBe(200);

  const overview = page.locator("main");
  await expect(overview).toContainText("章节正文已经拆分到稳定子路径");
  await expect(overview).toContainText("图片边界");
  await expect(overview).toContainText("课程来源与引用边界");
  await expect(overview).not.toContainText("图像资源待补充");

  expect(await page.locator("#note-sec-002").count()).toBeGreaterThanOrEqual(1);
  expect(await page.locator('main a[href*="chapter-00-system-view"][href*="note-sec-002"]').count()).toBeGreaterThanOrEqual(1);
  expect(await page.locator('main a[href*="chapter-07-riscv-programs"][href*="note-sec-084"]').count()).toBeGreaterThanOrEqual(1);

  const chapters = [
    { slug: "chapter-00-system-view", title: "0. 课程视角：从门电路到系统软件" },
    { slug: "chapter-01-information-representation", title: "1. 信息表示" },
    { slug: "chapter-02-boolean-logic", title: "2. 布尔代数与数字逻辑基础" },
    { slug: "chapter-03-combinational-logic", title: "3. 组合逻辑设计与 Verilog HDL" },
    { slug: "chapter-04-arithmetic-alu", title: "4. 运算部件与 ALU" },
    { slug: "chapter-05-sequential-logic", title: "5. 时序逻辑设计" },
    { slug: "chapter-06-isa", title: "6. 指令集体系结构 ISA" },
    { slug: "chapter-07-riscv-programs", title: "7. RISC-V ISA、汇编与程序运行" }
  ];

  for (const chapter of chapters) {
    const response = await page.goto(`${site.url}/zh/notes/computer-systems-lecture/${chapter.slug}/`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const main = page.locator("main");
    await expect(page.locator("article h1")).toContainText(chapter.title);
    await expect(main).toContainText("学习目标");
    await expect(main).toContainText("前置知识");
    await expect(main).toContainText("建议用时");
    await expect(main).toContainText("练习建议");
    await expect(main).toContainText("参考资料与引用边界");
    await expect(main).toContainText("原始讲义文件");
    await expect(main).not.toContainText("图像资源待补充");
  }

  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/chapter-00-system-view/`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("图像说明");
});

test("FDS Chinese note keeps old URL while real chapters move to stable subpaths", async ({ page }) => {
  const overviewResponse = await page.goto(`${site.url}/zh/notes/fds-data-structures-lecture/`, { waitUntil: "networkidle" });
  expect(overviewResponse?.status()).toBe(200);

  const overview = page.locator("main");
  await expect(overview).toContainText("章节正文已经拆分到稳定子路径");
  await expect(overview).toContainText("课程来源与引用边界");
  await expect(overview).not.toContainText("待补充登记表");
  await expect(overview).not.toContainText("新章节模板");

  expect(await page.locator("#note-sec-004").count()).toBeGreaterThanOrEqual(1);
  expect(await page.locator('main a[href*="chapter-00-course-view"][href*="note-sec-004"]').count()).toBeGreaterThanOrEqual(1);
  expect(await page.locator('main a[href*="chapter-09-graphs-toposort"][href*="note-sec-081"]').count()).toBeGreaterThanOrEqual(1);

  const chapters = [
    { slug: "chapter-00-course-view", title: "0. 课程视角：为什么需要数据结构" },
    { slug: "chapter-01-algorithm-analysis", title: "1. 算法分析" },
    { slug: "chapter-02-lists", title: "2. 抽象数据类型与线性表" },
    { slug: "chapter-03-stacks-queues", title: "3. 栈与队列" },
    { slug: "chapter-04-trees", title: "4. 树与二叉树" },
    { slug: "chapter-05-binary-search-trees", title: "5. 二叉搜索树" },
    { slug: "chapter-06-heaps", title: "6. 优先队列与二叉堆" },
    { slug: "chapter-07-union-find", title: "7. 并查集" },
    { slug: "chapter-08-segment-trees", title: "8. 线段树" },
    { slug: "chapter-09-graphs-toposort", title: "9. 图与拓扑排序" }
  ];

  for (const chapter of chapters) {
    const response = await page.goto(`${site.url}/zh/notes/fds-data-structures-lecture/${chapter.slug}/`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const main = page.locator("main");
    await expect(page.locator("article h1")).toContainText(chapter.title);
    await expect(main).toContainText("学习目标");
    await expect(main).toContainText("前置知识");
    await expect(main).toContainText("建议用时");
    await expect(main).toContainText("练习建议");
    await expect(main).toContainText("参考资料与引用边界");
    await expect(main).toContainText("原始讲义文件");
  }

  await page.goto(`${site.url}/zh/notes/fds-data-structures-lecture/appendix-reference/`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("后续扩展登记表");
  await expect(page.locator("main")).not.toContainText("待新增");
});
