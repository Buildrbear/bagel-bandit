import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders a complete, account-free game landing screen", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Bagel Bandit/);
  assert.match(html, /Begin the heist/);
  assert.match(html, /WASD \/ ARROWS/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships the complete game loop and submission documentation", async () => {
  const [game, readme, packageJson] = await Promise.all([
    readFile(new URL("app/BagelBandit.tsx", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);
  for (const signal of ["90", "crumbs>=30", "hp:6", 'mode="won"', 'mode="lost"']) assert.match(game, new RegExp(signal.replace(/[>=]/g, "\\$&")));
  assert.match(readme, /Controls|Move:/i);
  assert.match(readme, /Design notes/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
