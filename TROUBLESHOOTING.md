# Supabase Form Persistence Troubleshooting

## Context
Demonstration Project. A Next.js contact form writes fictional data to an isolated Supabase PostgreSQL table. No paid client or production incident is implied.

## Working Baseline
The browser validates Name, Email and Message and sends JSON to a Route Handler. Server validation whitelists the three fields. An anonymous Supabase client awaits INSERT without returning rows. The route checks the database error before confirming success. A separate authorized test runner queries the exact test-owned email and verifies one row with matching values.

## Regression
A controlled one-line change appended `.select()` to INSERT. The intent was to return the newly inserted row for confirmation. The table deliberately permits anonymous writes but no reads. The extra modifier changed the privilege requirements of the same operation.

## Reproduction
Use Node 24, configure your own isolated sandbox, install locked dependencies and build each tagged version. Run the identical primary test:

```sh
npm run test:e2e -- --project desktop --grep 'valid form persists'
```

The baseline passed. The broken version failed at the unchanged HTTP assertion: expected 201, received 503. A separate real browser submission returned the visible error, and an authorized database query found zero matching rows.

## Root Cause
Supabase `.insert()` does not return rows unless requested. Chaining `.select()` requests a representation, which requires SELECT privileges. PostgreSQL rejected the write/return request with `42501` (insufficient privilege). The row was not persisted. This was a query-contract mismatch, not a missing INSERT policy or a reason to weaken RLS.

## Evidence

The broken primary test stops at its HTTP assertion. Its later database assertion is not claimed to have run; the zero-row broken result comes from a separate authorized browser/database probe.
References: `baseline-working` (`167c2b8`), `bug-broken` (`f95fe85`), `bug-fixed` (`3c22cc7`). The whole test tree, migration and application configuration are identical across these tags.

The primary test file SHA-256 is `ce674d4158cc30350c96f0559436a2a97580e44d706c4326094b6b0b608dcea1`.

| Version | Primary test | HTTP | Matching rows |
|---|---|---|---|
| Baseline | PASS | 201 | 1 |
| Broken | FAIL | 503 | 0 |
| Fixed | PASS | 201 | 1 |

## Fix
Removed only `.select()`. The existing awaited INSERT, returned-error check and honest UI feedback remained unchanged. No schema, RLS, grants, dependency, test or helper changes were needed. Independent source audit approved this one-line repair before merge.

## Regression Protection
The primary browser test requires the HTTP success contract, exact success feedback, and one matching persisted row. It compares all three fields and generated metadata. A separate PostgreSQL text-rejection test ensures a real storage failure cannot become false success. Invalid name, email and message are tested in browser and server. Public read/update/delete attempts are rejected.

## Validation
Baseline: 15/15 unit tests; 14/14 E2E across desktop and mobile Chromium emulation; typecheck, lint and production build passed on Node 24.14.1. Mobile emulation is not physical-device or WebKit validation. Fixed and merged main: the same 15/15 unit and 14/14 E2E, typecheck, lint and production build passed. Independent review on a separate machine ran unit, lint, typecheck and build; it did not independently execute cloud E2E. Live browser/database evidence was executed on the implementation station.

## Security
RLS is enabled. Anonymous users can insert only name/email/message, restricted to fictional demo addresses and valid lengths. They cannot select, update, delete, supply IDs or set timestamps. No service-role or management token is used by the application. The test runner requires a project-reference/URL match before accessing credentials and deletes only exact rows belonging to its current fictional test identity. Network traces are disabled and management response bodies are suppressed on errors.

The project is a local demonstration backed by a cloud sandbox, not a publicly deployed service. Cross-request idempotency, internet-facing abuse controls and ambiguous-timeout delivery guarantees are outside its scope. ESLint 9.39.5 is pinned for compatibility with the Next.js React lint plugin; the package is deprecated, and upgrading to ESLint 10 requires compatible upstream tooling.

## References
- [Supabase INSERT](https://supabase.com/docs/reference/javascript/insert)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL INSERT privileges](https://www.postgresql.org/docs/current/sql-insert.html)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
