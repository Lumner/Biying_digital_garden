import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "docs", "assets", "images", "home-hero-rain-1440.jpg");
const output = path.join(root, "docs", "assets", "images", "og-biying.jpg");
const background = (await readFile(source)).toString("base64");

await mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(`
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
          body {
            color: #eefcf8;
            font-family: "Segoe UI", "Microsoft YaHei", system-ui, sans-serif;
            background:
              linear-gradient(90deg, rgba(5, 15, 23, 0.96) 0%, rgba(5, 15, 23, 0.88) 52%, rgba(5, 15, 23, 0.38) 100%),
              url("data:image/jpeg;base64,${background}") center / cover;
          }
          .card {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 66px 76px 58px;
            border: 1px solid rgba(125, 249, 215, 0.5);
          }
          .card::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              linear-gradient(rgba(90, 229, 231, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(90, 229, 231, 0.08) 1px, transparent 1px);
            background-size: 54px 54px;
            mask-image: linear-gradient(90deg, black, transparent 78%);
          }
          .rail {
            position: absolute;
            top: 64px;
            bottom: 56px;
            left: 38px;
            width: 4px;
            background: linear-gradient(#5ae5e7, #7df9d7 62%, #ffb86b);
            box-shadow: 0 0 22px rgba(90, 229, 231, 0.72);
          }
          .kicker {
            position: relative;
            display: inline-flex;
            gap: 14px;
            align-items: center;
            color: #7df9d7;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.22em;
          }
          .kicker::before {
            content: "";
            width: 42px;
            height: 2px;
            background: currentColor;
          }
          h1 {
            position: relative;
            max-width: 770px;
            margin: 58px 0 18px;
            font-size: 82px;
            line-height: 1.06;
            letter-spacing: -0.035em;
            text-shadow: 0 10px 42px rgba(0, 0, 0, 0.5);
          }
          .english {
            position: relative;
            color: #a9c6c4;
            font-size: 31px;
            font-weight: 600;
            letter-spacing: 0.08em;
          }
          .footer {
            position: absolute;
            right: 74px;
            bottom: 56px;
            left: 76px;
            display: flex;
            justify-content: space-between;
            align-items: end;
            color: #d8ebe8;
            font-size: 21px;
          }
          .topics {
            display: flex;
            gap: 18px;
          }
          .topics span {
            padding: 9px 14px;
            border: 1px solid rgba(125, 249, 215, 0.42);
            background: rgba(5, 15, 23, 0.62);
          }
          .url {
            color: #ffbf77;
            font-weight: 700;
            letter-spacing: 0.05em;
          }
          .signal {
            position: absolute;
            top: 66px;
            right: 74px;
            width: 108px;
            height: 108px;
            border: 1px solid rgba(90, 229, 231, 0.45);
            border-radius: 50%;
          }
          .signal::before, .signal::after {
            content: "";
            position: absolute;
            border-radius: 50%;
            border: 1px solid rgba(125, 249, 215, 0.38);
          }
          .signal::before { inset: 18px; }
          .signal::after {
            inset: 40px;
            background: #7df9d7;
            box-shadow: 0 0 26px #7df9d7;
          }
        </style>
      </head>
      <body>
        <main class="card">
          <div class="rail"></div>
          <div class="signal"></div>
          <div class="kicker">LUMNER × BIYING</div>
          <h1>碧影数字花园</h1>
          <div class="english">BIYING DIGITAL GARDEN</div>
          <div class="footer">
            <div class="topics">
              <span>公开笔记</span>
              <span>项目记录</span>
              <span>AI 内容向导</span>
            </div>
            <div class="url">www.biying.site</div>
          </div>
        </main>
      </body>
    </html>
  `, { waitUntil: "load" });
  await page.screenshot({
    path: output,
    type: "jpeg",
    quality: 90,
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });
  console.log(`Wrote ${path.relative(root, output)}.`);
} finally {
  await browser.close();
}
