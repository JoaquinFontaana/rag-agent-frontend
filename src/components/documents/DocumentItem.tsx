"use client"

import { useState } from "react"
import type { Document, DocumentChunk } from "@/types/types"
import { documentService } from "@/services/documentService"

interface DocumentItemProps {
  readonly document: Document
  readonly onDelete: () => void
}

export default function DocumentItem({ document, onDelete }: DocumentItemProps) {
  const [showChunks, setShowChunks] = useState(false)
  const [chunks, setChunks] = useState<DocumentChunk[]>([])
  const [isLoadingChunks, setIsLoadingChunks] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleViewChunks = async () => {
    if (showChunks) {
      setShowChunks(false)
      return
    }

    setIsLoadingChunks(true)
    try {
      const data = await documentService.getDocumentChunks(document.document_id)
      setChunks(data)
      setShowChunks(true)
    } catch (error) {
      console.error("Error loading chunks:", error)
    } finally {
      setIsLoadingChunks(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${document.filename}"?`)) return

    setIsDeleting(true)
    try {
      await documentService.deleteDocument(document.document_id)
      onDelete()
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Failed to delete document")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {document.filename}
          </h3>
          <div className="mt-1 text-sm text-gray-500 space-y-1">
            <p>Chunks: {document.total_chunks}</p>
            <p>Uploaded: {formatDate(document.uploaded_at)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleViewChunks}
            disabled={isLoadingChunks}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {(() => {
              if (isLoadingChunks) return "...";
              return showChunks ? "Hide" : "View";
            })()}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      </div>

      {showChunks && chunks.length > 0 && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="p-3 bg-gray-50 rounded border border-gray-200"
            >
              <div className="text-xs text-gray-500 mb-1">
                Chunk {chunk.metadata.chunk_index + 1} of {chunk.metadata.total_chunks}
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
