"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import AdminLayout from "@/components/admin/layout"
import PharmacyForm from "@/components/admin/pharmacy-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function EditPharmacy({ params }) {
  // Utiliser React.use pour déballer les params
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const router = useRouter()
  const [pharmacy, setPharmacy] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    // Charger les données de la pharmacie
    const fetchPharmacy = async () => {
      try {
        setIsLoading(true)

        // Récupérer toutes les pharmacies puis filtrer par ID
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacie`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des pharmacies")
        }

        const pharmacies = await response.json()
        const foundPharmacy = pharmacies.find((p) => p.id_pharmacie === Number(id))

        if (!foundPharmacy) {
          throw new Error("Pharmacie non trouvée")
        }

        setPharmacy(foundPharmacy)
        setIsLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement de la pharmacie:", error)
        setIsLoading(false)
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la pharmacie",
          variant: "destructive",
        })
      }
    }

    fetchPharmacy()
  }, [id, router, toast])

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacie/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la mise à jour de la pharmacie")
      }

      toast({
        title: "Succès",
        description: "La pharmacie a été mise à jour avec succès",
      })

      // Rediriger vers la liste des pharmacies
      router.push("/admin/pharmacies")
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la pharmacie",
        variant: "destructive",
      })
      return { error: error.message || "Une erreur est survenue lors de la mise à jour de la pharmacie." }
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/pharmacies")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-emerald-600">Modifier la pharmacie</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de la pharmacie</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <PharmacyForm initialData={pharmacy} onSubmit={handleSubmit} />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
