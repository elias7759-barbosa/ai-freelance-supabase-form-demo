import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { ownTestEmail, rowsFor, cleanup, securityState } from "./database";
function email() {
  return ownTestEmail(`demo-${randomUUID()}@example.test`);
}
async function fill(
  page: Page,
  address: string,
  message = "A fictional message for database verification.",
) {
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("Demo Person");
  await page.getByLabel("Email", { exact: true }).fill(address);
  await page.getByLabel("Message", { exact: true }).fill(message);
}
test("valid form persists exactly once with matching fields and success feedback", async ({
  page,
}, info) => {
  const address = email();
  try {
    await fill(page, address);
    if (
      process.env.CAPTURE_PORTFOLIO === "1" &&
      info.project.name === "desktop"
    ) {
      await mkdir("portfolio/screenshots", { recursive: true });
      await page.screenshot({
        path: "portfolio/screenshots/01-form.png",
        fullPage: true,
      });
    }
    const responsePromise = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/contact") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Send message" }).click();
    expect((await responsePromise).status()).toBe(201);
    await expect(page.getByRole("status")).toHaveText(
      "Message saved successfully. Thank you.",
    );
    const rows = await rowsFor(address);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: "Demo Person",
      email: address,
      message: "A fictional message for database verification.",
    });
    expect(rows[0].id).toMatch(/^[a-f0-9-]{36}$/);
    expect(Date.parse(rows[0].created_at)).not.toBeNaN();
    if (
      process.env.CAPTURE_PORTFOLIO === "1" &&
      info.project.name === "desktop"
    )
      await page.screenshot({
        path: "portfolio/screenshots/02-success.png",
        fullPage: true,
      });
  } finally {
    await cleanup(address);
  }
});
for (const [label, field, value, feedback] of [
  ["invalid name", "Name", "A", "Use 2–80 characters for your name."],
  ["invalid email", "Email", "bad-address", "Enter a valid email address."],
  [
    "short message",
    "Message",
    "short",
    "Use 10–1000 characters for your message.",
  ],
])
  test(`${label} is blocked in browser and by server`, async ({
    page,
    request,
  }) => {
    const address = email();
    try {
      await fill(page, address);
      await page.getByLabel(field, { exact: true }).fill(value);
      let sent = 0;
      page.on("request", (r) => {
        if (r.url().endsWith("/api/contact")) sent++;
      });
      await page.getByRole("button", { name: "Send message" }).click();
      await expect(page.getByText(feedback, { exact: true })).toBeVisible();
      expect(sent).toBe(0);
      const payload = {
        name: "Demo Person",
        email: address,
        message: "A fictional message.",
        [field.toLowerCase()]: value,
      };
      const response = await request.post("/api/contact", { data: payload });
      expect(response.status()).toBe(400);
      expect(await rowsFor(address)).toHaveLength(0);
    } finally {
      await cleanup(address);
    }
  });
test("real PostgreSQL text rejection cannot produce false success", async ({
  page,
}) => {
  const address = email();
  try {
    // U+0000 fits the form length contract but PostgreSQL text cannot store it.
    // This is a real database rejection, not a mocked response or disabled RLS.
    await fill(
      page,
      address,
      "A fictional message with a null character: \u0000 end.",
    );
    const pending = page.waitForResponse((r) =>
      r.url().endsWith("/api/contact"),
    );
    await page.getByRole("button", { name: "Send message" }).click();
    expect((await pending).status()).toBe(503);
    await expect(
      page.getByRole("form", { name: "Contact form" }).getByRole("alert"),
    ).toHaveText("We could not save your message. Please try again.");
    await expect(page.getByRole("status")).toHaveCount(0);
    expect(await rowsFor(address)).toHaveLength(0);
  } finally {
    await cleanup(address);
  }
});
test("RLS and public privileges remain restricted", async () => {
  expect(await securityState()).toEqual([
    {
      rls: true,
      can_insert: true,
      can_select: false,
      can_update: false,
      can_delete: false,
    },
  ]);
  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    "Content-Type": "application/json",
  };
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/demo2_form_submissions";
  for (const method of ["GET", "PATCH", "DELETE"]) {
    const response = await fetch(
      url + "?id=eq.00000000-0000-0000-0000-000000000000",
      {
        method,
        headers,
        ...(method === "PATCH"
          ? { body: JSON.stringify({ name: "Demo Person" }) }
          : {}),
      },
    );
    expect([401, 403]).toContain(response.status);
  }
});
test("mobile and desktop layout remain within the viewport", async ({
  page,
}) => {
  await page.goto("/contact");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeVisible();
});
