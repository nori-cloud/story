import { RootLayout } from "@/components/layout/root-layout";
import "@/styles/globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="dark">
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
