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
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Document Management</h1>
            <p className="mt-2 text-gray-400">
              Upload and manage documents for your RAG agent
            </p>
          </div>
          <button
            onClick={() => router.push("/chat")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Chat
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
          <DocumentList />
        </div>
      </div>
    </div>
  )
}
