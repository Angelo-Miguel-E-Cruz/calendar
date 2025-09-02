"use client"

import Navbar from "@/components/utils/navbar";
import { UserSync } from "@/components/utils/userSync";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <UserSync />
      {children}
    </>
  );
}