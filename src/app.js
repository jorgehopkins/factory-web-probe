// What the app answers, apart from how it's served, so tests can call it directly.

/** Every request's answer: `{ status, type, body }`. */
export function handle({ method, url }) {
  if (method === "GET" && url === "/health") return { status: 200, type: "application/json", body: JSON.stringify({ status: "ok" }) };
  if (method === "GET" && url === "/") return { status: 200, type: "text/html; charset=utf-8", body: "<!doctype html><title>Hello</title><h1>Hello</h1>" };
  return { status: 404, type: "application/json", body: JSON.stringify({ error: "Not found" }) };
}
