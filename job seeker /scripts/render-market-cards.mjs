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
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    body {
      width: 1280px;
      height: 780px;
      background: #FFFFFF;
      color: #0F172A;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 44px;
      position: relative;
      overflow: hidden;
    }

    .outer-border {
      position: absolute;
      inset: 12px;
      border: 1px solid #E2E8F0;
      border-radius: 18px;
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
      padding-bottom: 14px;
      border-bottom: 1px solid #E2E8F0;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
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
      letter-spacing: -1px;
      line-height: 1;
    }

    .logo-pill {
      background: #7B00A6;
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      padding: 3px 14px;
      border-radius: 8px;
      transform: skew(-8deg);
      line-height: 1;
      display: inline-block;
      box-shadow: 0 2px 10px rgba(123, 0, 166, 0.22);
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
      padding: 5px 14px;
      border-radius: 8px;
    }

    .intel-badge span {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #7B00A6;
      text-transform: uppercase;
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    .edition-tag {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }

    /* SECTION HEADERS */
    .section-block {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }

    .section-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #7B00A6;
    }

    .section-dot.blue {
      background: #0284C7;
    }

    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 19px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -0.3px;
    }

    .section-subtitle {
      font-size: 12.5px;
      font-weight: 500;
      color: #64748B;
    }

    /* SECTION 1: MARKET SNAPSHOT */
    .snapshot-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .snap-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 18px 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }

    .snap-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .icon-badge {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-badge.purple { background: #FAF5FF; color: #7B00A6; border: 1px solid #E9D5FF; }
    .icon-badge.cyan { background: #F0F9FF; color: #0284C7; border: 1px solid #BAE6FD; }
    .icon-badge.violet { background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; }
    .icon-badge.green { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }

    .icon-svg {
      width: 18px;
      height: 18px;
    }

    .snap-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .snap-pill.purple { background: #FAF5FF; color: #7B00A6; border: 1px solid #E9D5FF; }
    .snap-pill.cyan { background: #F0F9FF; color: #0284C7; border: 1px solid #BAE6FD; }
    .snap-pill.violet { background: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; }
    .snap-pill.green { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }

    .snap-label {
      font-size: 12.5px;
      font-weight: 600;
      color: #64748B;
      margin-bottom: 2px;
    }

    .snap-num {
      font-family: 'Outfit', sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -1px;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .snap-desc {
      font-size: 12px;
      font-weight: 500;
      color: #64748B;
    }

    /* SECTION 2: WHAT DOES WEB3 PAY? */
    .salary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .salary-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 18px 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .role-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .category-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .category-badge.rose { background: #FFF1F2; color: #BE123C; border: 1px solid #FECDD3; }
    .category-badge.cyan { background: #F0F9FF; color: #0369A1; border: 1px solid #BAE6FD; }
    .category-badge.purple { background: #FAF5FF; color: #6B21A8; border: 1px solid #E9D5FF; }
    .category-badge.amber { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }

    .level-text {
      font-size: 11px;
      font-weight: 600;
      color: #94A3B8;
    }

    .role-title {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.25;
      margin-bottom: 12px;
      height: 38px;
      display: flex;
      align-items: center;
      letter-spacing: -0.2px;
    }

    .comp-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 12px;
    }

    .comp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      margin-bottom: 4px;
    }

    .tier-tag {
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
    }

    .salary-num {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.6px;
      line-height: 1;
    }

    .range-bar-wrapper {
      margin-top: 8px;
    }

    .range-track {
      width: 100%;
      height: 5px;
      background: #E2E8F0;
      border-radius: 999px;
      overflow: hidden;
    }

    .range-fill {
      height: 100%;
      border-radius: 999px;
    }

    .fill-rose { background: #E11D48; }
    .fill-cyan { background: #0284C7; }
    .fill-purple { background: #7B00A6; }
    .fill-amber { background: #D97706; }

    .range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      margin-top: 4px;
    }

    .skills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .skill-pill {
      font-size: 10.5px;
      font-weight: 600;
      color: #334155;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      padding: 2.5px 8px;
      border-radius: 5px;
    }

    /* FOOTER */
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #E2E8F0;
      padding-top: 14px;
      font-size: 12px;
      font-weight: 500;
      color: #64748B;
    }

    .footer strong {
      color: #0F172A;
      font-weight: 600;
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
        <div class="edition-tag">SEPTEMBER 2026 EDITION</div>
      </div>
    </header>

    <!-- SECTION 1: MARKET SNAPSHOT -->
    <section class="section-block">
      <div class="section-header">
        <div class="section-title-group">
          <div class="section-dot"></div>
          <h2 class="section-title">Market Snapshot</h2>
        </div>
        <span class="section-subtitle">Aggregated across 40+ Web3 protocols &amp; ecosystems</span>
      </div>

      <div class="snapshot-grid">
        <!-- Card 1 -->
        <div class="snap-card">
          <div class="snap-top">
            <div class="icon-badge purple">
              <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <span class="snap-pill purple">+14% MoM</span>
          </div>
          <div>
            <div class="snap-label">Jobs Tracked</div>
            <div class="snap-num">10,396</div>
            <div class="snap-desc">Curated active roles</div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="snap-card">
          <div class="snap-top">
            <div class="icon-badge cyan">
              <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span class="snap-pill cyan">7,069 Roles</span>
          </div>
          <div>
            <div class="snap-label">Remote Roles</div>
            <div class="snap-num">68%</div>
            <div class="snap-desc">Global async distribution</div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="snap-card">
          <div class="snap-top">
            <div class="icon-badge violet">
              <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <span class="snap-pill violet">Hiring</span>
          </div>
          <div>
            <div class="snap-label">Verified Protocols</div>
            <div class="snap-num">350+</div>
            <div class="snap-desc">Active teams &amp; DAOs</div>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="snap-card">
          <div class="snap-top">
            <div class="icon-badge green">
              <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span class="snap-pill green">Cash Only</span>
          </div>
          <div>
            <div class="snap-label">Median Base Pay</div>
            <div class="snap-num">$175,000</div>
            <div class="snap-desc">Disclosed transparent cash</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: WHAT DOES WEB3 PAY? -->
    <section class="section-block">
      <div class="section-header">
        <div class="section-title-group">
          <div class="section-dot blue"></div>
          <h2 class="section-title">What Does Web3 Pay?</h2>
        </div>
        <span class="section-subtitle">Median base cash compensation by technical discipline</span>
      </div>

      <div class="salary-grid">
        <!-- Role 1 -->
        <div class="salary-card">
          <div>
            <div class="role-header">
              <span class="category-badge rose">Trading &amp; MEV</span>
              <span class="level-text">Senior / Lead</span>
            </div>
            <div class="role-title">Quantitative &amp; MEV Systems</div>
            
            <div class="comp-box">
              <div class="comp-header">
                <span>Median Base</span>
                <span class="tier-tag" style="color: #BE123C;">Top 5% Tier</span>
              </div>
              <div class="salary-num">$255,000</div>
              <div class="range-bar-wrapper">
                <div class="range-track">
                  <div class="range-fill fill-rose" style="width: 88%;"></div>
                </div>
                <div class="range-labels">
                  <span>$210k</span>
                  <span>$310k+</span>
                </div>
              </div>
            </div>
          </div>

          <div class="skills-row">
            <span class="skill-pill">C++</span>
            <span class="skill-pill">Rust</span>
            <span class="skill-pill">Python</span>
            <span class="skill-pill">Solidity</span>
          </div>
        </div>

        <!-- Role 2 -->
        <div class="salary-card">
          <div>
            <div class="role-header">
              <span class="category-badge cyan">Cryptography</span>
              <span class="level-text">Core Dev</span>
            </div>
            <div class="role-title">Zero-Knowledge (ZK) Engineers</div>
            
            <div class="comp-box">
              <div class="comp-header">
                <span>Median Base</span>
                <span class="tier-tag" style="color: #0369A1;">High Scarcity</span>
              </div>
              <div class="salary-num">$235,000</div>
              <div class="range-bar-wrapper">
                <div class="range-track">
                  <div class="range-fill fill-cyan" style="width: 82%;"></div>
                </div>
                <div class="range-labels">
                  <span>$190k</span>
                  <span>$280k</span>
                </div>
              </div>
            </div>
          </div>

          <div class="skills-row">
            <span class="skill-pill">Circom</span>
            <span class="skill-pill">Halo2</span>
            <span class="skill-pill">Rust</span>
            <span class="skill-pill">Plonky2</span>
          </div>
        </div>

        <!-- Role 3 -->
        <div class="salary-card">
          <div>
            <div class="role-header">
              <span class="category-badge purple">Smart Contracts</span>
              <span class="level-text">DeFi &amp; L2</span>
            </div>
            <div class="role-title">Solidity &amp; EVM Architects</div>
            
            <div class="comp-box">
              <div class="comp-header">
                <span>Median Base</span>
                <span class="tier-tag" style="color: #6B21A8;">High Volume</span>
              </div>
              <div class="salary-num">$215,000</div>
              <div class="range-bar-wrapper">
                <div class="range-track">
                  <div class="range-fill fill-purple" style="width: 76%;"></div>
                </div>
                <div class="range-labels">
                  <span>$170k</span>
                  <span>$250k</span>
                </div>
              </div>
            </div>
          </div>

          <div class="skills-row">
            <span class="skill-pill">Solidity</span>
            <span class="skill-pill">Foundry</span>
            <span class="skill-pill">Yul</span>
            <span class="skill-pill">EVM</span>
          </div>
        </div>

        <!-- Role 4 -->
        <div class="salary-card">
          <div>
            <div class="role-header">
              <span class="category-badge amber">L1 Protocols</span>
              <span class="level-text">Infra Core</span>
            </div>
            <div class="role-title">Rust &amp; Distributed Systems</div>
            
            <div class="comp-box">
              <div class="comp-header">
                <span>Median Base</span>
                <span class="tier-tag" style="color: #B45309;">High Demand</span>
              </div>
              <div class="salary-num">$210,000</div>
              <div class="range-bar-wrapper">
                <div class="range-track">
                  <div class="range-fill fill-amber" style="width: 72%;"></div>
                </div>
                <div class="range-labels">
                  <span>$165k</span>
                  <span>$245k</span>
                </div>
              </div>
            </div>
          </div>

          <div class="skills-row">
            <span class="skill-pill">Rust</span>
            <span class="skill-pill">Solana</span>
            <span class="skill-pill">Cosmos</span>
            <span class="skill-pill">Tokio</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div>
        <strong>Jaya Talent Intelligence</strong> &bull; Disclosed Cash Base Compensation
      </div>
      <div>
        Verified Market Data &bull; 10,396 Positions Analyzed
      </div>
    </footer>
  </div>
</body>
</html>
`;

async function render() {
  console.log("🎨 Launching Chromium to render highly readable and aesthetic cards...");
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 780 },
    deviceScaleFactor: 2,
  });

  await page.setContent(html, { waitUntil: "networkidle" });

  const pngPath = join(publicDir, "weekend-intelligence-cards.png");
  const jpgPath = join(publicDir, "weekend-intelligence-cards.jpg");

  await page.screenshot({ path: pngPath, type: "png" });
  await page.screenshot({ path: jpgPath, type: "jpeg", quality: 96 });

  console.log(`✅ Successfully generated refined aesthetic cards:`);
  console.log(`   - ${pngPath}`);
  console.log(`   - ${jpgPath}`);

  await browser.close();
}

render().catch(console.error);
