# Supabase Form Persistence Fix

**Problem:** Valid contact-form submissions failed to persist after a query change.

**Diagnosis:** Traced browser submission through server validation to PostgreSQL. An unchanged browser/database test passed at baseline, failed in the controlled regression, and passed after repair.

**Root Cause:** Returning rows from an INSERT required SELECT privileges that the write-only table intentionally denied.

**Fix:** Removed one query modifier, preserving RLS, restricted grants and error handling.

**Validation:** 15 unit tests, 14 desktop/mobile E2E scenarios, typecheck, lint and production build passed. Exact database row count and field values were verified; real storage rejection never became success. The test file hash remained identical across all three versions. Independent source review approved the minimal fix.

**Stack:** Node 24, Next.js, React, TypeScript, Supabase, PostgreSQL, Playwright.

**Project Type:** Demonstration Project; no paid client or production incident claimed.
