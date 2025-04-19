"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin } from "lucide-react"
import PharmacyMap from "@/components/pharmacy-map"

export default function PharmacyForm({ initialData = null, onSubmit }) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || "",
    adresse: initialData?.adresse || "",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
    telephone: initialData?.telephone || "",
    services: initialData?.services || "",
    info_supplementaire: initialData?.info_supplementaire || "",
  })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (error) => {
          console.warn("Erreur de géolocalisation:", error.message)
          // Utiliser une position par défaut pour Libreville, Gabon
          setUserLocation({ lat: 0.3924, lng: 9.4536 })
        },
        { enableHighAccuracy: true },
      )
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validation basique
      if (!formData.nom || !formData.adresse || !formData.latitude || !formData.longitude) {
        throw new Error("Veuillez remplir tous les champs obligatoires.")
      }

      // Vérifier si les coordonnées sont valides
      const lat = Number.parseFloat(formData.latitude)
      const lng = Number.parseFloat(formData.longitude)

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error("Coordonnées géographiques invalides.")
      }

      const result = await onSubmit(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Préparer les données de la pharmacie pour la carte
  const pharmacyForMap =
    formData.latitude && formData.longitude
      ? [
          {
            id_pharmacie: initialData?.id_pharmacie || 0,
            nom: formData.nom || "Nouvelle pharmacie",
            adresse: formData.adresse || "",
            latitude: Number.parseFloat(formData.latitude),
            longitude: Number.parseFloat(formData.longitude),
            isOpen: true,
          },
        ]
      : []

  // Fonction pour gérer la sélection d'une pharmacie sur la carte (non utilisée ici)
  const handlePharmacySelect = () => {}

  // ✅ Fonction à ajouter ici
const handleMapClick = ({ lat, lng }) => {
  setFormData((prev) => ({
    ...prev,
    latitude: lat.toFixed(6),
    longitude: lng.toFixed(6),
  }))
}

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de la pharmacie *</Label>
              <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse complète *</Label>
              <Textarea id="adresse" name="adresse" value={formData.adresse} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services (séparés par des virgules)</Label>
              <Textarea
                id="services"
                name="services"
                value={formData.services}
                onChange={handleChange}
                placeholder="Ex: Vaccination, Test COVID, Conseil santé"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="info_supplementaire">Informations supplémentaires</Label>
              <Textarea
                id="info_supplementaire"
                name="info_supplementaire"
                value={formData.info_supplementaire}
                onChange={handleChange}
                placeholder="Ex: Horaires spéciaux, accès handicapés, etc."
              />
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Localisation</CardTitle>
                <CardDescription>Définissez la position exacte de la pharmacie sur la carte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video rounded-md relative overflow-hidden h-80">
                    {userLocation ? (
                      <PharmacyMap
                        pharmacies={pharmacyForMap}
                        userLocation={userLocation}
                        selectedPharmacy={pharmacyForMap[0]}
                        onPharmacySelect={handlePharmacySelect}
                        onMapClick={handleMapClick}
                        showRoutes={false}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-emerald-600" />
                        <span className="ml-2">Chargement de la carte...</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude *</Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="Ex: 0.4162"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude *</Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="Ex: 9.4673"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : initialData ? "Mettre à jour" : "Créer la pharmacie"}
          </Button>
        </div>
      </div>
    </form>
  )
}
