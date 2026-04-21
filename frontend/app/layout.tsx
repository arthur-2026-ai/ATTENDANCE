import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { AttendanceProvider } from "@/lib/attendance-context"
import { EmployeeProvider } from "@/lib/employee-context"
import { LeaveProvider } from "@/lib/leave-context"
import { ThemeProvider } from "@/lib/theme-context"
import { DataRefreshProvider } from "@/lib/data-refresh-context"
import { AppLayout } from "@/components/layout/app-layout"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Orion Attendance - Employee Management System",
  description: "Manage employee attendance and track presence efficiently",
  generator: "Next.js",
  icons: {
    icon: [
      {
        url: "/orion.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/orion.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/orion.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <AttendanceProvider>
              <EmployeeProvider> 
                <LeaveProvider>
                  <DataRefreshProvider>
                    <AppLayout>{children}</AppLayout>
                  </DataRefreshProvider>
                </LeaveProvider>
              </EmployeeProvider>
            </AttendanceProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}