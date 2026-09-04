const ALIASES: Record<string, string> = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  nextjs: "next.js",
  "next.js": "next.js",
  "node.js": "node",
  nodejs: "node",
  node: "node",
  ts: "typescript",
  typescript: "typescript",
  js: "javascript",
  javascript: "javascript",
  "smart contract": "smart contracts",
  "smart contracts": "smart contracts",
  "smart contract development": "smart contracts",
  solidity: "solidity",
  evm: "evm",
  ethereum: "ethereum",
  foundry: "foundry",
  forge: "foundry",
  hardhat: "hardhat",
  rust: "rust",
  solana: "solana",
  anchor: "anchor",
  defi: "defi",
  web3: "web3",
  python: "python",
  aws: "aws",
  docker: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  sql: "sql",
  postgres: "postgresql",
  postgresql: "postgresql",
  golang: "go",
  go: "go",
};

const RELATED: Record<string, Array<{ skill: string; weight: number }>> = {
  react: [
    { skill: "next.js", weight: 0.7 },
    { skill: "javascript", weight: 0.55 },
    { skill: "typescript", weight: 0.6 },
  ],
  "next.js": [{ skill: "react", weight: 0.75 }],
  typescript: [
    { skill: "javascript", weight: 0.6 },
    { skill: "react", weight: 0.4 },
    { skill: "node", weight: 0.45 },
  ],
  javascript: [{ skill: "typescript", weight: 0.6 }],
  solidity: [
    { skill: "smart contracts", weight: 0.85 },
    { skill: "evm", weight: 0.75 },
    { skill: "ethereum", weight: 0.7 },
    { skill: "foundry", weight: 0.55 },
    { skill: "hardhat", weight: 0.5 },
    { skill: "web3", weight: 0.45 },
  ],
  "smart contracts": [
    { skill: "solidity", weight: 0.85 },
    { skill: "evm", weight: 0.7 },
  ],
  evm: [
    { skill: "solidity", weight: 0.75 },
    { skill: "ethereum", weight: 0.7 },
    { skill: "smart contracts", weight: 0.7 },
  ],
  foundry: [
    { skill: "solidity", weight: 0.6 },
    { skill: "smart contracts", weight: 0.5 },
  ],
  rust: [
    { skill: "solana", weight: 0.5 },
    { skill: "anchor", weight: 0.55 },
  ],
  solana: [
    { skill: "rust", weight: 0.55 },
    { skill: "anchor", weight: 0.7 },
    { skill: "web3", weight: 0.4 },
  ],
  anchor: [
    { skill: "solana", weight: 0.75 },
    { skill: "rust", weight: 0.6 },
  ],
  node: [
    { skill: "javascript", weight: 0.5 },
    { skill: "typescript", weight: 0.5 },
  ],
};

export function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9.+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalSkill(value: string) {
  const token = normalizeToken(value);
  if (!token) return "";
  return ALIASES[token] ?? token;
}

export function canonicalSkills(values: string[]) {
  const out: string[] = [];
  for (const value of values) {
    const skill = canonicalSkill(value);
    if (skill && !out.includes(skill)) out.push(skill);
  }
  return out;
}

export function skillSimilarity(applicantSkill: string, jobSkill: string): number {
  const left = canonicalSkill(applicantSkill);
  const right = canonicalSkill(jobSkill);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.9;
  const related = RELATED[left] ?? [];
  const hit = related.find((item) => item.skill === right);
  if (hit) return hit.weight;
  const reverse = (RELATED[right] ?? []).find((item) => item.skill === left);
  if (reverse) return reverse.weight;
  return 0;
}

export function bestSkillMatch(applicantSkills: string[], jobSkill: string) {
  let best = 0;
  let matched = "";
  for (const skill of applicantSkills) {
    const score = skillSimilarity(skill, jobSkill);
    if (score > best) {
      best = score;
      matched = canonicalSkill(skill);
    }
  }
  return { score: best, matched };
}

const CONCEPTS: Array<{ id: string; words: string[] }> = [
  {
    id: "defi",
    words: [
      "defi",
      "amm",
      "amms",
      "dex",
      "decentralized exchange",
      "decentralized exchanges",
      "decentralized finance",
      "decentralized financial",
      "liquidity",
      "protocol",
    ],
  },
  {
    id: "smart-contracts",
    words: ["smart contract", "smart contracts", "solidity", "evm", "foundry"],
  },
  {
    id: "solana",
    words: ["solana", "anchor", "rust program"],
  },
  {
    id: "frontend",
    words: ["frontend", "react", "ui", "user interface"],
  },
];

export function extractConcepts(text: string) {
  const haystack = normalizeToken(text);
  const found: string[] = [];
  for (const concept of CONCEPTS) {
    if (concept.words.some((word) => haystack.includes(normalizeToken(word)))) {
      found.push(concept.id);
    }
  }
  return found;
}

export function conceptOverlap(left: string, right: string) {
  const a = new Set(extractConcepts(left));
  const b = extractConcepts(right);
  if (a.size === 0 || b.length === 0) return 0;
  const hits = b.filter((id) => a.has(id)).length;
  return hits / Math.max(b.length, 1);
}
