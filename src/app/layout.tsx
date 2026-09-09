import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "Form persistence demo",
  description: "A small Next.js and Supabase demonstration.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <Link href="/">FORM / DATABASE</Link>
          <span>Demonstration project</span>
        </header>
        <main>{children}</main>
        <footer>Next.js · TypeScript · Supabase · PostgreSQL</footer>
      </body>
    </html>
  );
}
