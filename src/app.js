// What the app answers, apart from how it's served, so tests can call it directly.

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The UTC calendar date, as `{ iso, text }`, e.g. `2026-11-13` and `Friday, 13 November 2026`. Written by hand so it doesn't depend on the runtime's locale data. */
function formatDate(date) {
  const iso = date.toISOString().slice(0, 10);
  return { iso, text: `${DAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}` };
}

function homePage(now) {
  const { iso, text } = formatDate(now());
  return `<!doctype html><title>Hello</title><h1>Hello</h1><p id="today"><time datetime="${iso}">${text}</time></p>`;
}

/** Every request's answer: `{ status, type, body }`. `now` is the clock, which tests can set. */
export function handle({ method, url, now = () => new Date() }) {
  if (method === "GET" && url === "/health") return { status: 200, type: "application/json", body: JSON.stringify({ status: "ok" }) };
  if (method === "GET" && url === "/") return { status: 200, type: "text/html; charset=utf-8", body: homePage(now) };
  return { status: 404, type: "application/json", body: JSON.stringify({ error: "Not found" }) };
}
