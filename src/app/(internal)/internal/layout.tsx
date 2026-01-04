import Link from "next/link";
import { redirect } from "next/navigation";

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const env = process.env.NODE_ENV;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;

  // Only allow access in development or staging
  const isAllowed = env === "development" || appEnv === "staging";

  if (!isAllowed) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3">
          <Link
            href="/internal"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Internal Dashboard
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
