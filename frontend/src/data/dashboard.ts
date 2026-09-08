export type Job = {
  num: number;
  company: string;
  title: string;
  location: string;
  link: string;
  date: string;
  notes: string;
  is_relisted?: boolean;
};

export type Category = {
  num: number;
  category: string;
  channel: string;
  jobs: Job[];
};

export const LAST_UPDATED = "08 Sep 2026";

export const dashboardData: Category[] = [
  {
    "num": 1,
    "category": "BD / Sales / Partnerships Jobs",
    "channel": "t.me/web3bds",
    "jobs": [
      {
        "num": 1,
        "company": "Trmlabs",
        "title": "Business Development Executive, Public Sector (Europe)",
        "location": "United Kingdom",
        "link": "https://jobs.ashbyhq.com/trm-labs/fa2669bc-c77f-42a3-bae5-2c71d16ecca5",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Impossiblecloud",
        "title": "Sales Development Representative (Cloud Services)",
        "location": "Hamburg",
        "link": "https://jobs.lever.co/impossiblecloud/93b2b790-f749-4aa8-9896-813643c2edc9",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Gauntlet",
        "title": "Business Development, US",
        "location": "New York City / San Francisco / Los Angeles / Remote",
        "link": "https://jobs.lever.co/gauntlet/cb1aba05-e9fb-4294-8c2f-865fbeaf04e9",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Blockchain",
        "title": "Affiliate & Growth Networks Specialist",
        "location": "Singapore",
        "link": "https://job-boards.greenhouse.io/blockchain/jobs/8083268",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Bitgo",
        "title": "Business Development Representative - MENA (Cyprus or Israel)",
        "location": "Remote",
        "link": "https://job-boards.greenhouse.io/bitgo/jobs/8534706002",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 2,
    "category": "Developers Jobs",
    "channel": "t.me/web3devs3",
    "jobs": [
      {
        "num": 1,
        "company": "Coinbase",
        "title": "Senior Software Engineer, Data Layer",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8064873?gh_jid=8064873",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Coinbase",
        "title": "Senior Software Engineer - Frontend - Coinbase Card team",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8088201?gh_jid=8088201",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Coinbase",
        "title": "Senior Software Engineer, Simple Trade Experience",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8103569?gh_jid=8103569",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Coinbase",
        "title": "Senior Software Engineer, Stablecoins",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8104873?gh_jid=8104873",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Coinbase",
        "title": "Senior Software Engineer - Trading",
        "location": "Remote - Singapore",
        "link": "https://www.coinbase.com/careers/positions/7866674?gh_jid=7866674",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 3,
    "category": "Marketing Jobs",
    "channel": "t.me/marketersjobs",
    "jobs": [
      {
        "num": 1,
        "company": "Coinbase",
        "title": "Senior Internal Communications Manager, People",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8162914?gh_jid=8162914",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Kraken",
        "title": "Marketing Manager, CRM Operations ",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/kraken.com/3bd70487-d97d-47f1-b6f7-7700c17b3bd4",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Coinmarketcap",
        "title": "Senior Marketing Specialist",
        "location": "Global",
        "link": "https://jobs.lever.co/coinmarketcap/b71b07d0-5a27-4101-b30d-ea442a2e096f",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Polymarket",
        "title": "Performance Marketing Lead, International",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/polymarket/e6fc54f3-339e-4196-a221-53e8d7c2049f",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Windranger",
        "title": "Mantle Squad US \u2013 Marketing & Growth",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/windranger/83df91bb-55ba-4f01-b586-659f2c2c5172",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 4,
    "category": "Crypto Jobs in Indonesia - Bali",
    "channel": "t.me/jobsindonesiaa",
    "jobs": []
  },
  {
    "num": 5,
    "category": "C-Level / Executive Jobs",
    "channel": "t.me/+FPxA5a5gdlQ3MTY6",
    "jobs": [
      {
        "num": 1,
        "company": "Bitpanda",
        "title": "Intern, CEO Office",
        "location": "Vienna, Vienna, Austria",
        "link": "https://job-boards.eu.greenhouse.io/bitpanda/jobs/4959756101",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 6,
    "category": "Trading & Hedge Funds Jobs",
    "channel": "t.me/AlphaHires",
    "jobs": [
      {
        "num": 1,
        "company": "Anchorage",
        "title": "Trading Operations Team Lead",
        "location": "United States",
        "link": "https://jobs.lever.co/anchorage/b3c332bc-ffc5-4a2f-ab3e-de136d326408",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Binance",
        "title": "Senior Data Analyst, Trading",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/e92d8b5f-0f0a-4569-884f-4f45c8ad024c",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Freedx",
        "title": "Senior Trading Behavior & Flow Risk Analyst",
        "location": "Remote",
        "link": "https://apply.workable.com/freedx/j/53837BBE09/",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Robinhood",
        "title": "Customer Experience Representative, Active Trader",
        "location": "Chicago, IL; Denver, CO; Westlake, TX",
        "link": "https://boards.greenhouse.io/robinhood/jobs/8011599?gh_src=NaN&gh_jid=8011599",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Freedx",
        "title": "Python Trading Research Analyst",
        "location": "Remote",
        "link": "https://apply.workable.com/freedx/j/C5153916B3/",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 7,
    "category": "Singapore / APAC Crypto Jobs",
    "channel": "t.me/+n3TE8PhdosQ1YTcy",
    "jobs": [
      {
        "num": 1,
        "company": "Binance",
        "title": "Binance Accelerator Program - Research Data Scientist",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/ca44ee4e-392b-4745-9ad9-8e287f5a6d37",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Binance",
        "title": "Binance Accelerator Program - Research On Chain Data Analyst",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/fb9d588a-e49e-4496-a464-9c6c5cc4ca46",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Binance",
        "title": "Business Analytics & Strategic Partnerships (Tokenisation) Manager",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/281f252b-ad90-45e1-b8f2-eca5e8c1a8e9",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Binance",
        "title": "Business Intelligence/ Data Analystics",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/e2cec219-a165-4baa-bb22-33be2e2f3063",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Binance",
        "title": "Chief Information Security Officer (Korea)",
        "location": "South Korea, Seoul",
        "link": "https://jobs.lever.co/binance/0400c0b4-c07e-42c5-a000-205995dcd8ef",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 8,
    "category": "Hong Kong Crypto Jobs",
    "channel": "t.me/+cEVjTA5HfhhmZDNi",
    "jobs": []
  },
  {
    "num": 9,
    "category": "Compliance / Legal Jobs",
    "channel": "t.me/compliancejobs",
    "jobs": [
      {
        "num": 1,
        "company": "Coinbase",
        "title": "SAM Compliance Lead Analyst",
        "location": "Hybrid - Luxembourg",
        "link": "https://www.coinbase.com/careers/positions/8052192?gh_jid=8052192",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Kraken",
        "title": "Internal Audit Financial Crime & Conduct Manager",
        "location": "United Kingdom",
        "link": "https://jobs.ashbyhq.com/kraken.com/042f0568-49a6-4c25-b7a2-c578844b1e2f",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Blockchain",
        "title": "Compliance Analytics Associate ",
        "location": "Buenos Aires",
        "link": "https://job-boards.greenhouse.io/blockchain/jobs/8155035",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Bitgo",
        "title": "Associate General Counsel",
        "location": "Singapore",
        "link": "https://job-boards.greenhouse.io/bitgo/jobs/8627534002",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Coinbase",
        "title": "Senior Analyst, Compliance Technology",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8067443?gh_jid=8067443",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 10,
    "category": "Stablecoin Jobs",
    "channel": "t.me/+gYai1mbLnIA5ODUy",
    "jobs": [
      {
        "num": 1,
        "company": "Circle",
        "title": "Principal Product Manager, TradFi",
        "location": "US",
        "link": "https://careers.circle.com/us/en/job/JR100881/Principal-Product-Manager-TradFi",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Circle",
        "title": "VP Of Ecosystem Growth, Pakistan",
        "location": "undefined:, Pakistan",
        "link": "https://careers.circle.com/us/en/job/JR101031/VP-of-Ecosystem-Growth-Pakistan",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Circle",
        "title": "Distinguished Software Engineer",
        "location": "US",
        "link": "https://careers.circle.com/us/en/job/JR100849/Distinguished-Software-Engineer",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Circle",
        "title": "Senior Staff Data Engineer",
        "location": "US",
        "link": "https://careers.circle.com/us/en/job/JR101020/Senior-Staff-Data-Engineer",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Circle",
        "title": "VP, Global Head Of Product Security And Risk",
        "location": "US",
        "link": "https://careers.circle.com/us/en/job/JR100878/VP-Global-Head-of-Product-Security-and-Risk",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 11,
    "category": "Dubai Jobs",
    "channel": "t.me/dubaijobscrypto",
    "jobs": []
  },
  {
    "num": 12,
    "category": "Signal Board | all crypto roles",
    "channel": "t.me/+LuTusmxidno1MmQy",
    "jobs": [
      {
        "num": 1,
        "company": "Coinbase",
        "title": "SAM Compliance Lead Analyst",
        "location": "Hybrid - Luxembourg",
        "link": "https://www.coinbase.com/careers/positions/8052192?gh_jid=8052192",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Circle",
        "title": "Principal Product Manager, TradFi",
        "location": "US",
        "link": "https://careers.circle.com/us/en/job/JR100881/Principal-Product-Manager-TradFi",
        "date": "08 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Kraken",
        "title": "Marketing Manager, CRM Operations ",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/kraken.com/3bd70487-d97d-47f1-b6f7-7700c17b3bd4",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Trmlabs",
        "title": "Business Development Executive, Public Sector (Europe)",
        "location": "United Kingdom",
        "link": "https://jobs.ashbyhq.com/trm-labs/fa2669bc-c77f-42a3-bae5-2c71d16ecca5",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Impossiblecloud",
        "title": "Sales Development Representative (Cloud Services)",
        "location": "Hamburg",
        "link": "https://jobs.lever.co/impossiblecloud/93b2b790-f749-4aa8-9896-813643c2edc9",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 13,
    "category": "Tech Job board - general jobs in tech",
    "channel": "t.me/TechJobsme",
    "jobs": []
  },
  {
    "num": 14,
    "category": "Crypto Research & Analytics Jobs",
    "channel": "t.me/+FAi6UOcaLNUyMWMy",
    "jobs": []
  },
  {
    "num": 15,
    "category": "For Founders: Hiring Tips by Jaya Talent",
    "channel": "t.me/iamfuckingceo",
    "jobs": []
  },
  {
    "num": 16,
    "category": "KOL Jobs",
    "channel": "t.me/+epk8zFJx3mM5ODE6",
    "jobs": []
  },
  {
    "num": 17,
    "category": "Japan Digital Assets Jobs",
    "channel": "t.me/japanjobss",
    "jobs": []
  },
  {
    "num": 18,
    "category": "Private Equity Jobs",
    "channel": "t.me/privateequityjobs",
    "jobs": []
  },
  {
    "num": 19,
    "category": "HR & Talent Acquisition Jobs",
    "channel": "t.me/web3headhunters",
    "jobs": [
      {
        "num": 1,
        "company": "Binance",
        "title": "HR Business Partner",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/d3bd1209-bce1-45af-80dc-17d03159c019",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Binance",
        "title": "Pioneer Talent Program - Research Data Scientist",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/efa6ff12-8332-4e08-b587-e88f7ea68177",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Binance",
        "title": "Senior Talent Acquisition Operations Specialist (Contract)",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/f5e9f843-fa64-40c8-af06-1f1a58943897",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Binance",
        "title": "Senior Talent Acquisition Specialist (Technical and Product)",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/a1124a16-3dfe-4547-b0e9-90aa402ebfde",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Binance",
        "title": "Talent Acquisition Specialist",
        "location": "UAE, Dubai",
        "link": "https://jobs.lever.co/binance/89670300-3ec1-438d-b7b4-ff59441c03af",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 20,
    "category": "Product & Project Jobs",
    "channel": "t.me/productjobscrypto",
    "jobs": [
      {
        "num": 1,
        "company": "Bitpanda",
        "title": "Senior Product Manager \u2013 Securities & Commodities",
        "location": "Vienna, Vienna, Austria",
        "link": "https://job-boards.eu.greenhouse.io/bitpanda/jobs/4954725101",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Crypto",
        "title": "Senior Product Manager - Exchange, Trading",
        "location": "United States",
        "link": "https://jobs.lever.co/crypto/fbb256a2-46a3-41b7-942d-5ba87018c0dc",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Bastion",
        "title": "Product Manager",
        "location": "US Remote",
        "link": "https://jobs.ashbyhq.com/Bastion/04a403af-fcae-4e10-9960-b9970243a4aa",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Okx",
        "title": "Principal Product Manager, Growth",
        "location": "San Jose, California, United States",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7713617003",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Crypto",
        "title": "Senior Product Manager - Predictions, OG",
        "location": "San Francisco",
        "link": "https://jobs.lever.co/crypto/f6a19e4d-1150-476a-8566-ea0e7f2fd96a",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 21,
    "category": "Designer Jobs",
    "channel": "t.me/web3designerjobs",
    "jobs": [
      {
        "num": 1,
        "company": "Okx",
        "title": "Senior Product Designer, Wallets",
        "location": "Hong Kong, Hong Kong SAR",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7985087003",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Polymarket",
        "title": "Creative Ops Lead",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/polymarket/031c38a6-3c76-4440-8569-b070c744d9a9",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Binance",
        "title": "Binance Accelerator Program - Graphic Design (MENA)",
        "location": "UAE, Dubai",
        "link": "https://jobs.lever.co/binance/3785f1c4-3d3a-494a-9d0b-51e68f84ac08",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Alpaca",
        "title": "Senior Graphic Designer",
        "location": "Remote - North America",
        "link": "https://job-boards.greenhouse.io/alpaca/jobs/5744207004",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Asterdex",
        "title": "Creative Designer",
        "location": "APAC",
        "link": "https://jobs.lever.co/pioneer-services/d9ad7005-3b50-44de-ba62-d4ce48c3c907",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 22,
    "category": "VC / Investment Jobs",
    "channel": "t.me/web3vcjobs",
    "jobs": []
  },
  {
    "num": 23,
    "category": "Finance \u00b7 CFO \u00b7 Treasury Jobs",
    "channel": "t.me/+I28fCco1oV1jMjFi",
    "jobs": [
      {
        "num": 1,
        "company": "Coinbase",
        "title": "Strategic Finance Manager, Platform",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8148248?gh_jid=8148248",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Crypto",
        "title": "Assistant Financial Controller",
        "location": "Chicago,IL",
        "link": "https://jobs.lever.co/crypto/bf231bb5-1c89-481a-b856-29771cdf5656",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Okx",
        "title": "Senior Finance Manager - Group Consolidation",
        "location": "Singapore, Singapore",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7802200003",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Solanafoundation",
        "title": "Senior Accountant, Financial Operations",
        "location": "Remote-International",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/e9a5aba3-4b4d-4635-b26a-57b7d4591dfd",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Crypto",
        "title": "Assistant Manager, Financial and Management Reporting",
        "location": "Hong Kong",
        "link": "https://jobs.lever.co/crypto/b8182b66-c109-4a81-a091-ca00ccd7201c",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 24,
    "category": "Customer Support \u00b7 Trust & Safety",
    "channel": "t.me/+4vaSF4Pa9y1iMzJi",
    "jobs": [
      {
        "num": 1,
        "company": "Bitpanda",
        "title": "Associate, Customer Support - Live chat ",
        "location": "Vienna, Vienna, Austria",
        "link": "https://job-boards.eu.greenhouse.io/bitpanda/jobs/4969789101",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 25,
    "category": "Operations \u00b7 COO \u00b7 Chief of Staff",
    "channel": "t.me/+_SCikTdlBJU2MjAy",
    "jobs": [
      {
        "num": 1,
        "company": "Binance",
        "title": "Binance Accelerator Program - Product Operations (Earn & TradFi)",
        "location": "Hong Kong",
        "link": "https://jobs.lever.co/binance/77d4c5cf-a604-454f-9e35-79d5ce32c318",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Alpaca",
        "title": "Crypto Operations Associate - APAC",
        "location": "Remote - Anywhere ",
        "link": "https://job-boards.greenhouse.io/alpaca/jobs/4431262004",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Hyperbolic",
        "title": "GTM (Operations)",
        "location": "Remote",
        "link": "https://jobs.ashbyhq.com/hyperbolic/51206c65-0350-4b22-8340-e86f70debb70",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Binance",
        "title": "Operational Risk / Enterprise Risk Management Framework (ERMF) Specialist",
        "location": "Hong Kong",
        "link": "https://jobs.lever.co/binance/744cb1d2-2f53-4819-8b5f-ef82a4460776",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Binance",
        "title": "Operations Analyst - Brazil",
        "location": "Brazil, Sao Paulo",
        "link": "https://jobs.lever.co/binance/1b148889-f898-4579-84f7-dbccfa5fee4a",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 26,
    "category": "SF Crypto Jobs",
    "channel": "t.me/+KuA8mS1Rju1hMzcy",
    "jobs": []
  },
  {
    "num": 27,
    "category": "NYC Crypto Jobs",
    "channel": "t.me/+ExouurtaF8JjNTli",
    "jobs": [
      {
        "num": 1,
        "company": "Okx",
        "title": "Workplace IT Specialist",
        "location": "New York, United States",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7808492003",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Polymarket",
        "title": "Senior Data Scientist / Analyst, Institutional",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/polymarket/4bcdc897-3126-4d8e-ba8a-d398255cad6e",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Chainalysis",
        "title": "Senior People Systems & Integrations Analyst",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/chainalysis-careers/f28e555e-ba54-4ea5-a41b-4c534438d019",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Meshpay",
        "title": "Head of Forward Deployed Engineering",
        "location": "New York, NY",
        "link": "https://job-boards.greenhouse.io/mesh/jobs/5380179008",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Rwa.xyz",
        "title": "Senior Research Analyst",
        "location": "New York City",
        "link": "https://jobs.ashbyhq.com/RWA.xyz/b3b035a7-3067-4639-998b-863476b22ae3",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 28,
    "category": "London Crypto Jobs",
    "channel": "t.me/+KPy0IcQLBnVlNGYy",
    "jobs": []
  },
  {
    "num": 29,
    "category": "Swiss Crypto Jobs",
    "channel": "t.me/+TOZl7q7MmwhiNDc6",
    "jobs": []
  },
  {
    "num": 30,
    "category": "India Crypto Jobs",
    "channel": "t.me/+6YoGHP7FLyRjZDgy",
    "jobs": []
  },
  {
    "num": 31,
    "category": "Latam Crypto Jobs",
    "channel": "t.me/+EJRVUtvGKjAwODU6",
    "jobs": []
  },
  {
    "num": 32,
    "category": "Community Manager Jobs",
    "channel": "t.me/+b3phRT_N51M5NWIy",
    "jobs": []
  },
  {
    "num": 33,
    "category": "DevRel Jobs",
    "channel": "t.me/+EdL0eIFUvIw5Yjdi",
    "jobs": []
  },
  {
    "num": 34,
    "category": "AI x Web3 Jobs",
    "channel": "t.me/+hrGsMucd6s5mN2Ey",
    "jobs": [
      {
        "num": 1,
        "company": "Trmlabs",
        "title": "Staff Data Engineer - AI Platform",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/trm-labs/74fc12c1-be22-496e-812d-1316276c91e8",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Okx",
        "title": "AI Agent Security Research Engineer",
        "location": "APAC; Hong Kong, Hong Kong SAR; Singapore, Singapore",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7650023003",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Trmlabs",
        "title": "Data Platform Engineer - AI Platform",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/trm-labs/2a784630-702d-4b49-a033-5cbd0d9c8a94",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Trmlabs",
        "title": "Senior Data Platform Engineer - AI Platform",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/trm-labs/cf1c3e90-d709-4a64-825f-7c0f0768965a",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Trmlabs",
        "title": "Staff Data Platform Engineer - AI Platform",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/trm-labs/a1ed36fb-8be9-40a9-8452-5641996130c3",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 35,
    "category": "Digital Assets Jobs",
    "channel": "t.me/+1v2qJM6gKLZiYWUy",
    "jobs": [
      {
        "num": 1,
        "company": "Binance",
        "title": "Treasury Asset Management",
        "location": "Hong Kong",
        "link": "https://jobs.lever.co/binance/c3d1aa01-9df6-4778-953f-9320b995a791",
        "date": "08 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  }
];

export function telegramUrl(channel: string): string {
  const handle = channel.replace(/^https?:\/\//, "").replace(/^t\.me\//, "");
  return `https://t.me/${handle}`;
}

export function totalJobs(categories: Category[]): number {
  return categories.reduce((sum, item) => sum + item.jobs.length, 0);
}
