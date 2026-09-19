import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, "public");

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    body {
      width: 1280px;
      height: 760px;
      background: #FFFFFF;
      color: #0F172A;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 38px 46px;
      position: relative;
      overflow: hidden;
    }

    .outer-border {
      position: absolute;
      inset: 14px;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      pointer-events: none;
      z-index: 1;
    }

    .content-wrapper {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    /* HEADER */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid #E2E8F0;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: #7B00A6;
      letter-spacing: -1.2px;
      line-height: 1;
    }

    .logo-pill {
      background: #7B00A6;
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      padding: 3px 14px;
      border-radius: 7px;
      transform: skew(-8deg);
      line-height: 1;
      display: inline-block;
      box-shadow: 0 2px 8px rgba(123, 0, 166, 0.25);
    }

    .header-divider {
      width: 1px;
      height: 28px;
      background: #E2E8F0;
    }

    .intel-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #FAF5FF;
      border: 1px solid #E9D5FF;
      padding: 5px 12px;
      border-radius: 6px;
    }

    .intel-badge span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #7B00A6;
      text-transform: uppercase;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .edition-tag {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 6px 14px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }

    /* SECTION HEADINGS */
    .section-block {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #64748B;
      text-transform: uppercase;
    }

    .section-accent {
      width: 4px;
      height: 14px;
      background: #7B00A6;
      border-radius: 2px;
    }

    .section-accent.blue {
      background: #0284C7;
    }

    /* SECTION 1: MARKET SNAPSHOT GRID */
    .snapshot-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .snap-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 18px 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-top: 3.5px solid #CBD5E1;
    }

    .snap-card.top-purple { border-top-color: #9333EA; }
    .snap-card.top-cyan { border-top-color: #0284C7; }
    .snap-card.top-violet { border-top-color: #6366F1; }
    .snap-card.top-green { border-top-color: #059669; }

    .snap-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .snap-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }

    .snap-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 2.5px 7px;
      border-radius: 4px;
    }

    .snap-pill.purple { background: #FAF5FF; color: #7B00A6; border: 1px solid #E9D5FF; }
    .snap-pill.cyan { background: #F0F9FF; color: #0284C7; border: 1px solid #BAE6FD; }
    .snap-pill.violet { background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; }
    .snap-pill.green { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }

    .snap-num {
      font-family: 'Outfit', sans-serif;
      font-size: 38px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -1px;
      line-height: 1.05;
      margin-bottom: 4px;
    }

    .snap-sub {
      font-size: 13px;
      font-weight: 500;
      color: #64748B;
    }

    /* SECTION 2: SALARY BENCHMARKS GRID */
    .salary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .salary-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 18px 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-top: 3.5px solid #CBD5E1;
    }

    .salary-card.role-1 { border-top-color: #E11D48; }
    .salary-card.role-2 { border-top-color: #0284C7; }
    .salary-card.role-3 { border-top-color: #7B00A6; }
    .salary-card.role-4 { border-top-color: #D97706; }

    .role-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .role-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 2.5px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-tag.c-rose { background: #FFF1F2; color: #BE123C; border: 1px solid #FECDD3; }
    .role-tag.c-cyan { background: #F0F9FF; color: #0369A1; border: 1px solid #BAE6FD; }
    .role-tag.c-purple { background: #FAF5FF; color: #6B21A8; border: 1px solid #E9D5FF; }
    .role-tag.c-amber { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }

    .role-level {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
    }

    .role-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.25;
      margin-bottom: 12px;
      height: 38px;
      display: flex;
      align-items: center;
    }

    .salary-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }

    .salary-header {
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .salary-value {
      font-family: 'Outfit', sans-serif;
      font-size: 30px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.6px;
      line-height: 1;
    }

    .salary-bar-wrap {
      margin-top: 8px;
    }

    .salary-track {
      width: 100%;
      height: 5px;
      background: #E2E8F0;
      border-radius: 999px;
      overflow: hidden;
    }

    .salary-fill {
      height: 100%;
      border-radius: 999px;
    }

    .fill-rose { background: #E11D48; }
    .fill-cyan { background: #0284C7; }
    .fill-purple { background: #7B00A6; }
    .fill-amber { background: #D97706; }

    .salary-bounds {
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      color: #94A3B8;
      margin-top: 4px;
    }

    .tech-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .tech-item {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      color: #475569;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      padding: 2px 7px;
      border-radius: 4px;
    }

    /* FOOTER */
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #E2E8F0;
      padding-top: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94A3B8;
    }

    .footer-left {
      font-weight: 600;
      color: #64748B;
    }

    .footer-right {
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <div class="outer-border"></div>

  <div class="content-wrapper">
    <!-- TOP HEADER -->
    <header class="header">
      <div class="brand-group">
        <div class="logo-container">
          <span class="logo-text">jaya</span>
          <div class="logo-pill">talent.</div>
        </div>
        <div class="header-divider"></div>
        <div class="intel-badge">
          <span>WEEKEND INTELLIGENCE</span>
        </div>
      </div>

      <div class="header-right">
        <div class="edition-tag">SEPTEMBER 2026</div>
      </div>
    </header>

    <!-- SECTION 1: MARKET SNAPSHOT -->
    <section class="section-block">
      <div class="section-header">
        <div class="section-title">
          <div class="section-accent"></div>
          <span>01 &bull; Market Snapshot</span>
        </div>
      </div>

      <div class="snapshot-grid">
        <!-- Card 1 -->
        <div class="snap-card top-purple">
          <div>
            <div class="snap-top">
              <span class="snap-label">Jobs Tracked</span>
              <span class="snap-pill purple">+14% MoM</span>
            </div>
            <div class="snap-num">10,396</div>
          </div>
          <div class="snap-sub">Active crypto roles</div>
        </div>

        <!-- Card 2 -->
        <div class="snap-card top-cyan">
          <div>
            <div class="snap-top">
              <span class="snap-label">Remote Roles</span>
              <span class="snap-pill cyan">7,069 Roles</span>
            </div>
            <div class="snap-num">68%</div>
          </div>
          <div class="snap-sub">Global distribution</div>
        </div>

        <!-- Card 3 -->
        <div class="snap-card top-violet">
          <div>
            <div class="snap-top">
              <span class="snap-label">Protocols</span>
              <span class="snap-pill violet">Hiring</span>
            </div>
            <div class="snap-num">350+</div>
          </div>
          <div class="snap-sub">Active teams &amp; DAOs</div>
        </div>

        <!-- Card 4 -->
        <div class="snap-card top-green">
          <div>
            <div class="snap-top">
              <span class="snap-label">Median Base</span>
              <span class="snap-pill green">Cash Pay</span>
            </div>
            <div class="snap-num">$175,000</div>
          </div>
          <div class="snap-sub">Disclosed compensation</div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: WHAT DOES WEB3 PAY? -->
    <section class="section-block">
      <div class="section-header">
        <div class="section-title">
          <div class="section-accent blue"></div>
          <span>02 &bull; What Does Web3 Pay? (Base Salaries)</span>
        </div>
      </div>

      <div class="salary-grid">
        <!-- Role 1 -->
        <div class="salary-card role-1">
          <div>
            <div class="role-top">
              <span class="role-tag c-rose">Trading &amp; MEV</span>
              <span class="role-level">Senior</span>
            </div>
            <div class="role-title">Quantitative &amp; MEV Systems</div>
            
            <div class="salary-box">
              <div class="salary-header">
                <span>Median Base</span>
                <span style="color: #BE123C;">Top 5%</span>
              </div>
              <div class="salary-value">$255,000</div>
              <div class="salary-bar-wrap">
                <div class="salary-track">
                  <div class="salary-fill fill-rose" style="width: 88%;"></div>
                </div>
                <div class="salary-bounds">
                  <span>$210k</span>
                  <span>$310k+</span>
                </div>
              </div>
            </div>
          </div>

          <div class="tech-pills">
            <span class="tech-item">C++</span>
            <span class="tech-item">Rust</span>
            <span class="tech-item">Python</span>
            <span class="tech-item">Solidity</span>
          </div>
        </div>

        <!-- Role 2 -->
        <div class="salary-card role-2">
          <div>
            <div class="role-top">
              <span class="role-tag c-cyan">Cryptography</span>
              <span class="role-level">Core Dev</span>
            </div>
            <div class="role-title">Zero-Knowledge (ZK) Engineers</div>
            
            <div class="salary-box">
              <div class="salary-header">
                <span>Median Base</span>
                <span style="color: #0369A1;">High Scarcity</span>
              </div>
              <div class="salary-value">$235,000</div>
              <div class="salary-bar-wrap">
                <div class="salary-track">
                  <div class="salary-fill fill-cyan" style="width: 82%;"></div>
                </div>
                <div class="salary-bounds">
                  <span>$190k</span>
                  <span>$280k</span>
                </div>
              </div>
            </div>
          </div>

          <div class="tech-pills">
            <span class="tech-item">Circom</span>
            <span class="tech-item">Halo2</span>
            <span class="tech-item">Rust</span>
            <span class="tech-item">Plonky2</span>
          </div>
        </div>

        <!-- Role 3 -->
        <div class="salary-card role-3">
          <div>
            <div class="role-top">
              <span class="role-tag c-purple">Smart Contracts</span>
              <span class="role-level">DeFi &amp; L2</span>
            </div>
            <div class="role-title">Solidity &amp; EVM Architects</div>
            
            <div class="salary-box">
              <div class="salary-header">
                <span>Median Base</span>
                <span style="color: #6B21A8;">High Volume</span>
              </div>
              <div class="salary-value">$215,000</div>
              <div class="salary-bar-wrap">
                <div class="salary-track">
                  <div class="salary-fill fill-purple" style="width: 76%;"></div>
                </div>
                <div class="salary-bounds">
                  <span>$170k</span>
                  <span>$250k</span>
                </div>
              </div>
            </div>
          </div>

          <div class="tech-pills">
            <span class="tech-item">Solidity</span>
            <span class="tech-item">Foundry</span>
            <span class="tech-item">Yul</span>
            <span class="tech-item">EVM</span>
          </div>
        </div>

        <!-- Role 4 -->
        <div class="salary-card role-4">
          <div>
            <div class="role-top">
              <span class="role-tag c-amber">L1 Protocols</span>
              <span class="role-level">Infra</span>
            </div>
            <div class="role-title">Rust &amp; Distributed Systems</div>
            
            <div class="salary-box">
              <div class="salary-header">
                <span>Median Base</span>
                <span style="color: #B45309;">High Demand</span>
              </div>
              <div class="salary-value">$210,000</div>
              <div class="salary-bar-wrap">
                <div class="salary-track">
                  <div class="salary-fill fill-amber" style="width: 72%;"></div>
                </div>
                <div class="salary-bounds">
                  <span>$165k</span>
                  <span>$245k</span>
                </div>
              </div>
            </div>
          </div>

          <div class="tech-pills">
            <span class="tech-item">Rust</span>
            <span class="tech-item">Solana</span>
            <span class="tech-item">Cosmos</span>
            <span class="tech-item">Tokio</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-left">
        Jaya Talent Market Intelligence Index &bull; Disclosed Cash Base
      </div>
      <div class="footer-right">
        Verified Data &bull; 10,396 Positions Analyzed
      </div>
    </footer>
  </div>
</body>
</html>
`;

async function render() {
  console.log("🎨 Launching Chromium to render clean white-themed human-crafted cards...");
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 760 },
    deviceScaleFactor: 2,
  });

  await page.setContent(html, { waitUntil: "networkidle" });

  const pngPath = join(publicDir, "weekend-intelligence-cards.png");
  const jpgPath = join(publicDir, "weekend-intelligence-cards.jpg");

  await page.screenshot({ path: pngPath, type: "png" });
  await page.screenshot({ path: jpgPath, type: "jpeg", quality: 96 });

  console.log(`✅ Successfully generated clean white cards:`);
  console.log(`   - ${pngPath}`);
  console.log(`   - ${jpgPath}`);

  await browser.close();
}

render().catch(console.error);
