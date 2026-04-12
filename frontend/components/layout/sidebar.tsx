"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
// 🎯 Import des icônes nécessaires (incluant RefreshCw et Loader2)
import { BarChart3, Users, Clock, User, LogOut, LayoutDashboard, RefreshCw, Loader2 } from "lucide-react" 
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { cn } from "@/lib/utils"
// 🎯 Import du contexte de rafraîchissement global
import { useDataRefresh } from "@/lib/data-refresh-context"; 
import { useState, useCallback, useMemo } from 'react';


export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  // 🎯 UTILISATION DU CONTEXTE DE RAFRAÎCHISSEMENT GLOBAL
  const { refreshAllData, isGlobalRefreshing: isRefreshing } = useDataRefresh();

  // 🎯 MAINTENIR L'ÉTAT DU DERNIER RAFRAÎCHISSEMENT (pour l'affichage)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  if (!user) return null

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/employees", label: "Employés", icon: Users },
    { href: "/attendance", label: "Présence", icon: Clock },
  ]
  
  const employeeLinks = [
    { href: "/dashboard", label: "Mon Dashboard", icon: LayoutDashboard }, 
    { href: "/profile", label: "Mon Profil", icon: User },
  ]

  const links = user.role === "admin" ? adminLinks : employeeLinks

  // 🎯 DÉFINITION DE LA FONCTION handleRefreshData
  const handleRefreshData = useCallback(async () => {
      if (isRefreshing) return;
      
      try {
        await refreshAllData();
        setLastRefresh(new Date());
      } catch (e) {
        console.error("Erreur lors du rafraîchissement via Sidebar:", e);
      }

  }, [isRefreshing, refreshAllData]);
  
  // 🎯 DÉFINITION DU STATUT DE RAFRAÎCHISSEMENT
  const refreshStatus = useMemo(() => {
    if (isRefreshing) {
        return "Actualisation en cours...";
    }
    if (lastRefresh) {
        const timeString = lastRefresh.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return `Actualisé à ${timeString}`;
    }
    return "Cliquez pour actualiser les données";
  }, [isRefreshing, lastRefresh]);


  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0">
      
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          {/* Remplacement du placeholder par l'image */}
          <Image
            src="/orion.png"
            alt="Orion Logo"
            width={32}      // Largeur de l'image (doit correspondre au w-8)
            height={32}     // Hauteur de l'image (doit correspondre au h-8)
            className="rounded-lg object-contain" 
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg">Orion</span>
            <span className="text-xs text-sidebar-foreground/60">Présence</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href) 
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20",
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}

        {/* 🎯 BLOC DU BOUTON D'ACTUALISATION */}
        <div className="pt-4 mt-4 border-t border-sidebar-border">
            <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                // Ajustement des classes pour utiliser les couleurs standard de Tailwind pour la clarté
                className={cn(
                    "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-sm",
                    isRefreshing
                        ? "bg-yellow-500 text-white opacity-70 cursor-not-allowed"
                        : lastRefresh
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                )}
            >
                {isRefreshing ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <RefreshCw size={18} />
                )}
                <span>Actualiser les données</span>
            </button>
            <p className={cn("text-xs mt-2 text-center", lastRefresh ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400")}>
                {refreshStatus}
            </p>
        </div>
      </nav>

      {/* Theme Toggle & User Info (inchangé) */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <ThemeToggle />
        <div className="px-4 py-3 rounded-lg bg-sidebar-accent/10">
          <p className="text-xs text-sidebar-foreground/60">Connecté en tant que</p>
          {/* Assurez-vous d'afficher le nom et le prénom si disponibles */}
          <p className="font-medium text-sm truncate">{user.firstName} {user.lastName}</p> 
          <p className="text-xs text-sidebar-foreground/50 capitalize">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/10 text-destructive transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  )
}