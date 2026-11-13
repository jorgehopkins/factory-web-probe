import http from 'node:http';
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('factory-web-probe');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Dates are the UTC calendar date, independent of server locale/ICU data.
const formatDate = (d) =>
  `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderPage(date) {
  const iso = date.toISOString().slice(0, 10);
  const human = escapeHtml(formatDate(date));
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>factory-web-probe</title></head>
<body>
<h1>factory-web-probe</h1>
<p id="today"><time datetime="${iso}">${human}</time></p>
</body>
</html>
`;
}

const defaultLog = (entry) => console.log(JSON.stringify({ time: new Date().toISOString(), ...entry }));

export function createApp({ now = () => new Date(), log = defaultLog } = {}) {
  const routes = {
    '/': (res) => {
      const page = renderPage(now());
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(page);
    },
    '/health': (res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{"status":"ok"}');
    },
  };

  return http.createServer((req, res) => {
    const start = process.hrtime.bigint();
    const method = req.method;
    const route = new URL(req.url, 'http://localhost').pathname;

    tracer.startActiveSpan(`${method} ${route}`, (span) => {
      res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        span.setAttribute('http.status_code', res.statusCode);
        span.end();
        log({ level: 'info', msg: 'request', method, route, status: res.statusCode, durationMs });
      });
      try {
        const handler = method === 'GET' ? routes[route] : undefined;
        if (!handler) {
          res.writeHead(404, { 'content-type': 'text/plain' });
          res.end('Not found');
          return;
        }
        handler(res);
      } catch (err) {
        span.recordException(err);
        span.setStatus({ code: SpanStatusCode.ERROR });
        log({ level: 'error', msg: 'request failed', method, route, error: err.message, stack: err.stack });
        if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  });
}
