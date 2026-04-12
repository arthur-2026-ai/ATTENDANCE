"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"  

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/dashboard" : "/profile")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="inline-block mb-6 animate-slideInDown">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-3xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Image
                src="/orion.png"
                alt="Orion Logo"
                width={32}
                height={32}
                className="rounded-lg object-contain"
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Orion-Attendance</h1>
        <p className="text-lg text-muted-foreground">Gérez la présence de votre équipe de manière efficace et efficiente.</p>
      </div>
      <LoginForm />
    </div>
  )
}
