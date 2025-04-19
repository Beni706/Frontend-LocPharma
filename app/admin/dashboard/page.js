"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/layout"
import StatsCard from "@/components/admin/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Clock, Pill, TrendingUp } from "lucide-react"
import PharmacyChart from "@/components/admin/pharmacy-chart"
import SearchChart from "@/components/admin/search-chart"
import TopPharmacies from "@/components/admin/top-pharmacies"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPharmacies: 0,
    totalSearches: 0,
    activePharmacies: 0,
    totalServices: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [pharmacies, setPharmacies] = useState([])

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    // Charger les pharmacies
    const fetchPharmacies = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacie`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des pharmacies")
        }

        const data = await response.json()
        setPharmacies(data)

        // Calculer les statistiques
        const totalPharmacies = data.length
        const servicesSet = new Set()

        data.forEach((pharmacie) => {
          if (pharmacie.services) {
            const servicesList = pharmacie.services.split(",")
            servicesList.forEach((service) => servicesSet.add(service.trim()))
          }
        })

        setStats({
          totalPharmacies,
          totalSearches: Math.floor(Math.random() * 2000), // Simulé car pas d'API pour les recherches
          activePharmacies: totalPharmacies, // Toutes les pharmacies sont considérées comme actives
          totalServices: servicesSet.size,
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement des pharmacies:", error)
        setIsLoading(false)
      }
    }

    fetchPharmacies()
  }, [router])

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-emerald-600">Tableau de bord</h1>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Pharmacies"
            value={stats.totalPharmacies}
            icon={<MapPin className="h-5 w-5 text-emerald-600" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Recherches"
            value={stats.totalSearches}
            icon={<Search className="h-5 w-5 text-blue-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Pharmacies actives"
            value={stats.activePharmacies}
            icon={<Clock className="h-5 w-5 text-green-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Services"
            value={stats.totalServices}
            icon={<Pill className="h-5 w-5 text-purple-500" />}
            isLoading={isLoading}
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Recherches par jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchChart isLoading={isLoading} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Pharmacies par quartier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PharmacyChart isLoading={isLoading} pharmacies={pharmacies} />
            </CardContent>
          </Card>
        </div>

        {/* Pharmacies les plus consultées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Pharmacies les plus consultées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopPharmacies isLoading={isLoading} pharmacies={pharmacies} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
