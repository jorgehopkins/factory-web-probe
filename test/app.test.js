import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

async function start(opts = {}) {
  const logs = [];
  const server = createApp({
    now: () => new Date('2026-11-13T10:00:00Z'),
    log: (entry) => logs.push(entry),
    ...opts,
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { server, base, logs, close: () => new Promise((r) => server.close(r)) };
}

test('page shows a heading with today\'s date directly under it', async () => {
  const { base, close } = await start();
  const res = await fetch(`${base}/`);
  const html = await res.text();
  await close();
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.match(
    html,
    /<h1>[^<]+<\/h1>\s*<p id="today"><time datetime="2026-11-13">Friday, 13 November 2026<\/time><\/p>/,
  );
});

test('date follows the clock', async () => {
  const { base, close } = await start({ now: () => new Date('2027-01-02T00:00:00Z') });
  const html = await (await fetch(`${base}/`)).text();
  await close();
  assert.match(html, /datetime="2027-01-02">Saturday, 2 January 2027</);
});

test('requests are logged with method, route, status and duration', async () => {
  const { base, logs, close } = await start();
  await fetch(`${base}/`);
  await close();
  const entry = logs.find((l) => l.route === '/');
  assert.equal(entry.method, 'GET');
  assert.equal(entry.status, 200);
  assert.equal(typeof entry.durationMs, 'number');
});

test('health endpoint answers 200', async () => {
  const { base, close } = await start();
  const res = await fetch(`${base}/health`);
  await close();
  assert.equal(res.status, 200);
});

test('unknown route is 404', async () => {
  const { base, close } = await start();
  const res = await fetch(`${base}/nope`);
  await close();
  assert.equal(res.status, 404);
});

test('errors are logged with context and clients see no stack trace', async () => {
  const { base, logs, close } = await start({
    now: () => {
      throw new Error('boom');
    },
  });
  const res = await fetch(`${base}/`);
  const body = await res.text();
  await close();
  assert.equal(res.status, 500);
  assert.doesNotMatch(body, /boom|at .*\.js/);
  const err = logs.find((l) => l.level === 'error');
  assert.equal(err.route, '/');
  assert.match(err.stack, /boom/);
  assert.equal(logs.find((l) => l.status === 500).method, 'GET');
});
