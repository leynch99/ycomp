#!/usr/bin/env node
/**
 * Smoke API checks - cross-platform (Node.js).
 * Run: node scripts/smoke-api.mjs
 * Or: npm run test:smoke-api
 */
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const PORT = process.env.TEST_PORT || 3001;
const BASE = `http://localhost:${PORT}`;

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function waitForServer() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE}/api/search?q=`);
      if (res.ok) return true;
    } catch {
      /* ignore */
    }
    await setTimeout(1000);
  }
  return false;
}

async function run() {
  console.log(">> Prisma generate");
  const prisma = spawn("npx", ["prisma", "generate"], {
    stdio: "inherit",
    shell: true,
  });
  await new Promise((resolve, reject) => {
    prisma.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`prisma exit ${code}`))));
  });

  console.log(`>> Starting dev server on port ${PORT}...`);
  const dev = spawn("npm", ["run", "dev", "--", "-p", String(PORT)], {
    stdio: "pipe",
    shell: true,
  });
  dev.stderr?.pipe(process.stderr);
  dev.stdout?.pipe(process.stdout);

  const cleanup = () => {
    dev.kill();
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  console.log(">> Waiting for server...");
  if (!(await waitForServer())) {
    console.error(">> Server failed to start");
    process.exit(1);
  }
  console.log(">> Server ready");

  console.log(">> Running smoke checks...");

  const { status: s1, body: b1 } = await fetchJson(`${BASE}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: "", password: "" }),
  });
  if (s1 !== 400 || b1?.error !== "invalid") {
    console.error(`FAIL: login bad payload expected 400 invalid, got ${s1}`, b1);
    process.exit(1);
  }
  console.log("  OK: login bad payload -> 400 invalid");

  const { status: s2, body: b2 } = await fetchJson(`${BASE}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      firstName: "A",
      lastName: "B",
      phone: "123",
      email: "x@x.com",
      password: "pass1234",
      confirmPassword: "pass1234",
    }),
  });
  if (s2 !== 400 || b2?.error !== "phone_invalid") {
    console.error(`FAIL: register bad phone expected 400 phone_invalid, got ${s2}`, b2);
    process.exit(1);
  }
  console.log("  OK: register bad phone -> 400 phone_invalid");

  const { status: s3, body: b3 } = await fetchJson(`${BASE}/api/orders`, {
    method: "POST",
    body: JSON.stringify({
      items: [],
      name: "T",
      phone: "+380501234567",
      email: "t@t.ua",
      city: "Kyiv",
      npBranch: "N1",
      paymentMethod: "online",
    }),
  });
  if (s3 !== 400 || !b3?.error?.includes("Empty")) {
    console.error(`FAIL: order empty items expected 400 Empty order, got ${s3}`, b3);
    process.exit(1);
  }
  console.log("  OK: order empty items -> 400 Empty order");

  console.log(">> All smoke checks passed");
  cleanup();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
