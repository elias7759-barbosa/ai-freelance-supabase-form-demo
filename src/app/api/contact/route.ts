import { createClient } from "@supabase/supabase-js";
import { validateSubmission } from "../../../lib/validation";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !==
      `${new URL(request.url).protocol}//${request.headers.get("host")}`
  )
    return Response.json(
      { error: "Request origin rejected." },
      { status: 403, headers },
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "JSON required." }, { status: 415, headers });
  const text = await request.text();
  if (text.length > 16000)
    return Response.json(
      { error: "Request too large." },
      { status: 413, headers },
    );
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400, headers });
  }
  const result = validateSubmission(body);
  if (!result.data)
    return Response.json({ errors: result.errors }, { status: 400, headers });
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await supabase
      .from("demo2_form_submissions")
      .insert(result.data)
      .select()
      .abortSignal(AbortSignal.timeout(10000));
    if (error) {
      console.error("Contact persistence rejected", { code: error.code });
      return Response.json(
        { error: "We could not save your message. Please try again." },
        { status: 503, headers },
      );
    }
    return Response.json({ success: true }, { status: 201, headers });
  } catch {
    console.error("Contact persistence unavailable");
    return Response.json(
      { error: "We could not save your message. Please try again." },
      { status: 503, headers },
    );
  }
}
