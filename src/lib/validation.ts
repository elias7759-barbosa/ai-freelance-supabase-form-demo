export type Submission = { name: string; email: string; message: string };
export function validateSubmission(input: unknown): {
  data?: Submission;
  errors: Record<string, string>;
} {
  const value =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const message = typeof value.message === "string" ? value.message.trim() : "";
  const errors: Record<string, string> = {};
  if (name.length < 2 || name.length > 80)
    errors.name = "Use 2–80 characters for your name.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (message.length < 10 || message.length > 1000)
    errors.message = "Use 10–1000 characters for your message.";
  return Object.keys(errors).length
    ? { errors }
    : { data: { name, email, message }, errors };
}
