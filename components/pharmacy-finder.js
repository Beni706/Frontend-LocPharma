"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Phone, Filter, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import PharmacyMap from "./pharmacy-map"

export default function PharmacyFinder() {
  const [pharmacies, setPharmacies] = useState([])
  const [nearbyPharmacies, setNearbyPharmacies] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    openNow: false,
    onDuty: false,
  })
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [showRoutes, setShowRoutes] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const [watchId, setWatchId] = useState(null)

  // Récupérer les données des pharmacies
  useEffect(() => {
    async function fetchPharmacies() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacie`)
        const data = await response.json()
        setPharmacies(data)
        setNearbyPharmacies(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Erreur lors de la récupération des pharmacies:", error)
        setIsLoading(false)
      }
    }

    fetchPharmacies()

    // Nettoyer le watchPosition lors du démontage du composant
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  // Modifions la fonction handleLocateUser pour activer le suivi en temps réel

  // Remplacer la fonction handleLocateUser actuelle par celle-ci:
  const handleLocateUser = () => {
    if (navigator.geolocation) {
      // Afficher un message de chargement
      setIsLoading(true)
      setGeoError(null)

      // Options de géolocalisation pour améliorer la précision
      const geoOptions = {
        enableHighAccuracy: true, // Utiliser GPS si disponible
        timeout: 20000, // Timeout après 20 secondes
        maximumAge: 0, // Ne pas utiliser de cache
      }

      // Fonction pour gérer le succès de la géolocalisation
      const geoSuccess = async (position) => {
        try {
          console.log("Position brute obtenue:", position.coords)
          console.log("Précision:", position.coords.accuracy, "mètres")

          // Extraire les coordonnées avec plus de précision
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          console.log("Position formatée:", userLoc)

          // Vérifier si le déplacement est significatif (plus de 10 mètres)
          // ou si c'est la première position obtenue
          const isFirstPosition = !userLocation
          const isSignificantMove =
            isFirstPosition || calculateDistance(userLocation.lat, userLocation.lng, userLoc.lat, userLoc.lng) > 10

          // Mettre à jour l'état avec la position de l'utilisateur
          setUserLocation(userLoc)

          // Si c'est la première position ou un déplacement significatif,
          // mettre à jour les pharmacies proches
          if (isFirstPosition || isSignificantMove) {
            try {
              // Récupérer les pharmacies proches
              const url = `${process.env.NEXT_PUBLIC_API_URL}/pharmacie/proche?latitude=${userLoc.lat.toFixed(6)}&longitude=${userLoc.lng.toFixed(6)}`
              console.log("Requête API:", url)

              const response = await fetch(url)

              if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Erreur API (${response.status}): ${errorText}`)
              }

              const data = await response.json()

              if (Array.isArray(data)) {
                console.log("Pharmacies proches reçues:", data.length)

                // Vérifier que les données contiennent des coordonnées valides
                const validData = data.filter(
                  (pharmacy) =>
                    pharmacy &&
                    typeof pharmacy.latitude === "number" &&
                    typeof pharmacy.longitude === "number" &&
                    !isNaN(pharmacy.latitude) &&
                    !isNaN(pharmacy.longitude),
                )

                if (validData.length !== data.length) {
                  console.warn(
                    `${data.length - validData.length} pharmacies ont des coordonnées invalides et ont été filtrées`,
                  )
                }

                setNearbyPharmacies(validData)

                // Activer l'affichage des itinéraires
                setShowRoutes(true)

                // Sélectionner automatiquement la pharmacie la plus proche
                if (validData.length > 0) {
                  const sorted = [...validData].sort((a, b) => (a.distance || 0) - (b.distance || 0))
                  setSelectedPharmacy(sorted[0])
                }
              } else {
                console.error("Format de données inattendu:", data)
                setGeoError("Format de données inattendu reçu du serveur")
              }
            } catch (apiError) {
              console.error("Erreur lors de la récupération des pharmacies proches:", apiError)
              setGeoError(`Erreur API: ${apiError.message}`)
            }
          }
        } catch (error) {
          console.error("Erreur générale dans geoSuccess:", error)
          setGeoError(`Erreur: ${error.message}`)
        } finally {
          setIsLoading(false)
        }
      }

      // Fonction pour gérer l'erreur de géolocalisation
      const geoError = (error) => {
        console.error("Erreur de géolocalisation:", error)
        let errorMsg = "Impossible d'obtenir votre position."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += " Vous avez refusé l'accès à votre position."
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg += " Les informations de position ne sont pas disponibles."
            break
          case error.TIMEOUT:
            errorMsg += " La demande de position a expiré."
            break
          case error.UNKNOWN_ERROR:
            errorMsg += " Une erreur inconnue s'est produite."
            break
        }

        setGeoError(errorMsg)
        alert(errorMsg)
        setIsLoading(false)
      }

      // Nettoyer l'ancien watchPosition s'il existe
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }

      // Démarrer le suivi de position
      const id = navigator.geolocation.watchPosition(geoSuccess, geoError, geoOptions)
      setWatchId(id)

      // Également obtenir une position immédiate
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions)
    } else {
      alert("La géolocalisation n'est pas prise en charge par votre navigateur.")
    }
  }

  // Ajouter cette fonction pour calculer la distance entre deux points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Rayon de la terre en mètres
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance en mètres
  }

  // Gérer le clic sur une pharmacie dans la liste
  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(pharmacy)
    // Conserver l'état des itinéraires
  }

  const filteredPharmacies = nearbyPharmacies
    .filter(
      (pharmacy) =>
        pharmacy.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.adresse.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((pharmacy) => {
      if (filters.openNow && !pharmacy.isOpen) return false
      if (filters.onDuty && !pharmacy.isOnDuty) return false
      return true
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="order-1 lg:order-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une pharmacie..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className={`${watchId !== null ? "bg-blue-600" : "bg-emerald-600"} text-white hover:bg-emerald-700 flex items-center gap-2`}
            onClick={handleLocateUser}
            disabled={isLoading}
          >
            <Navigation className={`h-4 w-4 ${watchId !== null ? "animate-pulse" : ""}`} />
            {isLoading ? "Localisation..." : watchId !== null ? "Suivi actif" : "Près de moi"}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtres</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>Filtrer les pharmacies selon vos besoins</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="open-now"
                    checked={filters.openNow}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, openNow: checked === true }))}
                  />
                  <Label htmlFor="open-now">Ouvertes maintenant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="on-duty"
                    checked={filters.onDuty}
                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, onDuty: checked === true }))}
                  />
                  <Label htmlFor="on-duty">Pharmacies de garde</Label>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {geoError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{geoError}</div>}

        {userLocation && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md text-sm">
            Position: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            {userLocation.accuracy && ` (précision: ~${Math.round(userLocation.accuracy)}m)`}
          </div>
        )}

        <div className="h-[500px] overflow-y-auto pr-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Chargement des pharmacies...</p>
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>Aucune pharmacie trouvée</p>
            </div>
          ) : (
            filteredPharmacies.map((pharmacy) => (
              <Card
                key={pharmacy.id_pharmacie}
                className={`cursor-pointer hover:border-emerald-500 transition-colors ${
                  selectedPharmacy?.id_pharmacie === pharmacy.id_pharmacie ? "border-emerald-500" : ""
                }`}
                onClick={() => handlePharmacySelect(pharmacy)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{pharmacy.nom}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {pharmacy.adresse}
                      </p>
                      {pharmacy.telephone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" /> {pharmacy.telephone}
                        </p>
                      )}
                      {pharmacy.isOpen !== undefined && (
                        <p className="text-sm flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span className={pharmacy.isOpen ? "text-emerald-600" : "text-red-500"}>
                            {pharmacy.isOpen ? "Ouvert" : "Fermé"}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {pharmacy.distance !== undefined && (
                        <Badge variant="outline" className="bg-emerald-50">
                          {pharmacy.distance.toFixed(2)} km
                        </Badge>
                      )}
                      {pharmacy.isOnDuty && <Badge className="bg-emerald-600">De garde</Badge>}
                    </div>
                  </div>
                  {pharmacy.services && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.services.split(", ").map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {pharmacy.info_supplementaire && (
                    <p className="text-sm text-gray-600 mt-2">{pharmacy.info_supplementaire}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="order-2 lg:order-2 h-[300px] lg:h-[500px]">
        <PharmacyMap
          pharmacies={filteredPharmacies}
          userLocation={userLocation}
          selectedPharmacy={selectedPharmacy}
          onPharmacySelect={handlePharmacySelect}
          showRoutes={showRoutes}
        />
      </div>
    </div>
  )
}
