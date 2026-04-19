"use client"

import { useAuth } from "@/lib/auth-context"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "./sidebar"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function Header() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Fermer le menu mobile lorsque la route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (!user) return null
  
  const displayName = user.firstName 
      ? user.firstName.split(" ")[0] 
      : (user.lastName ? user.lastName.split(" ")[0] : 'Super Admin');

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-card border-b border-border flex items-center px-4 md:px-6 z-40">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          
          <h1 className="text-xl font-semibold text-foreground">
            {/* 🎯 Utilisation de la variable sécurisée */}
            Bienvenue, {displayName}
          </h1>
        </div>
        <div className="text-sm text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    </header>
  )
}