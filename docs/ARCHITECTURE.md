# Form persistence architecture

The client validates a whitelisted payload and calls `POST /api/contact`. The Route Handler validates again, creates an anonymous Supabase client, awaits INSERT, checks the returned error, and only then returns HTTP 201. No SELECT is requested as part of INSERT. PostgreSQL generates IDs and timestamps.

The table is isolated. Only `name`, `email` and `message` are insertable by `anon`; RLS additionally limits input to fictional demo addresses and valid lengths. Existing authentication objects are not involved. The database still rejects values that cannot be stored as PostgreSQL text (for example U+0000); these become HTTP 503 and error feedback.

Tests own unique fictional emails in memory. Every management operation validates the explicit project reference against the URL before retrieving credentials. Database reads and deletes exist only in test infrastructure. Cleanup first discovers rows for the owned email, then deletes each exact ID/email pair and verifies absence. No broad cleanup is available.

The app uses a single in-flight guard and a disabled button. It does not promise cross-request idempotency or delivery guarantees after an ambiguous network failure. This is a local demonstration using a dedicated cloud sandbox, not an internet-facing production contact service.
