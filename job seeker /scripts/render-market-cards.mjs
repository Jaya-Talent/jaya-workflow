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
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    body {
      width: 1280px;
      height: 800px;
      background: #08060F;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 42px 50px 36px 50px;
      position: relative;
      overflow: hidden;
    }

    /* Ambient lighting and atmospheric grid */
    .ambient-glow-1 {
      position: absolute;
      top: -120px;
      right: -80px;
      width: 750px;
      height: 520px;
      background: radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(123, 0, 166, 0.14) 45%, rgba(8, 6, 15, 0) 75%);
      filter: blur(50px);
      z-index: 0;
      pointer-events: none;
    }

    .ambient-glow-2 {
      position: absolute;
      bottom: -150px;
      left: 8%;
      width: 700px;
      height: 480px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(99, 102, 241, 0.1) 40%, rgba(8, 6, 15, 0) 70%);
      filter: blur(60px);
      z-index: 0;
      pointer-events: none;
    }

    .ambient-glow-3 {
      position: absolute;
      top: 35%;
      left: 45%;
      width: 500px;
      height: 350px;
      background: radial-gradient(circle, rgba(236, 72, 153, 0.09) 0%, rgba(8, 6, 15, 0) 65%);
      filter: blur(60px);
      z-index: 0;
      pointer-events: none;
    }

    .grid-mesh {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: 36px 36px;
      mask-image: radial-gradient(ellipse at 50% 50%, black 60%, transparent 95%);
      z-index: 1;
      pointer-events: none;
    }

    /* Outer decorative card border */
    .outer-frame {
      position: absolute;
      inset: 14px;
      border: 1px solid rgba(255, 255, 255, 0.08);
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
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 38px;
      font-weight: 800;
      color: #D8B4FE;
      letter-spacing: -1.2px;
      line-height: 1;
    }

    .logo-pill {
      background: linear-gradient(135deg, #7B00A6 0%, #A855F7 100%);
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-size: 30px;
      font-weight: 800;
      padding: 3px 15px;
      border-radius: 8px;
      transform: skew(-8deg);
      box-shadow: 0 4px 18px rgba(123, 0, 166, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25);
      line-height: 1;
      display: inline-block;
    }

    .header-divider {
      width: 1px;
      height: 32px;
      background: rgba(255, 255, 255, 0.12);
    }

    .intel-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.35);
      padding: 5px 13px;
      border-radius: 6px;
    }

    .intel-badge span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: #E9D5FF;
      text-transform: uppercase;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pulse-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 14px;
      border-radius: 999px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10B981;
    }

    .pulse-badge span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #6EE7B7;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .edition-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 6px 14px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      color: #CBD5E1;
      letter-spacing: 0.8px;
    }

    /* EDITORIAL HEADLINE BANNER */
    .hero-banner {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-top: 2px;
      margin-bottom: 2px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 10px;
    }

    .headline-main {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.6px;
      color: #F8FAFC;
    }

    .headline-main span {
      background: linear-gradient(135deg, #F472B6 0%, #C084FC 50%, #38BDF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .headline-sub {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      color: #94A3B8;
      font-weight: 500;
    }

    /* SECTION 1: MARKET SNAPSHOT */
    .section-block {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .section-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .accent-bar {
      width: 3px;
      height: 14px;
      background: #A855F7;
      border-radius: 2px;
      box-shadow: 0 0 8px #A855F7;
    }

    .section-label-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.4px;
      color: #D8B4FE;
      text-transform: uppercase;
    }

    .section-subtext {
      font-size: 12px;
      color: #94A3B8;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .snapshot-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .stat-card {
      background: rgba(18, 13, 29, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px 18px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2.5px;
    }

    .stat-card.c-snap-purple::before {
      background: linear-gradient(90deg, #A855F7, #EC4899);
    }
    .stat-card.c-snap-cyan::before {
      background: linear-gradient(90deg, #06B6D4, #3B82F6);
    }
    .stat-card.c-snap-violet::before {
      background: linear-gradient(90deg, #8B5CF6, #A855F7);
    }
    .stat-card.c-snap-green::before {
      background: linear-gradient(90deg, #10B981, #14B8A6);
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .stat-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #94A3B8;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stat-icon {
      width: 14px;
      height: 14px;
      opacity: 0.85;
    }

    .mini-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .mini-pill.green {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34D399;
    }

    .mini-pill.purple {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.35);
      color: #C084FC;
    }

    .mini-pill.blue {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #38BDF8;
    }

    .stat-number {
      font-family: 'Outfit', sans-serif;
      font-size: 34px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: -0.8px;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .stat-number.gradient-purple {
      background: linear-gradient(135deg, #FFFFFF 30%, #D8B4FE 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-number.gradient-cyan {
      background: linear-gradient(135deg, #FFFFFF 30%, #7DD3FC 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-number.gradient-violet {
      background: linear-gradient(135deg, #FFFFFF 30%, #C4B5FD 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-number.gradient-green {
      background: linear-gradient(135deg, #FFFFFF 30%, #6EE7B7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-desc {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.3;
    }

    /* SECTION 2: WHAT DOES WEB3 PAY? */
    .salary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .salary-card {
      background: rgba(18, 13, 29, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .salary-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2.5px;
    }

    .salary-card.role-1::before {
      background: linear-gradient(90deg, #F43F5E, #FB7185);
    }
    .salary-card.role-2::before {
      background: linear-gradient(90deg, #38BDF8, #818CF8);
    }
    .salary-card.role-3::before {
      background: linear-gradient(90deg, #A855F7, #C084FC);
    }
    .salary-card.role-4::before {
      background: linear-gradient(90deg, #F59E0B, #FBBF24);
    }

    .role-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .role-category {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 2.5px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .role-category.c-red {
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #FB7185;
    }
    .role-category.c-cyan {
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38BDF8;
    }
    .role-category.c-purple {
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #C084FC;
    }
    .role-category.c-amber {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FBBF24;
    }

    .role-tier {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #64748B;
      font-weight: 600;
    }

    .role-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #F1F5F9;
      line-height: 1.25;
      margin-bottom: 12px;
      height: 36px;
      display: flex;
      align-items: center;
    }

    .salary-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }

    .salary-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }

    .salary-val {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1;
      color: #FFFFFF;
    }

    .salary-val.val-red {
      background: linear-gradient(135deg, #FFFFFF 40%, #FDA4AF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .salary-val.val-cyan {
      background: linear-gradient(135deg, #FFFFFF 40%, #7DD3FC 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .salary-val.val-purple {
      background: linear-gradient(135deg, #FFFFFF 40%, #D8B4FE 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .salary-val.val-amber {
      background: linear-gradient(135deg, #FFFFFF 40%, #FDE68A 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .salary-range-bar-wrap {
      margin-top: 8px;
    }

    .range-track {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
      position: relative;
    }

    .range-fill {
      height: 100%;
      border-radius: 999px;
    }

    .fill-red { background: linear-gradient(90deg, #F43F5E, #FB7185); }
    .fill-cyan { background: linear-gradient(90deg, #38BDF8, #818CF8); }
    .fill-purple { background: linear-gradient(90deg, #A855F7, #C084FC); }
    .fill-amber { background: linear-gradient(90deg, #F59E0B, #FBBF24); }

    .range-labels {
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #64748B;
      margin-top: 4px;
    }

    .tech-stack-row {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .tech-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      color: #94A3B8;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2px 7px;
      border-radius: 4px;
    }

    /* FOOTER */
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 14px;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .footer-source {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748B;
      letter-spacing: 0.4px;
    }

    .footer-source span {
      color: #94A3B8;
      font-weight: 600;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .portal-link {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #C084FC;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(168, 85, 247, 0.08);
      border: 1px solid rgba(168, 85, 247, 0.25);
      padding: 5px 14px;
      border-radius: 6px;
    }

    .arrow-icon {
      color: #E879F9;
    }
  </style>
</head>
<body>
  <div class="ambient-glow-1"></div>
  <div class="ambient-glow-2"></div>
  <div class="ambient-glow-3"></div>
  <div class="grid-mesh"></div>
  <div class="outer-frame"></div>

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
          <span>WEEKEND INTELLIGENCE DESK</span>
        </div>
      </div>

      <div class="header-right">
        <div class="pulse-badge">
          <div class="pulse-dot"></div>
          <span>LIVE MARKET VERIFIED</span>
        </div>
        <div class="edition-tag">SEP 2026 EDITION</div>
      </div>
    </header>

    <!-- HERO EDITORIAL BANNER -->
    <div class="hero-banner">
      <div class="headline-main">
        Web3 Market Snapshot &amp; <span>Salary Benchmarks</span>
      </div>
      <div class="headline-sub">
        10,396 active roles tracked &bull; 350+ verified protocols &bull; Real-time technical compensation index
      </div>
    </div>

    <!-- SECTION 1: MARKET SNAPSHOT -->
    <section class="section-block">
      <div class="section-title-row">
        <div class="section-label">
          <div class="accent-bar"></div>
          <span class="section-label-text">01 &bull; MARKET SNAPSHOT</span>
        </div>
        <span class="section-subtext">Aggregated across 40+ Layer-1/Layer-2 ecosystems &amp; Web3 protocols</span>
      </div>

      <div class="snapshot-grid">
        <!-- Card 1 -->
        <div class="stat-card c-snap-purple">
          <div class="stat-header">
            <span class="stat-tag">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              JOBS TRACKED
            </span>
            <span class="mini-pill purple">+14.2% MoM</span>
          </div>
          <div class="stat-number gradient-purple">10,396</div>
          <div class="stat-desc">Curated open positions currently tracked across high-conviction protocols</div>
        </div>

        <!-- Card 2 -->
        <div class="stat-card c-snap-cyan">
          <div class="stat-header">
            <span class="stat-tag">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              REMOTE ROLES
            </span>
            <span class="mini-pill blue">GLOBAL</span>
          </div>
          <div class="stat-number gradient-cyan">68%</div>
          <div class="stat-desc">7,069 distributed positions with borderless async compensation</div>
        </div>

        <!-- Card 3 -->
        <div class="stat-card c-snap-violet">
          <div class="stat-header">
            <span class="stat-tag">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              VERIFIED PROTOCOLS
            </span>
            <span class="mini-pill purple">HIRING</span>
          </div>
          <div class="stat-number gradient-violet">350+</div>
          <div class="stat-desc">Active employers spanning DeFi, DePIN, AI-Crypto &amp; Rollups</div>
        </div>

        <!-- Card 4 -->
        <div class="stat-card c-snap-green">
          <div class="stat-header">
            <span class="stat-tag">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              MEDIAN BASE PAY
            </span>
            <span class="mini-pill green">CASH ONLY</span>
          </div>
          <div class="stat-number gradient-green">$175,000</div>
          <div class="stat-desc">Benchmark base compensation (excludes equity &amp; token incentives)</div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: WHAT DOES WEB3 PAY? -->
    <section class="section-block">
      <div class="section-title-row">
        <div class="section-label">
          <div class="accent-bar" style="background: #38BDF8; box-shadow: 0 0 8px #38BDF8;"></div>
          <span class="section-label-text">02 &bull; WHAT DOES WEB3 PAY? (BENCHMARK MEDIAN)</span>
        </div>
        <span class="section-subtext">Derived from transparent technical compensation disclosures</span>
      </div>

      <div class="salary-grid">
        <!-- Role 1 -->
        <div class="salary-card role-1">
          <div>
            <div class="role-top">
              <span class="role-category c-red">TRADING &amp; ALPHA</span>
              <span class="role-tier">SENIOR / LEAD</span>
            </div>
            <div class="role-title">Quantitative &amp; MEV Systems</div>
            
            <div class="salary-box">
              <div class="salary-label">
                <span>Median Base</span>
                <span style="color: #FB7185;">Top 5%</span>
              </div>
              <div class="salary-val val-red">$255,000</div>
              <div class="salary-range-bar-wrap">
                <div class="range-track">
                  <div class="range-fill fill-red" style="width: 88%;"></div>
                </div>
                <div class="range-labels">
                  <span>$210k</span>
                  <span>$310k+</span>
                </div>
              </div>
            </div>
          </div>

          <div class="tech-stack-row">
            <span class="tech-pill">C++</span>
            <span class="tech-pill">Rust</span>
            <span class="tech-pill">Python</span>
            <span class="tech-pill">Solidity</span>
          </div>
        </div>

        <!-- Role 2 -->
        <div class="salary-card role-2">
          <div>
            <div class="role-top">
              <span class="role-category c-cyan">CRYPTOGRAPHY</span>
              <span class="role-tier">CORE DEV</span>
            </div>
            <div class="role-title">Zero-Knowledge (ZK) Engineers</div>
            
            <div class="salary-box">
              <div class="salary-label">
                <span>Median Base</span>
                <span style="color: #38BDF8;">High Scarcity</span>
              </div>
              <div class="salary-val val-cyan">$235,000</div>
              <div class="salary-range-bar-wrap">
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

          <div class="tech-stack-row">
            <span class="tech-pill">Circom</span>
            <span class="tech-pill">Halo2</span>
            <span class="tech-pill">Rust</span>
            <span class="tech-pill">Plonky2</span>
          </div>
        </div>

        <!-- Role 3 -->
        <div class="salary-card role-3">
          <div>
            <div class="role-top">
              <span class="role-category c-purple">SMART CONTRACTS</span>
              <span class="role-tier">DEFI &amp; L2</span>
            </div>
            <div class="role-title">Solidity &amp; EVM Architects</div>
            
            <div class="salary-box">
              <div class="salary-label">
                <span>Median Base</span>
                <span style="color: #C084FC;">High Volume</span>
              </div>
              <div class="salary-val val-purple">$215,000</div>
              <div class="salary-range-bar-wrap">
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

          <div class="tech-stack-row">
            <span class="tech-pill">Solidity</span>
            <span class="tech-pill">Foundry</span>
            <span class="tech-pill">Yul</span>
            <span class="tech-pill">EVM</span>
          </div>
        </div>

        <!-- Role 4 -->
        <div class="salary-card role-4">
          <div>
            <div class="role-top">
              <span class="role-category c-amber">L1 PROTOCOLS</span>
              <span class="role-tier">CONSENSUS</span>
            </div>
            <div class="role-title">Rust Systems &amp; Core Infra</div>
            
            <div class="salary-box">
              <div class="salary-label">
                <span>Median Base</span>
                <span style="color: #FBBF24;">High Demand</span>
              </div>
              <div class="salary-val val-amber">$210,000</div>
              <div class="salary-range-bar-wrap">
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

          <div class="tech-stack-row">
            <span class="tech-pill">Rust</span>
            <span class="tech-pill">Solana</span>
            <span class="tech-pill">Cosmos</span>
            <span class="tech-pill">Tokio</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-left">
        <div class="footer-source">
          Source: <span>Jaya Talent Proprietary Index</span> &bull; Updated Weekly &bull; Base Compensation
        </div>
      </div>

      <div class="footer-right">
        <div class="portal-link">
          <span>job.jayatalent.com/weekend-intelligence</span>
          <span class="arrow-icon">&rarr;</span>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>
`;

async function render() {
  console.log("🎨 Launching Chromium to render pixel-perfect Human-Crafted Market Cards...");
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });

  // Render at 2x deviceScaleFactor for 2560x1600 retina clarity
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });

  await page.setContent(html, { waitUntil: "networkidle" });

  const pngPath = join(publicDir, "weekend-intelligence-cards.png");
  const jpgPath = join(publicDir, "weekend-intelligence-cards.jpg");

  await page.screenshot({ path: pngPath, type: "png" });
  await page.screenshot({ path: jpgPath, type: "jpeg", quality: 96 });

  console.log(`✅ Successfully generated high-resolution human-built cards:`);
  console.log(`   - ${pngPath}`);
  console.log(`   - ${jpgPath}`);

  await browser.close();
}

render().catch(console.error);
