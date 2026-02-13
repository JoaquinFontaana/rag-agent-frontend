"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Button from "../ui/Button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
export default function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        router.push("/login")
        setMobileMenuOpen(false)
    }

    return (
        <header className="bg-gray-900 border-b border-gray-800 top-0 z-40 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center justify-between">
                {/* Logo/Brand */}
                <Link
                    href="/"
                    className="flex items-center space-x-2 group"
                >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold text-xs sm:text-sm">RA</span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all">
                        RAGAgent
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    {user && (
                        <>
                            <Link
                                href="/chat"
                                className={`text-sm font-medium transition-colors ${pathname === "/chat"
                                    ? "text-blue-400"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Chat
                            </Link>
                            {user.role === "admin" && (
                                <>
                                    <Link
                                        href="/documents"
                                        className={`text-sm font-medium transition-colors ${pathname === "/documents"
                                            ? "text-blue-400"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Documents
                                    </Link>
                                    <Link
                                        href="/humanInTheLoop"
                                        className={`text-sm font-medium transition-colors ${pathname === "/humanInTheLoop"
                                            ? "text-blue-400"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Requests
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </nav>

                {/* Desktop Auth Button */}
                <div className="hidden md:flex items-center">
                    {user ? (
                        <Button
                            onClick={handleLogout}
                            variant="danger"
                            size="sm"
                            className="px-3 py-1.5"
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button
                            onClick={() => router.push("/login")}
                            variant="primary"
                            size="sm"
                            className="px-3 py-1.5"
                        >
                            Login
                        </Button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
                    {user && (
                        <div className="flex flex-col space-y-3 mb-4">
                            <Link
                                href="/chat"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`text-sm font-medium transition-colors px-2 py-1 ${pathname === "/chat"
                                    ? "text-blue-400"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Chat
                            </Link>
                            {user.role === "admin" && (
                                <>
                                    <Link
                                        href="/documents"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`text-sm font-medium transition-colors px-2 py-1 ${pathname === "/documents"
                                            ? "text-blue-400"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Documents
                                    </Link>
                                    <Link
                                        href="/humanInTheLoop"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`text-sm font-medium transition-colors px-2 py-1 ${pathname === "/humanInTheLoop"
                                            ? "text-blue-400"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        Human Requests
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                    {user ? (
                        <Button
                            onClick={handleLogout}
                            variant="danger"
                            size="sm"
                            className="w-full"
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                router.push("/login")
                                setMobileMenuOpen(false)
                            }}
                            variant="primary"
                            size="sm"
                            className="w-full"
                        >
                            Login
                        </Button>
                    )}
                </div>
            )}
        </header>
    )
}
