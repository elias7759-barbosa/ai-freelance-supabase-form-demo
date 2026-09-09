"use client";
import { useRef, useState } from "react";
import { validateSubmission } from "../../lib/validation";
export default function ContactForm() {
  const busy = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const validation = validateSubmission(
      Object.fromEntries(new FormData(form)),
    );
    setErrors(validation.errors);
    if (!validation.data) {
      setState("idle");
      return;
    }
    busy.current = true;
    setState("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        setErrors(result.errors ?? {});
        setState("error");
        return;
      }
      setState("success");
      form.reset();
    } catch {
      setState("error");
    } finally {
      busy.current = false;
    }
  }
  return (
    <form onSubmit={submit} noValidate aria-label="Contact form">
      {(["name", "email", "message"] as const).map((field) => (
        <div className="field" key={field}>
          <label htmlFor={field}>
            {field[0].toUpperCase() + field.slice(1)}
          </label>
          {field === "message" ? (
            <textarea
              id={field}
              name={field}
              rows={5}
              maxLength={1000}
              required
              aria-invalid={!!errors[field]}
              aria-describedby={errors[field] ? field + "-error" : undefined}
            />
          ) : (
            <input
              id={field}
              name={field}
              type={field === "email" ? "email" : "text"}
              autoComplete={field}
              maxLength={field === "name" ? 80 : 254}
              required
              aria-invalid={!!errors[field]}
              aria-describedby={errors[field] ? field + "-error" : undefined}
            />
          )}
          {errors[field] && (
            <p className="error" id={field + "-error"}>
              {errors[field]}
            </p>
          )}
        </div>
      ))}
      <button disabled={state === "loading"} type="submit">
        {state === "loading" ? "Saving…" : "Send message"}
      </button>
      <div aria-live="polite">
        {state === "success" && (
          <p role="status" className="success">
            Message saved successfully. Thank you.
          </p>
        )}
        {state === "error" && (
          <p role="alert" className="error">
            We could not save your message. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}
