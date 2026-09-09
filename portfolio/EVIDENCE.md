# Evidence provenance

All five PNGs are real browser captures, without compositing or fabricated terminal output.

- `01-form.png`: baseline contact form using fictional test data.
- `02-success.png`: baseline success after the same test verified exactly one matching PostgreSQL row. Fixed application code is byte-identical to baseline.
- `03-regression-evidence.png`: broken application after a real HTTP 503; a separate authorized query verified zero matching rows.
- `04-validation.png`: actual Playwright HTML report from the fixed version: 14 passed, 0 failed, 14.6 seconds. This is a test report, not the application interface. A subsequent merged-main run also passed all 14 tests.
- `05-final-app.png`: homepage of the fixed production build served locally.

The main regression test SHA-256 is identical at all three tags: `ce674d4158cc30350c96f0559436a2a97580e44d706c4326094b6b0b608dcea1`.

Independent review verified the source change, test hashes, unit tests, lint, typecheck and production build on a separate machine. Cloud E2E and live database checks were performed by the implementation station, not independently repeated by that reviewer. Mobile screenshots/tests use Chromium device emulation.

All generated test records were cleaned by exact owned identifiers. No real personal data, credentials or sandbox identifiers appear in these captures.
