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

export const LAST_UPDATED = "06 Sep 2026";

export const dashboardData: Category[] = [
  {
    "num": 1,
    "category": "BD / Sales / Partnerships Jobs",
    "channel": "t.me/web3bds",
    "jobs": [
      {
        "num": 1,
        "company": "Trmlabs",
        "title": "Growth Lead, Consumer Fraud Reporting",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/trm-labs/73b2f6bd-7f59-4378-8b9f-b0921489c8ef",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Iftother",
        "title": "Head of Business Development - Logos",
        "location": "Remote (Worldwide)",
        "link": "https://job-boards.greenhouse.io/iftother/jobs/8152733",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Impossiblecloud",
        "title": "Inside Sales Manager  - Cloud Services",
        "location": "Hamburg",
        "link": "https://jobs.lever.co/impossiblecloud/046c0e1d-afba-4dec-9c85-515b4a1ca15b",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Orderlynetwork",
        "title": "Associate, Ecosystem Growth & BD",
        "location": "China",
        "link": "https://job-boards.greenhouse.io/orderly/jobs/4570542008",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Gauntlet",
        "title": "Business Development, APAC",
        "location": "Singapore / Hong Kong",
        "link": "https://jobs.lever.co/gauntlet/494b0acc-7cfa-4a58-b5dc-c3c914f5d394",
        "date": "06 Sep 2026",
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
        "title": "Senior Market Data Engineer",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8180833?gh_jid=8180833",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Coinbase",
        "title": "Senior Network Engineer",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8179311?gh_jid=8179311",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Coinbase",
        "title": "Senior Software Engineer, Consumer",
        "location": "Remote - Singapore",
        "link": "https://www.coinbase.com/careers/positions/8067033?gh_jid=8067033",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Coinbase",
        "title": "Senior Software Engineer, Core Reliability",
        "location": "Remote - Canada",
        "link": "https://www.coinbase.com/careers/positions/8097944?gh_jid=8097944",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Coinbase",
        "title": "Senior Software Engineer, Data Engineering Platform",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8082199?gh_jid=8082199",
        "date": "06 Sep 2026",
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
        "title": "Senior Enterprise Product  Marketing Manager, Base",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8084049?gh_jid=8084049",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Crypto",
        "title": "Social Media Manager/ Content Creator",
        "location": "United States",
        "link": "https://jobs.lever.co/crypto/ff3dc7ba-662e-4e49-82c2-e6143bb93712",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Polymarket",
        "title": "Polymarket 2026 Summer Internship \u2014 Marketing & Finance",
        "location": "Remote",
        "link": "https://jobs.ashbyhq.com/polymarket/9fbf8f68-5f92-434d-a00b-c79f99f5a10e",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Rain",
        "title": "Product Marketing Manager - Money Movement",
        "location": "New York, NY",
        "link": "https://jobs.ashbyhq.com/rain/6aa4cf9f-58bd-45a5-bce0-e0da60ee7a8a",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Coinmarketcap",
        "title": "Global VP Marketing/CMO",
        "location": "Global",
        "link": "https://jobs.lever.co/coinmarketcap/3badc309-fe0c-41f6-8e78-5236dc331b8c",
        "date": "06 Sep 2026",
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
    "jobs": []
  },
  {
    "num": 6,
    "category": "Trading & Hedge Funds Jobs",
    "channel": "t.me/AlphaHires",
    "jobs": [
      {
        "num": 1,
        "company": "Anchorage",
        "title": "Senior Derivatives Trader",
        "location": "Cayman Islands",
        "link": "https://jobs.lever.co/anchorage/c2b42959-0a4b-4e85-9901-8a875d586902",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Binance",
        "title": "Senior Algorithmic Trader / Liquidity Researcher",
        "location": "Taiwan, Taipei",
        "link": "https://jobs.lever.co/binance/08a7954d-65ed-4c3c-9de6-266fb4cbddbc",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Kappa lab",
        "title": "Quant Trader",
        "location": "London, United Kingdom (Hybrid)",
        "link": "https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/quant-trader-297472/?ref=aHR0cHM6Ly9hcHAuZ29oaXJlLmlvLw==",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Freedx",
        "title": "Business Analyst (Middle / Senior) - Trading Team (CEX)",
        "location": "Remote",
        "link": "https://apply.workable.com/freedx/j/2F76FAD2AA/",
        "date": "06 Sep 2026",
        "notes": "Pre-scraped job from database.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Crypto-finance",
        "title": "Application Manager - Trading",
        "location": "On-site",
        "link": "https://apply.workable.com/crypto-finance/j/B2ADF0BD4D/",
        "date": "06 Sep 2026",
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
        "company": "Gate.io",
        "title": "\u533a\u5757\u94fe\u5f00\u53d1\u5de5\u7a0b\u5e08",
        "location": "APAC-C1",
        "link": "https://jobs.lever.co/gate/4f2aa64b-2252-4c57-8e70-a34f7c71cf63",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Binance",
        "title": "Binance Accelerator Program - Applied Data Scientist",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/ae1a07c1-c971-403c-906b-79d8c16e4f2d",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Gate.io",
        "title": "\u6d4b\u8bd5\u8d1f\u8d23\u4eba",
        "location": "APAC-C1",
        "link": "https://jobs.lever.co/gate/0505a0c2-d2e9-47f5-8400-a7e184b72555",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Gate.io",
        "title": "\u793e\u4ea4\u4ea7\u54c1\u8d1f\u8d23\u4eba",
        "location": "APAC-C1",
        "link": "https://jobs.lever.co/gate/41166281-1fb5-40fd-bd61-a1467d2c0418",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Binance",
        "title": "Binance Accelerator Program - QA",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/2603f3c0-75cb-4d49-b8de-cb4ade0e8b39",
        "date": "06 Sep 2026",
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
        "title": "Risk Manager - Country & Operational Risk",
        "location": "Remote - UK",
        "link": "https://www.coinbase.com/careers/positions/7774051?gh_jid=7774051",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Kraken",
        "title": "Counsel - Regulatory (UK)",
        "location": "United Kingdom",
        "link": "https://jobs.ashbyhq.com/kraken.com/da8b1179-9caa-464c-8eee-395132814f91",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Impossiblecloud",
        "title": "Legal Intern",
        "location": "Hamburg",
        "link": "https://jobs.lever.co/impossiblecloud/fdb042c2-56ae-42b7-82c4-898bc628818f",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Moonpay",
        "title": "Product Counsel",
        "location": "New York - Hybrid",
        "link": "https://jobs.lever.co/moonpay/eb7aeddb-a021-4ab5-9dfc-e74ec143b8de",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Gauntlet",
        "title": "Head of Compliance",
        "location": "New York City / San Francisco / Los Angeles / Remote",
        "link": "https://jobs.lever.co/gauntlet/64f960f1-3ed2-4ad5-aa7c-6e71a3c60aca",
        "date": "06 Sep 2026",
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
        "company": "Ripple",
        "title": "Customer Success Manager",
        "location": "London, UK",
        "link": "https://ripple.com/careers/all-jobs/job/8141304/?gh_jid=8141304",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Ripple",
        "title": "Renewals Manager, EMEA",
        "location": "London, UK",
        "link": "https://ripple.com/careers/all-jobs/job/8179167/?gh_jid=8179167",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Ripple",
        "title": "Senior Manager, Marketing Analytics",
        "location": "New York, NY, United States",
        "link": "https://ripple.com/careers/all-jobs/job/7972221/?gh_jid=7972221",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Ripple",
        "title": "Senior Manager, Software Engineering \u2013 Identity Platform",
        "location": "San Francisco, CA, United States",
        "link": "https://ripple.com/careers/all-jobs/job/8030741/?gh_jid=8030741",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Ripple",
        "title": "Senior Manager, Software Engineering \u2013 Payments Orchestration",
        "location": "San Francisco, CA, United States",
        "link": "https://ripple.com/careers/all-jobs/job/7786549/?gh_jid=7786549",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 11,
    "category": "Dubai Jobs",
    "channel": "t.me/dubaijobscrypto",
    "jobs": [
      {
        "num": 1,
        "company": "Bybit",
        "title": "Senior P2P Risk Strategy Analyst",
        "location": "Abu Dhabi, UAE; Kuala Lumpur, Malaysia",
        "link": "https://job-boards.eu.greenhouse.io/bybit/jobs/4856962101",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 12,
    "category": "Signal Board | all crypto roles",
    "channel": "t.me/+LuTusmxidno1MmQy",
    "jobs": [
      {
        "num": 1,
        "company": "Ripple",
        "title": "Customer Success Manager",
        "location": "London, UK",
        "link": "https://ripple.com/careers/all-jobs/job/8141304/?gh_jid=8141304",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Coinbase",
        "title": "Engineering Manager, Market Data & Analytics",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8179214?gh_jid=8179214",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Kraken",
        "title": "Counsel - Regulatory (UK)",
        "location": "United Kingdom",
        "link": "https://jobs.ashbyhq.com/kraken.com/da8b1179-9caa-464c-8eee-395132814f91",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Fireblocks",
        "title": "Senior Accountant",
        "location": "Tel Aviv-Yafo, Tel Aviv District, Israel",
        "link": "https://www.fireblocks.com/careers/position?gh_jid=4711456006",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Trmlabs",
        "title": "Growth Lead, Consumer Fraud Reporting",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/trm-labs/73b2f6bd-7f59-4378-8b9f-b0921489c8ef",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 13,
    "category": "Tech Job board - general jobs in tech",
    "channel": "t.me/TechJobsme",
    "jobs": [
      {
        "num": 1,
        "company": "Coinbase",
        "title": "Engineering Manager, Market Data & Analytics",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8179214?gh_jid=8179214",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Subzero labs",
        "title": "Engineering Manager",
        "location": "Remote",
        "link": "https://jobs.ashbyhq.com/subzero/f36ca76a-4fca-4ba4-8a67-c4946d6072db",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 14,
    "category": "Crypto Research & Analytics Jobs",
    "channel": "t.me/+FAi6UOcaLNUyMWMy",
    "jobs": [
      {
        "num": 1,
        "company": "Fiber",
        "title": "Business Analytics Strategic Partnerships Tokenisation Manager",
        "location": "Remote",
        "link": "https://web3.career/business-analytics-strategic-partnerships-tokenisation-manager-binance/153663",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
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
        "company": "Trmlabs",
        "title": "Senior International Sales Recruiter, UK/EMEA",
        "location": "United Kingdom",
        "link": "https://jobs.ashbyhq.com/trm-labs/b6994b6a-0b46-4311-b0f6-3b71d9b5ded9",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Binance",
        "title": "Pioneer Talent Program - Applied Data Scientist",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/9d5af64f-be8d-4cbf-a096-5a5a4294afbe",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Whitebit",
        "title": "Talent Programs Manager",
        "location": "Remote",
        "link": "https://whitebit.hurma.work/public-vacancies/1261",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Digital asset",
        "title": "Global Talent Acquisition Coordinator",
        "location": "New York City",
        "link": "https://job-boards.greenhouse.io/digitalassetcorp/jobs/4392277009",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Dragonflycapital",
        "title": "People Ops - Dragonfly Portfolio",
        "location": "New York City \u2022 Hybrid",
        "link": "https://jobs.gem.com/dragonfly-careers/4621670004",
        "date": "06 Sep 2026",
        "notes": "Pre-scraped job from database.",
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
        "company": "Kraken",
        "title": "Platform Product Manager \u2014 Payward Services",
        "location": "Canada",
        "link": "https://jobs.ashbyhq.com/kraken.com/c6298ed5-978b-49ea-8cec-ce90f275d540",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Moonpay",
        "title": "Product Manager, Identity",
        "location": "London - Hybrid",
        "link": "https://jobs.lever.co/moonpay/d9e4fd9d-5b4e-4ba1-b637-a21f9eec54b4",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Bitpanda",
        "title": "Senior Product Manager - Growth, Engagement & Retention",
        "location": "Vienna, Vienna, Austria",
        "link": "https://job-boards.eu.greenhouse.io/bitpanda/jobs/4959025101",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Okx",
        "title": "Principal Product Manager, Affiliate & KOL - Onshore Markets",
        "location": "Hong Kong, Hong Kong SAR; Singapore, Singapore",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7777902003",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Moonpay",
        "title": "Senior Product Manager, KYB - MoonPay Enterprise",
        "location": "London - Hybrid",
        "link": "https://jobs.lever.co/moonpay/91e69ea7-bfc1-4b8a-bbc5-8439bacfcb57",
        "date": "06 Sep 2026",
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
        "title": "Senior Product Designer, Defi",
        "location": "Hong Kong, Hong Kong SAR",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7747651003",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Crypto",
        "title": "Product Designer - Predictions, OG",
        "location": "California",
        "link": "https://jobs.lever.co/crypto/629ce48a-c8ed-4b22-bf29-5b516241e3f9",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Polymarket",
        "title": "Sports Design Lead",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/polymarket/3a42a698-7569-4eb8-9bec-9214c7b51692",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Stellar",
        "title": "Brand Designer",
        "location": "San Francisco",
        "link": "https://jobs.ashbyhq.com/stellar/72644c96-916c-4644-aff3-3382fc4eb0ff",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Symbiotic.fi",
        "title": "Senior Product Designer",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/Symbiotic/ffc40ecb-169d-4027-bd5b-326e5710b897",
        "date": "06 Sep 2026",
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
        "title": "Sr. Systems Analyst, Finance, Enterprise Apps ",
        "location": "Remote - USA",
        "link": "https://www.coinbase.com/careers/positions/8154856?gh_jid=8154856",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Fireblocks",
        "title": "Senior Accountant",
        "location": "Tel Aviv-Yafo, Tel Aviv District, Israel",
        "link": "https://www.fireblocks.com/careers/position?gh_jid=4711456006",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Okx",
        "title": "Senior Finance Analyst ",
        "location": "Sliema, Malta",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7805828003",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Animocabrands",
        "title": "Senior Associate, Accounting",
        "location": "Hong Kong",
        "link": "https://jobs.lever.co/animocabrands/bb994ec6-4017-47ea-8291-224a7358566f",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Xapo",
        "title": "Treasury Manager (Remote - Work from Anywhere)",
        "location": "Gibraltar - Remote",
        "link": "https://job-boards.greenhouse.io/xapo61/jobs/7812568003",
        "date": "06 Sep 2026",
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
        "company": "Polymarket",
        "title": "Fraud Operations Manager",
        "location": "Remote",
        "link": "https://jobs.ashbyhq.com/polymarket/6703b7cd-2b97-4bed-9445-3ab8d74150f0",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Foundation",
        "title": "Customer Success Manager/Lead",
        "location": "San Francisco or Boulder",
        "link": "https://jobs.ashbyhq.com/foundation/e209bb72-3d83-4f74-b8de-6f44773bde6f",
        "date": "06 Sep 2026",
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
        "company": "Crypto",
        "title": "Merchandising Operations Manager - Surface,  OG",
        "location": "San Francisco",
        "link": "https://jobs.lever.co/crypto/ed7f015a-45b0-4072-9bfc-27345a4e8db8",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Trust-wallet",
        "title": "Operations Lead",
        "location": "Remote - Global",
        "link": "https://jobs.ashbyhq.com/trust-wallet/044e897e-1f08-42a2-b6b9-9272e60622f4",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Alpaca",
        "title": "Brokerage Operations Manager - Saudi ",
        "location": "Remote - EMEA",
        "link": "https://job-boards.greenhouse.io/alpaca/jobs/5857441004",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Binance",
        "title": "Binance Accelerator Program - Operations (Web3)",
        "location": "Asia",
        "link": "https://jobs.lever.co/binance/ff9b1c8a-b0de-4bb4-a81e-d2cd51f57e31",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Alpaca",
        "title": "Corporate Operations Lead  ",
        "location": "Remote - North America  and Remote  - EMEA",
        "link": "https://job-boards.greenhouse.io/alpaca/jobs/6172681004",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 26,
    "category": "SF Crypto Jobs",
    "channel": "t.me/+KuA8mS1Rju1hMzcy",
    "jobs": [
      {
        "num": 1,
        "company": "Foundation",
        "title": "Software Engineering",
        "location": "San Francisco, Boulder, or Austin",
        "link": "https://jobs.ashbyhq.com/foundation/2fffc9a2-7e3a-461c-8bb1-675540024014",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 27,
    "category": "NYC Crypto Jobs",
    "channel": "t.me/+ExouurtaF8JjNTli",
    "jobs": [
      {
        "num": 1,
        "company": "Polymarket",
        "title": "Lifecycle Director",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/polymarket/0fe656ba-7e91-466e-ab7a-f719f7f96a1c",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Chainalysis",
        "title": "Deal Desk Manager (Fixed-Term)",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/chainalysis-careers/8d8570f8-17b6-446a-9a3c-c65d5484da63",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Polymarket",
        "title": "Senior Payment Risk Analyst",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/polymarket/62e81b7f-d045-495b-9f36-0c91392870f3",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Polymarket",
        "title": "Senior Data Scientist / Analyst, Product",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/polymarket/ddcc0048-6175-4c9b-847a-ce02e4508377",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Polymarket",
        "title": "Product Lead, Data Licensing",
        "location": "New York",
        "link": "https://jobs.ashbyhq.com/polymarket/f7ece09b-5045-421e-8d7f-1d1b88fd97d8",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 28,
    "category": "London Crypto Jobs",
    "channel": "t.me/+KPy0IcQLBnVlNGYy",
    "jobs": [
      {
        "num": 1,
        "company": "Blockchain",
        "title": "Business Lead",
        "location": "London",
        "link": "https://job-boards.greenhouse.io/blockchain/jobs/8045350",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 29,
    "category": "Swiss Crypto Jobs",
    "channel": "t.me/+TOZl7q7MmwhiNDc6",
    "jobs": [
      {
        "num": 1,
        "company": "Tangem",
        "title": "Web Attribution Analyst",
        "location": "Remote / Zug, Switzerland",
        "link": "https://careers.tangem.com/web-attribution-analyst",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Tangem",
        "title": "UX Writer",
        "location": "Remote / Zug, Switzerland",
        "link": "https://careers.tangem.com/ux-writer",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
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
    "jobs": [
      {
        "num": 1,
        "company": "Sahara ai",
        "title": "Community Manager",
        "location": "Seoul",
        "link": "https://jobs.ashbyhq.com/sahara/ba33f05b-0858-4b5e-92cf-630852b624f1",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
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
        "title": "Backend Engineer, Agent Tools",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/trm-labs/1eff4d33-7cf1-4682-a548-dcc4abd913f3",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 2,
        "company": "Impossiblecloud",
        "title": "Product Manager / Director \u2013 GPU & AI Services",
        "location": "Hamburg",
        "link": "https://jobs.lever.co/impossiblecloud/78255efa-0423-4cf3-9bd8-8229e150616b",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 3,
        "company": "Moonpay",
        "title": "Staff Machine Learning Engineer",
        "location": "London - Hybrid",
        "link": "https://jobs.lever.co/moonpay/a12369da-ded2-4798-b176-b22928e9cf21",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 4,
        "company": "Okx",
        "title": "AI Agent Product Expert (Middleware) ",
        "location": "Hong Kong, Hong Kong SAR",
        "link": "https://job-boards.greenhouse.io/okx/jobs/7731745003",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      },
      {
        "num": 5,
        "company": "Trmlabs",
        "title": "Senior Data Engineer - AI Platform",
        "location": "United States",
        "link": "https://jobs.ashbyhq.com/trm-labs/45e886bf-748d-41cb-9748-258440d12b61",
        "date": "06 Sep 2026",
        "notes": "Direct company job board link.",
        "is_relisted": false
      }
    ]
  },
  {
    "num": 35,
    "category": "Digital Assets Jobs",
    "channel": "t.me/+1v2qJM6gKLZiYWUy",
    "jobs": []
  }
];

export function telegramUrl(channel: string): string {
  const handle = channel.replace(/^https?:\/\//, "").replace(/^t\.me\//, "");
  return `https://t.me/${handle}`;
}

export function totalJobs(categories: Category[]): number {
  return categories.reduce((sum, item) => sum + item.jobs.length, 0);
}
