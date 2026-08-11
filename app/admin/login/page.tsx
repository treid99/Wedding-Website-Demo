import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";
import { WEDDING } from "@/lib/wedding";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Already signed in? Skip the form.
  if (await getSession()) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Link href="/" className="display text-3xl tracking-[0.14em] text-ink">
            J <span className="text-gold">&</span> T
          </Link>
          <p className="eyebrow mt-6">Private</p>
          <h1 className="display mt-2 text-3xl text-ink">Couple&apos;s Dashboard</h1>
          <div className="hairline mx-auto mt-5 w-20" />
        </div>

        <div className="mt-8 border border-line bg-white p-7">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          {WEDDING.couple} · {WEDDING.dateShort}
        </p>
        <p className="mt-4 text-center text-xs">
          <Link href="/" className="text-sage underline underline-offset-4 hover:text-gold">
            ← Back to the wedding site
          </Link>
        </p>
      </div>
    </div>
  );
}
