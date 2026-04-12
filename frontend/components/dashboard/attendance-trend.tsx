"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const trendData = [
  { week: "Week 1", attendance: 85 },
  { week: "Week 2", attendance: 87 },
  { week: "Week 3", attendance: 84 },
  { week: "Week 4", attendance: 89 },
  { week: "Week 5", attendance: 91 },
]

export function AttendanceTrend() {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Attendance Trend (Monthly)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ fill: "var(--primary)", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
