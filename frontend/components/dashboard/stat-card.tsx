"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; direction: "up" | "down" }
  color?: "blue" | "green" | "orange" | "red"
}

export function StatCard({ title, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 font-medium ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    </Card>
  )
}
