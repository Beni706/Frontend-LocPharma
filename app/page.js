import Header from "@/components/header"
import HeroCarousel from "@/components/hero-carousel"
import PharmacyFinder from "@/components/pharmacy-finder"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroCarousel />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-emerald-600">
          Où est la pharmacie la plus proche ?
        </h1>
        <PharmacyFinder />
      </div>
    </main>
  )
}