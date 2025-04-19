"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Phone } from "lucide-react"

export default function TopPharmacies({ isLoading, pharmacies = [] }) {
  // Simuler des statistiques de recherche pour les pharmacies
  // Dans une application réelle, ces données viendraient de l'API
  const getTopPharmacies = () => {
    return pharmacies
      .map((pharmacy) => ({
        ...pharmacy,
        recherches: Math.floor(Math.random() * 300) + 100, // Simuler entre 100 et 400 recherches
        variation: `${Math.floor(Math.random() * 20) - 5}%`, // Simuler une variation entre -5% et +15%
        tendance: Math.random() > 0.3 ? "up" : "down", // 70% de chance d'être en hausse
      }))
      .sort((a, b) => b.recherches - a.recherches) // Trier par nombre de recherches
      .slice(0, 5) // Prendre les 5 premières
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  const topPharmacies = getTopPharmacies()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pharmacie</TableHead>
          <TableHead className="hidden md:table-cell">Adresse</TableHead>
          <TableHead className="hidden md:table-cell">Téléphone</TableHead>
          <TableHead className="text-right">Recherches</TableHead>
          <TableHead className="text-right">Variation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topPharmacies.map((pharmacy) => (
          <TableRow key={pharmacy.id_pharmacie}>
            <TableCell className="font-medium">{pharmacy.nom}</TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {pharmacy.adresse}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                {pharmacy.telephone || "Non renseigné"}
              </div>
            </TableCell>
            <TableCell className="text-right">{pharmacy.recherches}</TableCell>
            <TableCell className="text-right">
              <Badge
                variant={pharmacy.tendance === "up" ? "default" : "destructive"}
                className={pharmacy.tendance === "up" ? "bg-green-500" : ""}
              >
                {pharmacy.variation}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
