"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Search, MoreVertical, Edit, Trash2, MapPin, Phone, Info } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function PharmaciesList() {
  const router = useRouter()
  const [allPharmacies, setAllPharmacies] = useState([])
  const [filteredPharmacies, setFilteredPharmacies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pharmacyToDelete, setPharmacyToDelete] = useState(null)
  const itemsPerPage = 10
  const { toast } = useToast()

  // Fonction pour récupérer les pharmacies
  const fetchPharmacies = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacie`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des pharmacies")
      }

      const data = await response.json()
      setAllPharmacies(data)
      setFilteredPharmacies(data)
      setTotalPages(Math.ceil(data.length / itemsPerPage))
      setIsLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des pharmacies:", error)
      setIsLoading(false)
      toast({
        title: "Erreur",
        description: "Impossible de charger les pharmacies",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    // Charger les pharmacies
    fetchPharmacies()
  }, [router, fetchPharmacies])

  // Fonction pour filtrer les pharmacies en fonction du terme de recherche
  const handleSearch = useCallback(
    (e) => {
      const term = e.target.value
      setSearchTerm(term)
      setCurrentPage(1)

      if (term.trim() === "") {
        setFilteredPharmacies(allPharmacies)
      } else {
        const filtered = allPharmacies.filter(
          (p) =>
            p.nom.toLowerCase().includes(term.toLowerCase()) || p.adresse.toLowerCase().includes(term.toLowerCase()),
        )
        setFilteredPharmacies(filtered)
      }
    },
    [allPharmacies],
  )

  useEffect(() => {
    // Mettre à jour le nombre total de pages lorsque les pharmacies filtrées changent
    setTotalPages(Math.ceil(filteredPharmacies.length / itemsPerPage))
  }, [filteredPharmacies])

  const handleEdit = (id) => {
    router.push(`/admin/pharmacies/${id}`)
  }

  const handleDelete = (pharmacy) => {
    setPharmacyToDelete(pharmacy)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pharmacie/${pharmacyToDelete.id_pharmacie}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la pharmacie")
      }

      // Mettre à jour la liste des pharmacies
      const updatedPharmacies = allPharmacies.filter((p) => p.id_pharmacie !== pharmacyToDelete.id_pharmacie)
      setAllPharmacies(updatedPharmacies)
      setFilteredPharmacies(filteredPharmacies.filter((p) => p.id_pharmacie !== pharmacyToDelete.id_pharmacie))
      setDeleteDialogOpen(false)

      toast({
        title: "Succès",
        description: "La pharmacie a été supprimée avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pharmacie",
        variant: "destructive",
      })
    }
  }

  // Pagination des pharmacies
  const paginatedPharmacies = filteredPharmacies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-emerald-600">Gestion des pharmacies</h1>
          <Button onClick={() => router.push("/admin/pharmacies/new")} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une pharmacie
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Liste des pharmacies</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-8" value={searchTerm} onChange={handleSearch} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead className="hidden md:table-cell">Adresse</TableHead>
                        <TableHead className="hidden lg:table-cell">Téléphone</TableHead>
                        <TableHead className="hidden lg:table-cell">Services</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPharmacies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Aucune pharmacie trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedPharmacies.map((pharmacy) => (
                          <TableRow key={pharmacy.id_pharmacie}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{pharmacy.nom}</span>
                                <span className="text-xs text-muted-foreground md:hidden">{pharmacy.adresse}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                {pharmacy.adresse}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {pharmacy.telephone || "Non renseigné"}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <Info className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{pharmacy.services || "Aucun service"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(pharmacy.id_pharmacie)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 focus:text-red-500"
                                    onClick={() => handleDelete(pharmacy)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement la pharmacie
              {pharmacyToDelete && <strong> {pharmacyToDelete.nom}</strong>} et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
