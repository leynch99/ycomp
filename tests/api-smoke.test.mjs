/**
 * Smoke API tests for critical order/auth flows.
 * Run with: npm run test:smoke
 * Requires dev server: npm run dev (in another terminal)
 */
import { describe, it, before } from "node:test";
import assert from "node:assert";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";

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
  return { status: res.status, ok: res.ok, body };
}

describe("API smoke", () => {
  before(async () => {
    try {
      const res = await fetch(`${BASE}/api/search?q=`);
      if (!res.ok && res.status !== 200) throw new Error("Server not ready");
    } catch (e) {
      console.warn("\n⚠ Server may not be running. Start with: npm run dev\n");
    }
  });

  describe("GET /api/search", () => {
    it("returns 200 and has items array", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/search?q=test`);
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.items));
    });
    it("returns empty items for empty query", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/search?q=`);
      assert.strictEqual(status, 200);
      assert.deepStrictEqual(body.items, []);
    });
    it("returns items with shape: id, name, slug, salePrice, image, matchType", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/search?q=test`);
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.items));
      const validMatchTypes = ["sku_exact", "name_prefix", "name_contains", "brand_contains"];
      for (const item of body.items) {
        assert.ok(typeof item.id === "string", "item.id must be string");
        assert.ok(typeof item.name === "string", "item.name must be string");
        assert.ok(typeof item.slug === "string", "item.slug must be string");
        assert.ok(typeof item.salePrice === "number", "item.salePrice must be number");
        assert.ok(item.image === null || typeof item.image === "string", "item.image must be null or string");
        assert.ok(validMatchTypes.includes(item.matchType), `item.matchType must be one of ${validMatchTypes.join(", ")}`);
      }
    });
    it("exact SKU match ranks higher", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/search?q=test`);
      assert.strictEqual(status, 200);
      if (body.items.length < 2) return;
      const skuExactIdx = body.items.findIndex((i) => i.matchType === "sku_exact");
      const nameIdx = body.items.findIndex((i) => i.matchType === "name_prefix" || i.matchType === "name_contains");
      if (skuExactIdx >= 0 && nameIdx >= 0) {
        assert.ok(skuExactIdx < nameIdx, "sku_exact should rank above name matches");
      }
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 400 for invalid/missing credentials", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: "", password: "" }),
      });
      assert.strictEqual(status, 400);
      assert.ok(body?.error);
    });
    it("returns 400 for nonexistent user", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: "nonexistent@test.ua", password: "wrongpassword" }),
      });
      assert.strictEqual(status, 400);
      assert.ok(body?.error);
    });
  });

  describe("POST /api/auth/register", () => {
    it("returns 400 for invalid phone", async () => {
      const { status } = await fetchJson(`${BASE}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          firstName: "Test",
          lastName: "User",
          phone: "123",
          email: "test@example.com",
          password: "password123",
          confirmPassword: "password123",
        }),
      });
      assert.strictEqual(status, 400);
    });
  });

  describe("POST /api/orders", () => {
    it("returns 400 for empty order", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/orders`, {
        method: "POST",
        body: JSON.stringify({
          items: [],
          name: "Test",
          phone: "+380501234567",
          email: "test@test.ua",
          city: "Київ",
          npBranch: "Відділення №1",
          paymentMethod: "online",
        }),
      });
      assert.strictEqual(status, 400);
      assert.ok(body?.error);
    });
  });

  describe("POST /api/quick-contact", () => {
    it("returns 400 for missing phone/question", async () => {
      const { status } = await fetchJson(`${BASE}/api/quick-contact`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      assert.strictEqual(status, 400);
    });
  });
});
