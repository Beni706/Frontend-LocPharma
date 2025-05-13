"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Remplacer par un appel API réel
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/administrateur/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Email ou mot de passe incorrect")
      }

      const data = await response.json()
      localStorage.setItem("adminToken", data.token)
      router.push("/admin/dashboard")
    } catch (err) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="relative h-12 w-12 mb-2">
            <Image
              src="/logo.jpg"
              alt="Pharma Labs Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-center text-emerald-600">Espace Administrateur</CardTitle>
          <CardDescription className="text-center">Connectez-vous pour gérer les pharmacies</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pharmalabs.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500"></p>
        </CardFooter>
      </Card>
    </div>
  )
}