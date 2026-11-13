// Serves the app on $HOST and $PORT, as the Factory's Previews and Visual Evidence expect.
// Each request is logged as one JSON line, and an error is logged with its context, never swallowed.
import { createServer } from "node:http";
import { handle } from "./app.js";

const log = (fields) => process.stdout.write(`${JSON.stringify({ time: new Date().toISOString(), ...fields })}\n`);

const server = createServer((request, response) => {
  const started = performance.now();
  try {
    const { status, type, body } = handle({ method: request.method, url: request.url });
    response.writeHead(status, { "content-type": type }).end(body);
    log({ level: "info", msg: "request", method: request.method, route: request.url, status, durationMs: Math.round(performance.now() - started) });
  } catch (error) {
    log({ level: "error", msg: "request failed", method: request.method, route: request.url, err: String(error?.stack ?? error) });
    // The client is told nothing about the cause.
    response.writeHead(500, { "content-type": "application/json" }).end(JSON.stringify({ error: "Internal Server Error" }));
  }
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";
server.listen(port, host, () => log({ level: "info", msg: "listening", host, port }));
