import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, "public");

const iconHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 512px;
      height: 512px;
      background: #0B0714;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 128px;
      overflow: hidden;
      border: 8px solid rgba(123, 0, 166, 0.4);
    }
    .pill {
      background: #7B00A6;
      width: 380px;
      height: 260px;
      transform: skew(-10deg);
      border-radius: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16px 48px rgba(123, 0, 166, 0.6);
    }
    .text {
      font-family: 'Outfit', sans-serif;
      font-size: 190px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -6px;
      transform: skew(10deg);
      margin-top: -12px;
    }
  </style>
</head>
<body>
  <div class="pill">
    <div class="text">jt.</div>
  </div>
</body>
</html>
`;

async function main() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await page.setContent(iconHtml, { waitUntil: "networkidle" });
  
  // 1. 512x512
  await page.screenshot({ path: join(publicDir, "favicon.png"), type: "png" });
  
  // 2. 180x180 for Apple touch icon
  const page180 = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await page180.setContent(iconHtml, { waitUntil: "networkidle" });
  await page180.screenshot({ path: join(publicDir, "__grok", "icon-180.png"), type: "png" });
  await page180.screenshot({ path: join(publicDir, "favicon.ico"), type: "png" });

  await browser.close();
  console.log("✅ Rendered Jaya Talent favicons & app icons!");
}

main().catch(console.error);
