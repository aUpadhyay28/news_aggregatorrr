const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
});

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getFeed({ hours = 168, limit = 24, source = "all" } = {}) {
    return request(`/api/feed?hours=${hours}&limit=${limit}&source=${encodeURIComponent(source)}`);
  },
  getArticle(articleId) {
    return request(`/api/articles/${encodeURIComponent(articleId)}`);
  },
  search(query, { source = "all", limit = 24 } = {}) {
    return request(`/api/search?q=${encodeURIComponent(query)}&source=${encodeURIComponent(source)}&limit=${limit}`);
  },
  getNotifications(limit = 6) {
    return request(`/api/notifications?limit=${limit}`);
  },
  getProfile() {
    return request("/api/profile");
  },
  updateProfile(profile) {
    return request("/api/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  },
  refreshPipeline({ hours = 72, mode = "quick" } = {}) {
    return request("/api/pipeline/refresh", {
      method: "POST",
      body: JSON.stringify({ hours, mode }),
    });
  },
  chat({ message, articleId }) {
    return request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        article_id: articleId || null,
      }),
    });
  },
};
