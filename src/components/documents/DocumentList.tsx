"use client"

import { useState, useEffect } from "react"
import type { Document } from "@/types/types"
import { documentService } from "@/services/documentService"
import DocumentItem from "./DocumentItem"
import DocumentUpload from "./DocumentUpload"

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await documentService.listDocuments()
      setDocuments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  return (
    <section className="flex flex-col h-full bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800" style={{ height: "calc(100vh - 200px)" }}>
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white text-center">Documents</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <DocumentUpload onUploadSuccess={loadDocuments} />

        {isLoading && (
          <div className="text-center py-8 text-gray-400">
            Loading documents...
          </div>
        )}

        {!isLoading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!isLoading && !error && documents.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No documents uploaded yet
          </div>
        )}

        {!isLoading && !error && documents.length > 0 && (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentItem
                key={doc.document_id}
                document={doc}
                onDelete={loadDocuments}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
