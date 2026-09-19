import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, "public");

const mainHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background: #09070F;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 70px 80px;
      position: relative;
      overflow: hidden;
    }
    .glow-bg {
      position: absolute;
      width: 700px;
      height: 500px;
      background: radial-gradient(circle, rgba(123, 0, 166, 0.35) 0%, rgba(168, 85, 247, 0.1) 40%, rgba(9, 7, 15, 0) 70%);
      top: -100px;
      right: -100px;
      z-index: 1;
      filter: blur(40px);
    }
    .glow-bottom {
      position: absolute;
      width: 500px;
      height: 400px;
      background: radial-gradient(circle, rgba(92, 61, 204, 0.25) 0%, rgba(9, 7, 15, 0) 70%);
      bottom: -150px;
      left: -100px;
      z-index: 1;
      filter: blur(50px);
    }
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 0;
      mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
    }
    .content {
      position: relative;
      z-index: 2;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 54px;
      font-weight: 800;
      color: #A855F7;
      letter-spacing: -1.5px;
    }
    .logo-pill {
      background: #7B00A6;
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-size: 42px;
      font-weight: 800;
      padding: 4px 22px;
      border-radius: 12px;
      transform: skew(-8deg);
      box-shadow: 0 4px 20px rgba(123, 0, 166, 0.5);
    }
    .badge {
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.35);
      color: #D8B4FE;
      padding: 8px 18px;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
    }
    .headline {
      font-family: 'Outfit', sans-serif;
      font-size: 56px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -1px;
      color: #F8FAFC;
      margin-top: 36px;
      max-width: 900px;
    }
    .headline span {
      background: linear-gradient(135deg, #C084FC 0%, #E879F9 50%, #FFFFFF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subhead {
      font-size: 22px;
      color: #94A3B8;
      line-height: 1.5;
      margin-top: 18px;
      max-width: 820px;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 28px;
    }
    .pills {
      display: flex;
      gap: 14px;
    }
    .feature-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 8px 18px;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 600;
      color: #E2E8F0;
      letter-spacing: 0.2px;
    }
    .domain {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #A855F7;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="glow-bg"></div>
  <div class="glow-bottom"></div>
  <div class="grid-pattern"></div>
  
  <div class="content">
    <div class="header">
      <div class="logo-container">
        <span class="logo-text">jaya</span>
        <div class="logo-pill">talent.</div>
      </div>
      <div class="badge">
        Web3 Recruitment Portal
      </div>
    </div>

    <h1 class="headline">Your Premier <span>Web3 Career</span> & Recruitment Partner</h1>
    <p class="subhead">Connecting top-tier engineers, founders, and executives with high-conviction crypto startups backed by leading venture capital.</p>
  </div>

  <div class="footer content">
    <div class="pills">
      <div class="feature-pill">10,000+ Curated Roles</div>
      <div class="feature-pill">Smart Job Matching</div>
      <div class="feature-pill">Private CV Vault</div>
    </div>
    <div class="domain">job.jayatalent.com</div>
  </div>
</body>
</html>
`;

const intelligenceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background: #0B0714;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 70px 80px;
      position: relative;
      overflow: hidden;
    }
    .glow-bg {
      position: absolute;
      width: 750px;
      height: 550px;
      background: radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(123, 0, 166, 0.15) 50%, rgba(11, 7, 20, 0) 75%);
      top: -120px;
      right: -100px;
      z-index: 1;
      filter: blur(45px);
    }
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 0;
    }
    .content {
      position: relative;
      z-index: 2;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 52px;
      font-weight: 800;
      color: #C084FC;
      letter-spacing: -1.5px;
    }
    .logo-pill {
      background: #7B00A6;
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-size: 40px;
      font-weight: 800;
      padding: 4px 20px;
      border-radius: 12px;
      transform: skew(-8deg);
      box-shadow: 0 4px 20px rgba(123, 0, 166, 0.6);
    }
    .intel-tag {
      background: rgba(236, 72, 153, 0.15);
      border: 1px solid rgba(236, 72, 153, 0.4);
      color: #F472B6;
      padding: 8px 20px;
      border-radius: 9999px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .headline {
      font-family: 'Outfit', sans-serif;
      font-size: 58px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -1px;
      color: #F8FAFC;
      margin-top: 36px;
      max-width: 950px;
    }
    .headline span {
      background: linear-gradient(135deg, #F472B6 0%, #C084FC 50%, #60A5FA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subhead {
      font-size: 22px;
      color: #94A3B8;
      line-height: 1.5;
      margin-top: 18px;
      max-width: 860px;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 28px;
    }
    .stats-row {
      display: flex;
      gap: 24px;
    }
    .stat-box {
      display: flex;
      flex-direction: column;
    }
    .stat-val {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #F8FAFC;
    }
    .stat-lbl {
      font-size: 13px;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .domain {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #C084FC;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="glow-bg"></div>
  <div class="grid-pattern"></div>
  
  <div class="content">
    <div class="header">
      <div class="logo-container">
        <span class="logo-text">jaya</span>
        <div class="logo-pill">talent.</div>
      </div>
      <div class="intel-tag">Weekend Intelligence</div>
    </div>

    <h1 class="headline">Web3 Job Market & <span>Salary Intelligence</span></h1>
    <p class="subhead">Weekly data-driven insights into crypto compensation trends, in-demand technical skills, protocol expansion, and strategic career opportunities.</p>
  </div>

  <div class="footer content">
    <div class="stats-row">
      <div class="stat-box">
        <span class="stat-val">10,000+</span>
        <span class="stat-lbl">Active Job Datapoints</span>
      </div>
      <div class="stat-box">
        <span class="stat-val">Weekly</span>
        <span class="stat-lbl">Market Snapshots</span>
      </div>
      <div class="stat-box">
        <span class="stat-val">100% Web3</span>
        <span class="stat-lbl">Curated Intelligence</span>
      </div>
    </div>
    <div class="domain">job.jayatalent.com</div>
  </div>
</body>
</html>
`;

async function generate() {
  console.log("🎨 Launching headless browser to render brand OG images...");
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  // 1. Render Main Site OG
  await page.setContent(mainHtml, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(publicDir, "og.png"), type: "png" });
  await page.screenshot({ path: join(publicDir, "og.jpg"), type: "jpeg", quality: 95 });
  console.log("✅ Created public/og.png & public/og.jpg");

  // 2. Render Weekend Intelligence OG
  await page.setContent(intelligenceHtml, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(publicDir, "og-intelligence.png"), type: "png" });
  await page.screenshot({ path: join(publicDir, "og-intelligence.jpg"), type: "jpeg", quality: 95 });
  console.log("✅ Created public/og-intelligence.png & public/og-intelligence.jpg");

  await browser.close();
  console.log("🎉 All Jaya Talent Open Graph assets generated successfully!");
}

generate().catch(console.error);
