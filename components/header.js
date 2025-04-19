import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-12 w-12 mt-2 -mr-0.5">
              {" "}
              {/* Ajuster la marge supérieure pour centrer verticalement */}
              <Image src="/logo.jpg" alt="Pharma Labs Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="flex flex-col justify-center -ml-1">
              {" "}
              {/* Utiliser justify-center pour aligner verticalement */}
              <span className="text-xl font-bold text-emerald-600">Pharma Labs</span>
              <span className="text-[0.7rem] font-bold text-gray-800 -mt-2">Toujours plus proche de vous</span>{" "}
              {/* text-sm et text-gray-800 */}
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/admin/login"
            className="hidden md:block text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md transition-colors"
          >
            Espace Admin
          </Link>
        </div>
      </div>
    </header>
  )
}
