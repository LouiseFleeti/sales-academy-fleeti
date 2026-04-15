import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Sales Academy Fleeti",
  description: "Base de connaissance commerciale Fleeti",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-raleway">
        <Navbar />
        <main className="pt-14 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
