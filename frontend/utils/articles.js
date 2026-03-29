export const SOURCE_TABS = [
  { label: "All", value: "all" },
  { label: "OpenAI", value: "openai" },
  { label: "Anthropic", value: "anthropic" },
  { label: "YouTube", value: "youtube" },
];

const SOURCE_THEME = {
  OpenAI: {
    gradient: "linear-gradient(135deg, #071a14 0%, #0c4638 45%, #082018 100%)",
    accent: "#7bf0c2",
  },
  Anthropic: {
    gradient: "linear-gradient(135deg, #251108 0%, #5d2b08 50%, #1e0d05 100%)",
    accent: "#ffb783",
  },
  YouTube: {
    gradient: "linear-gradient(135deg, #26090d 0%, #7f1020 48%, #1a0608 100%)",
    accent: "#ff7d8d",
  },
  default: {
    gradient: "linear-gradient(135deg, #0f1229 0%, #303a7a 50%, #121425 100%)",
    accent: "#c0c1ff",
  },
};

export function getArticleTheme(article) {
  return SOURCE_THEME[article?.source] || SOURCE_THEME.default;
}

export function getSourceValue(article) {
  return article?.articleType || "all";
}

export function getArticleShareText(article) {
  return `${article.title}\n${article.summary}\n${article.url}`;
}
