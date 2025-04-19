"use client"

import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/layout"
import PharmacyForm from "@/components/admin/pharmacy-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function NewPharmacy() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacie`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la création de la pharmacie")
      }

      toast({
        title: "Succès",
        description: "La pharmacie a été créée avec succès",
      })

      // Rediriger vers la liste des pharmacies
      router.push("/admin/pharmacies")
    } catch (error) {
      console.error("Erreur lors de la création:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la pharmacie",
        variant: "destructive",
      })
      return { error: error.message || "Une erreur est survenue lors de la création de la pharmacie." }
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/pharmacies")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-emerald-600">Ajouter une pharmacie</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de la pharmacie</CardTitle>
          </CardHeader>
          <CardContent>
            <PharmacyForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
