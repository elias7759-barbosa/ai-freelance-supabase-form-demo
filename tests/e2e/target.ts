export function verifyTarget(env: Record<string, string | undefined>): string {
  const ref = env.E2E_SUPABASE_PROJECT_REF;
  if (!ref || !/^[a-z0-9]{20}$/.test(ref))
    throw new Error("Explicit test project reference required.");
  let url: URL;
  try {
    url = new URL(env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  } catch {
    throw new Error("Valid test project URL required.");
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== `${ref}.supabase.co` ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("Test project reference and URL must match exactly.");
  return ref;
}
