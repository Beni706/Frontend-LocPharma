"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchChart({ isLoading }) {
  const data = [
    { date: "01/04", count: 120 },
    { date: "02/04", count: 145 },
    { date: "03/04", count: 132 },
    { date: "04/04", count: 167 },
    { date: "05/04", count: 189 },
    { date: "06/04", count: 212 },
    { date: "07/04", count: 178 },
    { date: "08/04", count: 198 },
    { date: "09/04", count: 220 },
    { date: "10/04", count: 234 },
    { date: "11/04", count: 245 },
    { date: "12/04", count: 267 },
    { date: "13/04", count: 278 },
    { date: "14/04", count: 290 },
  ]

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value} recherches`, "Nombre"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
