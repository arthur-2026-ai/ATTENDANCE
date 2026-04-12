"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const weeklyData = [
  { day: "Mon", present: 42, absent: 3, late: 2 },
  { day: "Tue", present: 41, absent: 2, late: 4 },
  { day: "Wed", present: 43, absent: 1, late: 1 },
  { day: "Thu", present: 40, absent: 4, late: 3 },
  { day: "Fri", present: 44, absent: 1, late: 2 },
]

export function AttendanceChart() {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Attendance Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend />
            <Bar dataKey="present" stackId="a" fill="var(--chart-3)" name="Present" />
            <Bar dataKey="late" stackId="a" fill="var(--chart-4)" name="Late" />
            <Bar dataKey="absent" stackId="a" fill="var(--chart-5)" name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
