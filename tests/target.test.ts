import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyTarget } from "./e2e/target.ts";
const ref = "abcdefghijklmnopqrst";
const valid = {
  E2E_SUPABASE_PROJECT_REF: ref,
  NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`,
};
test("accepts explicitly matching project URL", () =>
  assert.equal(verifyTarget(valid), ref));
test("missing project confirmation stops before credentials", () =>
  assert.throws(() =>
    verifyTarget({ ...valid, E2E_SUPABASE_PROJECT_REF: undefined }),
  ));
test("mismatched project stops before credentials", () =>
  assert.throws(() =>
    verifyTarget({
      ...valid,
      E2E_SUPABASE_PROJECT_REF: "zyxwvutsrqponmlkjihg",
    }),
  ));
test("rejects deceptive project hostname", () =>
  assert.throws(() =>
    verifyTarget({
      ...valid,
      NEXT_PUBLIC_SUPABASE_URL: valid.NEXT_PUBLIC_SUPABASE_URL + ".evil.test",
    }),
  ));
test("rejects insecure project URL", () =>
  assert.throws(() =>
    verifyTarget({
      ...valid,
      NEXT_PUBLIC_SUPABASE_URL: valid.NEXT_PUBLIC_SUPABASE_URL.replace(
        "https:",
        "http:",
      ),
    }),
  ));
