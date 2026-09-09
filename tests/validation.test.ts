import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSubmission } from "../src/lib/validation.ts";
const valid = {
  name: "Demo Person",
  email: "demo-unit@example.test",
  message: "A fictional demonstration message.",
};
test("accepts and trims valid fields", () =>
  assert.deepEqual(
    validateSubmission({ ...valid, name: "  Demo Person  " }).data,
    valid,
  ));
for (const [label, value] of [
  ["short name", { name: "A" }],
  ["long name", { name: "a".repeat(81) }],
  ["invalid email", { email: "bad" }],
  ["long email", { email: "a".repeat(255) + "@example.test" }],
  ["short message", { message: "short" }],
  ["long message", { message: "a".repeat(1001) }],
  ["non-string field", { name: 12 }],
] as const) {
  test("rejects " + label, () =>
    assert.ok(
      Object.keys(validateSubmission({ ...valid, ...value }).errors).length,
    ),
  );
}
test("rejects null payload", () =>
  assert.ok(Object.keys(validateSubmission(null).errors).length));
test("discards unknown fields", () =>
  assert.deepEqual(
    validateSubmission({ ...valid, id: "injected", created_at: "yesterday" })
      .data,
    valid,
  ));
