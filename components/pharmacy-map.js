"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"

// Composant de chargement à afficher pendant que la carte se charge
const MapLoading = () => (
  <div className="h-full w-full rounded-lg border flex items-center justify-center bg-gray-50">
    <p>Chargement de la carte...</p>
  </div>
)

// Composant de carte de pharmacie avec polylines au lieu de Leaflet Routing Machine
const PharmacyMap = ({ pharmacies, userLocation, selectedPharmacy, onPharmacySelect, showRoutes, onMapClick }) => {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const markersRef = useRef({})
  const polylinesRef = useRef([])
  const userMarkerRef = useRef(null)
  const accuracyCircleRef = useRef(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [L, setLeaflet] = useState(null)
  const [routeInfos, setRouteInfos] = useState([])

  // Charger Leaflet uniquement côté client
  useEffect(() => {
    // Import dynamique de Leaflet (sans routing-machine)
    import("leaflet").then((leaflet) => {
      setLeaflet(leaflet.default)

      // Fix Leaflet icon issues
      delete leaflet.default.Icon.Default.prototype._getIconUrl

      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      // Importer les styles CSS de Leaflet
      import("leaflet/dist/leaflet.css")

      setIsMapReady(true)
    })
  }, [])

  // Initialiser la carte une fois Leaflet chargé
  useEffect(() => {
    if (!isMapReady || !L || !mapContainerRef.current) return

    // Par défaut, Libreville, Gabon s'il n'y a pas de localisation de l'utilisateur
    const defaultLocation = { lat: 0.3924, lng: 9.4536 }
    const center = userLocation || defaultLocation

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], 10)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current)
        // 👉 Écoute du clic sur la carte
      mapRef.current.on("click", function (e) {
        if (onMapClick) {
          const { lat, lng } = e.latlng
          onMapClick({ lat, lng })
        }
      })
    } else if (userLocation) {
      // Si la carte existe déjà et que nous avons une position utilisateur, mettre à jour la vue
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isMapReady, L])

  // Ajouter un style pour l'animation de pulsation
  useEffect(() => {
    // Ajouter un style pour l'animation de pulsation
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.innerHTML = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
      `
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Gérer le marqueur de l'utilisateur
  useEffect(() => {
    if (!isMapReady || !L || !mapRef.current || !userLocation) return

    console.log("Mise à jour du marqueur utilisateur:", userLocation)

    // Supprimer le marqueur existant s'il existe
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    // Supprimer le cercle de précision s'il existe
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove()
      accuracyCircleRef.current = null
    }

    // Créer un nouveau marqueur pour l'utilisateur avec une icône plus visible
    const userIcon = L.divIcon({
      html: `<div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center pulse-animation">
             <div class="w-2 h-2 bg-white rounded-full"></div>
           </div>`,
      className: "user-location-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindTooltip("Votre position")

    // Ajouter un cercle pour indiquer la précision si disponible
    if (userLocation.accuracy) {
      accuracyCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: userLocation.accuracy, // Rayon en mètres
        color: "blue",
        fillColor: "#3388ff",
        fillOpacity: 0.1,
        weight: 1,
      }).addTo(mapRef.current)
    }

    // Centrer la carte sur la position de l'utilisateur avec un zoom approprié
    // Utiliser flyTo au lieu de setView pour une transition plus fluide
    mapRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
      duration: 1.5, // durée de l'animation en secondes
    })

    // Si nous avons une précision, ajuster le zoom en fonction
    if (userLocation.accuracy) {
      // Ajuster le zoom en fonction de la précision
      // Plus la précision est faible (grand rayon), plus le zoom est petit
      const zoomLevel = Math.max(14 - Math.log2(userLocation.accuracy / 50), 10)
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], zoomLevel, {
        duration: 1.5,
      })
    }
  }, [isMapReady, L, userLocation])

  // Ajouter des marqueurs de pharmacie
  useEffect(() => {
    if (!isMapReady || !L || !mapRef.current) return

    // Effacer les marqueurs existants
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove()
    })
    markersRef.current = {}

    // Add new markers
    pharmacies.forEach((pharmacy) => {
      const isSelected = selectedPharmacy?.id_pharmacie === pharmacy.id_pharmacie

      const markerHtml = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full ${
          isSelected
            ? "bg-emerald-600 text-white"
            : pharmacy.isOnDuty
              ? "bg-emerald-500 text-white"
              : pharmacy.isOpen
                ? "bg-white text-emerald-600 border-2 border-emerald-600"
                : "bg-white text-red-500 border-2 border-red-500"
        }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `

      const icon = L.divIcon({
        html: markerHtml,
        className: "pharmacy-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const marker = L.marker([pharmacy.latitude, pharmacy.longitude], { icon })
        .addTo(mapRef.current)
        .bindTooltip(pharmacy.nom)
        .on("click", () => {
          onPharmacySelect(pharmacy)
        })

      markersRef.current[pharmacy.id_pharmacie] = marker
    })

    // Panoramique vers la pharmacie sélectionnée et zoom
    if (selectedPharmacy && markersRef.current[selectedPharmacy.id_pharmacie]) {
      mapRef.current.setView([selectedPharmacy.latitude, selectedPharmacy.longitude], 15)
    }
  }, [isMapReady, L, pharmacies, selectedPharmacy, onPharmacySelect])

  // Fonction pour obtenir un itinéraire via l'API OSRM
  const getRoute = async (start, end) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      const response = await fetch(url)
      const data = await response.json()

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        return {
          distance: data.routes[0].distance / 1000, // en km
          duration: Math.round(data.routes[0].duration / 60), // en minutes
          coordinates: data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]), // Inverser lat/lng
        }
      }
      throw new Error("Impossible de trouver un itinéraire")
    } catch (error) {
      console.warn("Erreur lors de la récupération de l'itinéraire:", error)
      // Retourner une ligne droite en cas d'échec
      return {
        distance: 0,
        duration: 0,
        coordinates: [
          [start.lat, start.lng],
          [end.lat, end.lng],
        ],
        isDirectLine: true,
      }
    }
  }

  // Gérer l'affichage des itinéraires avec des polylines
  useEffect(() => {
    if (!isMapReady || !L || !mapRef.current || !userLocation) return

    // Fonction pour nettoyer les polylines
    const cleanupPolylines = () => {
      polylinesRef.current.forEach((polyline) => {
        if (mapRef.current) {
          polyline.remove()
        }
      })
      polylinesRef.current = []
      setRouteInfos([])
    }

    // Nettoyer les polylines existantes
    cleanupPolylines()

    // Si showRoutes est activé, afficher les itinéraires vers les pharmacies les plus proches
    if (showRoutes) {
      // Trier les pharmacies par distance
      const sortedPharmacies = [...pharmacies]
        .filter((p) => p.latitude && p.longitude) // S'assurer que les coordonnées sont valides
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 5) 

      // Couleurs pour les itinéraires
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"] // vert, bleu, orange, rose, violet


      // Créer un itinéraire pour chaque pharmacie proche
      const fetchRoutes = async () => {
        const newRouteInfos = []

        for (let i = 0; i < sortedPharmacies.length; i++) {
          const pharmacy = sortedPharmacies[i]
          try {
            // Obtenir l'itinéraire
            const route = await getRoute(
              { lat: userLocation.lat, lng: userLocation.lng },
              { lat: pharmacy.latitude, lng: pharmacy.longitude },
            )

            // Créer une polyline pour l'itinéraire
            const polylineOptions = {
              color: colors[i % colors.length],
              weight: 5,
              opacity: 0.7,
              dashArray: route.isDirectLine ? "10, 10" : null, // Ligne pointillée si c'est une ligne directe
            }

            const polyline = L.polyline(route.coordinates, polylineOptions)
              .addTo(mapRef.current)
              .bindTooltip(
                `${pharmacy.nom}: ${route.distance.toFixed(2)} km (${route.duration} min)${
                  route.isDirectLine ? " - Itinéraire approximatif" : ""
                }`,
              )

            polylinesRef.current.push(polyline)

            // Stocker les infos de l'itinéraire
            newRouteInfos.push({
              pharmacyId: pharmacy.id_pharmacie,
              pharmacyName: pharmacy.nom,
              distance: route.distance,
              duration: route.duration,
              isDirectLine: route.isDirectLine,
              color: colors[i % colors.length],
            })
          } catch (error) {
            console.error("Erreur lors de la création d'un itinéraire:", error)
          }
        }

        setRouteInfos(newRouteInfos)
      }

      fetchRoutes()
    }

    // Si une pharmacie est sélectionnée, zoomer dessus
    if (selectedPharmacy) {
      mapRef.current.setView([selectedPharmacy.latitude, selectedPharmacy.longitude], 15)
    }

    // Nettoyer les polylines lors du démontage
    return cleanupPolylines
  }, [isMapReady, L, showRoutes, userLocation, pharmacies, selectedPharmacy])

  // Afficher un placeholder pendant le chargement de la carte
  if (!isMapReady) {
    return <MapLoading />
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg border" />

      {/* Le panneau d'informations sur les itinéraires a été supprimé */}
    </div>
  )
}

// Exporter un composant qui sera chargé dynamiquement côté client uniquement
export default dynamic(() => Promise.resolve(PharmacyMap), {
  ssr: false, // Désactiver le rendu côté serveur pour ce composant
  loading: () => <MapLoading />, // Composant à afficher pendant le chargement
})
