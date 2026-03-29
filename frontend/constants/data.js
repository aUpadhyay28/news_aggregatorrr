import { C } from "./colors";

export const ARTICLES = [
  {
    id: 1,
    category: "Technology",
    time: "12M AGO",
    title: "Quantum Computing Reaches Stability Threshold: The AI Revolution's Next Gear",
    summary: "Researchers achieve 99.9% coherence in room-temperature qubits, effectively doubling the potential processing power for large language models overnight.",
    aiInsight: "This breakthrough reduces error correction overhead by 40%, potentially accelerating AGI development timelines by 18–24 months.",
    img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80",
    hero: true,
    readTime: "6 min",
    sources: 12,
  },
  {
    id: 2,
    category: "Economy",
    time: "2H AGO",
    title: "The Decentralized Shift: Central Banks Weigh AI-Managed Reserves",
    summary: "IMF proposes a framework where AI-driven algorithms rebalance national reserves in real-time to hedge against volatility.",
    aiInsight: "Algorithmic reserve management could reduce currency crises by 34% according to preliminary models.",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    readTime: "4 min",
    sources: 8,
  },
  {
    id: 3,
    category: "Geopolitics",
    time: "4H AGO",
    title: "Arctic Council Suspends Russia; New Trade Corridors Emerge",
    summary: "The suspension reshapes the geopolitical calculus of northern shipping lanes, with Canada and Norway positioning as gatekeepers.",
    aiInsight: "New Arctic routes could cut Asia-Europe shipping time by 30%, creating a $200B annual opportunity by 2030.",
    img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
    readTime: "5 min",
    sources: 15,
  },
  {
    id: 4,
    category: "Climate",
    time: "6H AGO",
    title: "Solar Panel Efficiency Record Shattered at 47.1% in Lab Conditions",
    summary: "A perovskite-silicon tandem cell achieves unprecedented conversion rates, potentially halving the land requirement for utility-scale solar farms.",
    aiInsight: "At scale, this efficiency jump could make solar the cheapest energy source in 140 countries by 2028.",
    img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
    readTime: "3 min",
    sources: 6,
  },
  {
    id: 5,
    category: "Markets",
    time: "8H AGO",
    title: "NVIDIA's H200 Cluster Demand Surges 340% as AI Compute Race Intensifies",
    summary: "Enterprise orders for next-gen GPUs are backlogged by 18 months as hyperscalers scramble to build sovereign AI infrastructure.",
    aiInsight: "Supply bottleneck creates a $90B market opportunity for alternative accelerator manufacturers in 2024.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    readTime: "4 min",
    sources: 9,
  },
];

export const CONVERSATIONS = [
  { id: 1, title: "Geopolitical impact of semiconductors", time: "2 minutes ago", active: true },
  { id: 2, title: "NVIDIA Q4 Earnings Summary", time: "Yesterday", active: false },
  { id: 3, title: "Renewable Energy Infrastructure in Nordics", time: "Jan 12, 2024", active: false },
  { id: 4, title: "Fed rate decision impact on emerging markets", time: "Jan 10, 2024", active: false },
];

export const INITIAL_MESSAGES = [
  {
    role: "user",
    content: "Analyze the current geopolitical impact of semiconductor supply chains on European tech hubs. What are the key risks for 2024?",
  },
  {
    role: "ai",
    title: "European Semiconductor Sovereignty: 2024 Outlook",
    content: "The shift towards \"de-risking\" global supply chains has accelerated. For European tech hubs (Berlin, Eindhoven, Munich), the impact is multi-faceted:",
    cards: [
      { label: "Strategic Autonomy", color: C.primary, text: "The EU Chips Act is driving €43B in investments to double market share to 20% by 2030." },
      { label: "Critical Bottleneck", color: C.tertiary, text: "Heavy reliance on specialized neon and palladium exports from Eastern Europe remains a volatility point." },
    ],
    bullets: [
      { strong: "Talent Concentration:", text: "Massive demand for VLSI engineers in Munich is creating wage-push inflation within local startups." },
      { strong: "Geopolitical Friction:", text: "Export controls on lithography equipment (ASML) are reshaping trade relations with Asia-Pacific markets." },
    ],
    followUps: [
      "How will the US Election impact European subsidies?",
      "Breakdown ASML's revenue by region.",
      "List top 5 AI startups in Berlin specializing in fabless design.",
    ],
  },
];

export const SEARCH_RESULTS = [
  { id: 1, category: "Technology", time: "12M AGO", title: "Quantum Computing Reaches Stability Threshold", summary: "Researchers achieve 99.9% coherence in room-temperature qubits.", relevance: 98, img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&q=80" },
  { id: 2, category: "Markets", time: "2H AGO", title: "NVIDIA's H200 Cluster Demand Surges 340%", summary: "Enterprise orders for next-gen GPUs are backlogged by 18 months.", relevance: 91, img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80" },
  { id: 3, category: "Economy", time: "1D AGO", title: "Semiconductor Export Controls Reshape Global Trade", summary: "New US restrictions on chip equipment exports trigger diplomatic tensions.", relevance: 88, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80" },
  { id: 4, category: "Geopolitics", time: "2D AGO", title: "EU Chips Act: First Facilities Break Ground in Dresden", summary: "TSMC and Intel begin construction on flagship European fabs.", relevance: 84, img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=80" },
];
