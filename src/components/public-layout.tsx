import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { PublicUser } from "@/lib/data";

export default function PublicLayout({
  user,
  children,
}: {
  user: PublicUser | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
