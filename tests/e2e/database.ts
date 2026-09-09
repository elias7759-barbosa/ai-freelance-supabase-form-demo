// Privileged test infrastructure. Never imported by application code.
import { execFileSync } from "node:child_process";
import { verifyTarget } from "./target";
const owned = new Set<string>();
export function ownTestEmail(email: string) {
  if (!/^demo-[a-z0-9-]+@example\.test$/.test(email))
    throw new Error("Fictional test email required.");
  owned.add(email);
  return email;
}
async function query(sql: string, parameters: unknown[], readOnly: boolean) {
  const ref = verifyTarget(process.env); // Must run BEFORE credential retrieval, every time.
  const token =
    process.env.SUPABASE_ACCESS_TOKEN ||
    execFileSync(
      "security",
      ["find-generic-password", "-s", "Supabase CLI", "-w"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql, parameters, read_only: readOnly }),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok)
    throw new Error(
      `Database verification failed (${response.status}); response suppressed.`,
    );
  return response.json();
}
function assertOwned(email: string) {
  if (!owned.has(email)) throw new Error("Test does not own this email.");
}
export async function rowsFor(email: string) {
  assertOwned(email);
  return query(
    "select id,name,email,message,created_at from public.demo2_form_submissions where email=$1",
    [email],
    true,
  );
}
export async function cleanup(email: string) {
  assertOwned(email);
  const rows = await rowsFor(email);
  for (const row of rows)
    await query(
      "delete from public.demo2_form_submissions where id=$1::uuid and email=$2",
      [row.id, email],
      false,
    );
  const remaining = await rowsFor(email);
  if (remaining.length) throw new Error("Exact test-record cleanup failed.");
  owned.delete(email);
}
export async function securityState() {
  return query(
    `select c.relrowsecurity as rls,
 has_column_privilege('anon','public.demo2_form_submissions','name','INSERT') as can_insert,
 has_table_privilege('anon','public.demo2_form_submissions','SELECT') as can_select,
 has_table_privilege('anon','public.demo2_form_submissions','UPDATE') as can_update,
 has_table_privilege('anon','public.demo2_form_submissions','DELETE') as can_delete
 from pg_class c where c.oid='public.demo2_form_submissions'::regclass`,
    [],
    true,
  );
}
