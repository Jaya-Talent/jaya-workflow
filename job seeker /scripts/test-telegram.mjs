#!/usr/bin/env node
import { readDotEnv, projectRoot } from "./with-app-env.mjs";

const env = { ...readDotEnv(projectRoot()), ...process.env };
const token = env.TELEGRAM_BOT_TOKEN?.trim();

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set in .env!");
  process.exit(1);
}

async function main() {
  console.log("🔍 Testing Telegram Bot connection...");
  
  // 1. Verify Bot Token
  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const meData = await meRes.json();
  
  if (!meData.ok) {
    console.error("❌ Telegram token invalid:", meData.description);
    process.exit(1);
  }
  
  console.log(`✅ Bot Authenticated: @${meData.result.username} (${meData.result.first_name})`);

  // 2. Check for Chat ID argument
  const targetChatId = process.argv[2];
  
  if (!targetChatId) {
    console.log("\n📲 To send a test message to your Telegram:");
    console.log(`1. Open Telegram and search for your bot: @${meData.result.username}`);
    console.log("2. Tap Start or send a message to it.");
    console.log("3. Run: npm run test:telegram <YOUR_TELEGRAM_CHAT_ID>");
    console.log("   (Or open https://api.telegram.org/bot" + token + "/getUpdates to see your chat ID)");
    return;
  }

  console.log(`\n🚀 Sending mock Web3 job match notification to chat ID: ${targetChatId}...`);

  const sampleMessage = {
    chat_id: targetChatId,
    text: [
      "🚨 94% Match — Senior Rust & Solana Core Engineer",
      "🏢 Monad Labs / Solana Foundation",
      "🌍 Remote (Worldwide)",
      "💰 USD 180,000 – 240,000 + Token Grants",
      "🧑‍💻 Senior",
      "",
      "Why you match:",
      "✅ Rust / Smart Contracts",
      "✅ High-throughput consensus",
      "✅ Distributed Systems",
      "",
      "Match: 94% · Top Web3 Match (Jaya Talent)",
    ].join("\n"),
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🚀 Apply Now", url: "https://job.jayatalent.com/jobs" },
          { text: "💾 Save", callback_data: "save:sample" },
        ],
        [{ text: "👎 Not Relevant", callback_data: "no:sample" }],
      ],
    },
  };

  const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sampleMessage),
  });

  const sendData = await sendRes.json();
  if (sendData.ok) {
    console.log("🎉 SUCCESS! Test notification sent to Telegram. Check your phone/app!");
  } else {
    console.error("❌ Failed to send message:", sendData.description);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
