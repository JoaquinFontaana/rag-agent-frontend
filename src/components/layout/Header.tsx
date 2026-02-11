"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Button from "../ui/Button"
export default function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    return (
        <header className="bg-gray-900 border-b border-gray-800 top-0 z-40 px-6 py-5">
            <div className="flex items-center">
                {/* Left: Logo/Brand */}
                <div className="flex-1">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 group w-fit"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-sm">RA</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all">
                            RAGAgent
                        </span>
                    </Link>
                </div>

                {/* Center: Navigation Links */}
                <nav className="flex items-center justify-center space-x-6">
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
                                <Link
                                    href="/documents"
                                    className={`text-sm font-medium transition-colors ${pathname === "/documents"
                                        ? "text-blue-400"
                                        : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    Documents
                                </Link>
                            )}
                        </>
                    )}
                </nav>

                {/* Right: Auth Button */}
                <div className="flex-1 flex justify-end">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={handleLogout}
                                variant="danger"
                                className="px-4 py-2"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => router.push("/login")}
                            variant="primary"
                            className="px-4 py-2"
                        >
                            Login
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
