const BASE_URL = "http://localhost:8000";

async function request(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${res.status})`);
  }

  return res.json();
}

export function login(username, password) {
  return request("/api/login", { username, password });
}

export function sendMessage(question, history) {
  return request("/api/chat", { question, history });
}
