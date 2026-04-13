"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useAuth } from "@/lib/auth-context"

export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (!user) {
    return children
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="md:ml-64 mt-16 p-4 md:p-6 transition-all duration-300 relative z-0">
        {children}
      </main>
    </div>
  )
}
