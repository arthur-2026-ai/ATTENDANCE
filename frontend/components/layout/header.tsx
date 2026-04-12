"use client"

import { useAuth } from "@/lib/auth-context"

export function Header() {
  const { user } = useAuth()

  if (!user) return null
  
  const displayName = user.firstName 
      ? user.firstName.split(" ")[0] 
      : (user.firstName ? user.lastName.split(" ")[0] : 'Super Admin');

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-card border-b border-border flex items-center px-6 z-40">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-semibold text-foreground">
            {/* 🎯 Utilisation de la variable sécurisée */}
            Bienvenu : {displayName}
        </h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    </header>
  )
}