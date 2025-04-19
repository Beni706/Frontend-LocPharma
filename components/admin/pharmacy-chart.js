"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export default function PharmacyChart({ isLoading, pharmacies = [] }) {
  // Extraire les adresses pour créer un graphique par quartier/zone
  const getLocationData = () => {
    // Créer un objet pour compter les pharmacies par zone
    const locationCounts = {}

    pharmacies.forEach((pharmacy) => {
      // Utiliser l'adresse comme identifiant de zone (simplification)
      // Dans un cas réel, vous pourriez extraire le quartier de l'adresse
      const addressParts = pharmacy.adresse.split(",")
      const zone = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : addressParts[0].trim()

      if (locationCounts[zone]) {
        locationCounts[zone]++
      } else {
        locationCounts[zone] = 1
      }
    })

    // Convertir en tableau pour le graphique
    return Object.keys(locationCounts)
      .map((zone) => ({
        zone,
        count: locationCounts[zone],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Prendre les 8 zones les plus importantes
  }

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  const data = getLocationData()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="zone" width={120} />
        <Tooltip
          formatter={(value) => [`${value} pharmacies`, "Nombre"]}
          labelFormatter={(label) => `Zone: ${label}`}
        />
        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
