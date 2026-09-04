import re

with open("src/lib/applicants/constants.ts", "r") as f:
    content = f.read()

categories = [
    "Engineering / Development", "Smart Contracts / Auditing", "Product Management", "Design / UI / UX", 
    "Marketing / PR", "Sales / Business Development", "Operations / Strategy", "Finance / Accounting", 
    "Data / Analytics", "AI / Machine Learning", "Legal / Compliance", "Community / Developer Relations", 
    "HR / Recruiting", "Research / Economics", "Security", "Executive / Leadership", "Other"
]

locations = [
    "Remote", "Worldwide", "North America", "Europe", "Asia", "Africa", "South America", "Oceania",
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Netherlands", "Switzerland", "Singapore",
    "United Arab Emirates (UAE)", "Hong Kong", "Japan", "South Korea", "India", "Brazil", "Argentina", "Mexico", "Nigeria",
    "Kenya", "South Africa", "Portugal", "Spain", "Italy", "Poland", "Ukraine", "Estonia", "Lithuania", "Malta", "Cyprus",
    "Gibraltar", "Cayman Islands", "British Virgin Islands", "Bahamas", "Bermuda", "El Salvador", "Puerto Rico", "Israel",
    "Turkey", "Vietnam", "Philippines", "Indonesia", "Malaysia", "Thailand", "Taiwan", "New Zealand", "Ireland", "Sweden",
    "Norway", "Denmark", "Finland", "Remote - USA", "Remote - EMEA", "Remote - APAC", "Remote - LATAM",
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Armenia", "Austria", "Azerbaijan",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
    "Botswana", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Central African Republic",
    "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Czechia (Czech Republic)",
    "Democratic Republic of the Congo", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "Equatorial Guinea",
    "Eritrea", "Eswatini", "Ethiopia", "Fiji", "Gabon", "Gambia", "Georgia", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "Iran", "Iraq", "Jamaica", "Jordan", "Kazakhstan",
    "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Luxembourg", "Madagascar", "Malawi", "Maldives", "Mali", "Marshall Islands", "Mauritania", "Mauritius", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Nicaragua",
    "Niger", "North Macedonia", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Qatar",
    "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Sudan", "Sri Lanka", "Sudan", "Suriname", "Syria", "Tajikistan", "Tanzania",
    "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkmenistan", "Tuvalu", "Uganda", "Uruguay", "Uzbekistan", "Vanuatu",
    "Vatican City", "Venezuela", "Yemen", "Zambia", "Zimbabwe"
]

titles = [
    "Backend Engineer", "Frontend Engineer", "Full Stack Engineer", "Smart Contract Engineer", "Blockchain Engineer", "Protocol Engineer",
    "Solidity Engineer", "Rust Developer", "Web3 Developer", "DApp Developer", "DevOps Engineer", "Site Reliability Engineer (SRE)",
    "Security Engineer", "Smart Contract Auditor", "Data Scientist", "Data Analyst", "Data Engineer", "Quantitative Analyst", "Quantitative Developer",
    "Machine Learning Engineer", "AI Engineer", "AI Researcher", "Product Manager", "Senior Product Manager", "Technical Product Manager",
    "Project Manager", "Scrum Master", "UI/UX Designer", "Product Designer", "Graphic Designer", "Marketing Manager", "Growth Manager",
    "Community Manager", "Social Media Manager", "Developer Advocate", "Developer Relations (DevRel)", "Technical Writer", "Operations Manager",
    "Chief Operating Officer (COO)", "Chief Executive Officer (CEO)", "Chief Technology Officer (CTO)", "Chief Financial Officer (CFO)",
    "HR Manager", "Talent Acquisition Specialist", "Recruiter", "Legal Counsel", "Compliance Officer", "Business Development Manager",
    "Partnerships Manager", "Sales Manager", "Account Executive", "Sales Representative", "Customer Success Manager", "Customer Support Representative",
    "Financial Analyst", "Accountant", "Trader", "Market Maker", "Liquidity Manager", "Researcher", "Cryptographer", "Economist", "Tokenomics Expert",
    "Quantitative Researcher", "High Frequency Trader", "Options Trader", "Derivatives Trader", "Brand Manager", "Content Marketer", "Copywriter",
    "SEO Specialist", "Event Manager", "Public Relations (PR) Manager", "Head of Growth", "VP of Engineering", "VP of Product", "Chief Marketing Officer (CMO)",
    "Chief Compliance Officer (CCO)", "General Counsel", "Legal Analyst", "KYC/AML Analyst", "Risk Manager", "Venture Capital Analyst", "Investment Associate",
    "Game Developer", "Unity Developer", "Unreal Developer", "3D Artist", "Token Designer", "DeFi Strategist", "Treasury Manager", "Governance Lead",
    "Node Operator", "Validator Engineer", "Infrastructure Engineer", "Release Manager", "QA Engineer", "SDET", "Mobile Engineer (iOS)", "Mobile Engineer (Android)",
    "React Native Developer", "Flutter Developer"
]

skills = [
    "Solidity", "Rust", "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "Docker", "AWS", "AI", "Machine Learning",
    "DeFi", "Smart Contracts", "Go", "Java", "C++", "Kotlin", "Swift", "Next.js", "Vue", "PostgreSQL", "GraphQL", "Kubernetes", "GCP",
    "Azure", "Figma", "Product Management", "Zero Knowledge", "Ethereum", "Solana", "Cairo", "Move", "Data Analysis", "PyTorch", "TensorFlow",
    "LLM", "DevOps", "Security", "Community", "Truffle", "Hardhat", "Ethers.js", "Web3.js", "Vyper", "IPFS", "Arweave", "Substrate", "Polkadot",
    "Cosmos", "CosmWasm", "Chainlink", "The Graph", "ZK-Rollups", "Optimistic Rollups", "StarkNet", "zkSync", "Polygon", "Avalanche",
    "Binance Smart Chain", "NFT", "ERC-20", "ERC-721", "ERC-1155", "DAO", "Tokenomics", "Cryptography", "Distributed Systems", "Clarity",
    "Algorand", "TEAL", "Plutus", "Haskell", "OCaml", "C#", "Unity", "Unreal Engine", "WebGL", "Three.js", "Tailwind CSS", "Svelte", "Angular",
    "MongoDB", "Redis", "Cassandra", "Kafka", "RabbitMQ", "CI/CD", "Terraform", "Ansible", "Prometheus", "Grafana", "Splunk", "Penetration Testing",
    "Smart Contract Auditing", "Slither", "Mythril", "Manticore", "Echidna", "Foundry", "Brownie", "Ganache", "ENS", "WalletConnect",
    "Metamask API", "Phantom API", "DApp Development", "Web3 Integration", "Crypto Trading Bots", "Quantitative Analysis", "GameFi", "SocialFi",
    "RWA (Real World Assets)", "DID (Decentralized Identity)", "AMM", "Yield Farming", "Flash Loans", "DePIN", "B2B Sales", "B2C Sales", 
    "Business Development", "Partnerships", "Lead Generation", "CRM", "Salesforce", "HubSpot", "Marketing Strategy", "Digital Marketing", 
    "Content Marketing", "SEO", "SEM", "Social Media Management", "Copywriting", "Public Relations (PR)", "Event Management", "Growth Hacking",
    "Community Building", "Discord Management", "Telegram Management", "Developer Relations", "Technical Writing", "Project Management", "Agile",
    "Scrum", "Jira", "Notion", "Operations Management", "Financial Modeling", "Accounting", "Excel", "Data Visualization", "Tableau", "Power BI",
    "Legal Writing", "Compliance", "KYC/AML", "Risk Management", "Corporate Law", "Intellectual Property", "Recruiting", "Talent Acquisition",
    "Human Resources", "Employee Onboarding", "Venture Capital", "Investment Research", "Token Design", "Economic Modeling", "Game Design",
    "UI Design", "UX Design", "Wireframing", "Prototyping", "Adobe Creative Suite", "Illustrator", "Photoshop", "3D Modeling", "Blender"
]

def replace_array(content, name, new_list):
    formatted = "[\n  " + ",\n  ".join([f'"{x}"' for x in new_list]) + ",\n] as const"
    if name != "JOB_CATEGORIES":
        formatted = "[\n  " + ",\n  ".join([f'"{x}"' for x in new_list]) + ",\n]"
    pattern = r'(export const ' + name + r'\s*=\s*)\[.*?\](?: as const)?;'
    return re.sub(pattern, r'\g<1>' + formatted + ';', content, flags=re.DOTALL)

content = replace_array(content, "JOB_CATEGORIES", categories)
content = replace_array(content, "SKILL_SUGGESTIONS", skills)
content = replace_array(content, "JOB_TITLE_SUGGESTIONS", titles)
content = replace_array(content, "LOCATION_SUGGESTIONS", locations)

with open("src/lib/applicants/constants.ts", "w") as f:
    f.write(content)

print("Updated constants.ts")
