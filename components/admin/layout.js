"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Store, Clock, Settings, LogOut, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [adminName, setAdminName] = useState("Admin")

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
    } else {
      // Simuler la récupération des informations de l'administrateur
      setAdminName("Admin Pharma")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  const navItems = [
    {
      name: "Tableau de bord",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/admin/dashboard",
    },
    {
      name: "Pharmacies",
      href: "/admin/pharmacies",
      icon: <Store className="h-5 w-5" />,
      active: pathname.startsWith("/admin/pharmacies"),
    },
   
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 p-4 border-b">
                <div className="relative h-8 w-8">
                  <Image src="/logo.jpg" alt="Pharma Labs Logo" width={32} height={32} className="object-contain" />
                </div>
                <span className="text-lg font-bold text-emerald-600">Pharma Labs</span>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 overflow-auto py-4">
                <ul className="grid gap-1 px-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          item.active
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="border-t p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/admin/dashboard" className="flex items-center gap-2 lg:ml-0">
          <div className="relative h-8 w-8">
            <Image src="/logo.jpg" alt="Pharma Labs Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-lg font-bold text-emerald-600 hidden md:inline">Pharma Labs Admin</span>
        </Link>

        <nav className="hidden lg:flex flex-1 items-center gap-6 ml-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                item.active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <span className="hidden sm:inline-block">{adminName}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
