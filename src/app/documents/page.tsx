"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import DocumentList from "@/components/documents/DocumentList"

export default function DocumentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && user.role !== "admin") {
      // Redirect non-admin users to chat
      router.push("/chat")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="h-full bg-gray-950 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 flex items-center justify-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">Document Management</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-400 text-center">
              Upload and manage documents for your RAG agent
            </p>
          </div>
        </div>
        <DocumentList />
      </div>
    </div>
  )
}
