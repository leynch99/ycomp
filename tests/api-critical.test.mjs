/**
 * API-critical tests: auth, orders (total from DB), admin roles.
 * Run with: npm run test:smoke (or node --test tests/api-critical.test.mjs)
 * Requires: npm run dev + seeded DB (admin@ycomp.ua / admin123)
 */
import { describe, it, before } from "node:test";
import assert from "node:assert";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";

const TEST_ADMIN = { email: "admin@ycomp.ua", password: "admin123" };

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    redirect: "manual",
    ...opts,
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  const cookies = res.headers.get("set-cookie");
  return { status: res.status, ok: res.ok, body, headers: res.headers, cookies };
}

function cookieHeader(cookies) {
  if (!cookies || typeof cookies !== "string") return {};
  const match = cookies.match(/ycomp_session=[^;,\s]+/);
  return match ? { Cookie: match[0] } : {};
}

describe("API critical", () => {
  before(async () => {
    try {
      const res = await fetch(`${BASE}/api/search?q=`);
      if (!res.ok && res.status !== 200) throw new Error("Server not ready");
    } catch (e) {
      console.warn("\n⚠ Server may not be running. Start with: npm run dev");
      console.warn("  Seed DB: npx prisma db seed\n");
    }
  });

  describe("auth/login", () => {
    it("returns 400 for missing email/password", async () => {
      const { status } = await fetchJson(`${BASE}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: "", password: "" }),
      });
      assert.strictEqual(status, 400);
    });
    it("returns 400 for invalid credentials", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: "nonexistent@test.ua", password: "wrong" }),
      });
      assert.strictEqual(status, 400);
      assert.ok(body?.error);
    });
    it("returns 200 and session for valid admin", async () => {
      const { status, body, cookies } = await fetchJson(`${BASE}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: TEST_ADMIN.email, password: TEST_ADMIN.password }),
      });
      assert.strictEqual(status, 200);
      assert.ok(body?.id);
      assert.ok(cookies?.includes("ycomp_session"), "Expected session cookie");
    });
  });

  describe("auth/register", () => {
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
    it("returns 400 for short password", async () => {
      const { status } = await fetchJson(`${BASE}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          firstName: "A",
          lastName: "B",
          phone: "+380501234567",
          email: `test-${Date.now()}@example.com`,
          password: "12345",
          confirmPassword: "12345",
        }),
      });
      assert.strictEqual(status, 400);
    });
    it("returns 400 for duplicate email", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          firstName: "Admin",
          lastName: "User",
          phone: "+380509999999",
          email: TEST_ADMIN.email,
          password: "password123",
          confirmPassword: "password123",
        }),
      });
      assert.strictEqual(status, 400);
      assert.ok(body?.error);
    });
    it("returns 200 for valid registration", async () => {
      const email = `api-test-${Date.now()}@example.com`;
      const { status, body, cookies } = await fetchJson(`${BASE}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          firstName: "Api",
          lastName: "Tester",
          phone: "+380501234500",
          email,
          password: "password123",
          confirmPassword: "password123",
        }),
      });
      assert.strictEqual(status, 200);
      assert.ok(body?.id);
      assert.ok(cookies?.includes("ycomp_session"));
    });
  });

  describe("orders (total from DB only)", () => {
    it("returns 400 for empty items", async () => {
      const { status } = await fetchJson(`${BASE}/api/orders`, {
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
    });
    it("ignores client salePrice and uses DB price for total", async () => {
      const { body: searchBody } = await fetchJson(`${BASE}/api/search?q=Intel`);
      if (!searchBody?.items?.length) {
        console.warn("Skip: no products in search. Run seed.");
        return;
      }
      const product = searchBody.items[0];
      const realPrice = product.salePrice;
      const fakePrice = 1;
      assert.ok(realPrice > fakePrice, "Need product with price > 1");

      const { status, body } = await fetchJson(`${BASE}/api/orders`, {
        method: "POST",
        body: JSON.stringify({
          items: [{
            id: product.id,
            name: product.name,
            sku: "FAKE",
            salePrice: fakePrice,
            qty: 2,
          }],
          name: "Test",
          phone: "+380501234567",
          email: "test@test.ua",
          city: "Київ",
          npBranch: "Відділення №12",
          paymentMethod: "online",
        }),
      });
      assert.strictEqual(status, 200);
      assert.ok(body?.id);
      assert.ok(body?.number);
      const expectedTotal = realPrice * 2;
      const orderRes = await fetch(`${BASE}/api/admin/orders/${body.id}`, {
        headers: cookieHeader((await fetchJson(`${BASE}/api/auth/login`, {
          method: "POST",
          body: JSON.stringify(TEST_ADMIN),
        })).cookies),
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        assert.strictEqual(orderData.order?.total, expectedTotal, `Total must come from DB (expected ${expectedTotal}, client sent ${fakePrice * 2})`);
      }
    });
  });

  describe("admin endpoints (403/200 by role)", () => {
    it("GET /api/admin/banners returns 403 without auth", async () => {
      const { status, body } = await fetchJson(`${BASE}/api/admin/banners`);
      assert.strictEqual(status, 403);
      assert.strictEqual(body?.error, "forbidden");
    });
    it("GET /api/admin/banners returns 403 with user cookie (non-admin)", async () => {
      const email = `nonadmin-${Date.now()}@example.com`;
      const reg = await fetchJson(`${BASE}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          firstName: "U",
          lastName: "Ser",
          phone: "+380501234501",
          email,
          password: "password123",
          confirmPassword: "password123",
        }),
      });
      assert.strictEqual(reg.status, 200);
      const { status, body } = await fetchJson(`${BASE}/api/admin/banners`, {
        headers: cookieHeader(reg.cookies),
      });
      assert.strictEqual(status, 403);
      assert.strictEqual(body?.error, "forbidden");
    });
    it("GET /api/admin/banners returns 200 with admin cookie", async () => {
      const login = await fetchJson(`${BASE}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify(TEST_ADMIN),
      });
      assert.strictEqual(login.status, 200);
      const { status, body } = await fetchJson(`${BASE}/api/admin/banners`, {
        headers: cookieHeader(login.cookies),
      });
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body?.banners));
    });
  });
});
