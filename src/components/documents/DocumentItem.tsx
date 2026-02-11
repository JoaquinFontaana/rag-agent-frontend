"use client"

import { useState } from "react"
import type { Document, DocumentChunk } from "@/types/types"
import { documentService } from "@/services/documentService"
import ConfirmModal from "../ui/ConfirmModal"
import Button from "../ui/Button"

interface DocumentItemProps {
  readonly document: Document
  readonly onDelete: () => void
}

export default function DocumentItem({ document, onDelete }: DocumentItemProps) {
  const [showChunks, setShowChunks] = useState(false)
  const [chunks, setChunks] = useState<DocumentChunk[]>([])
  const [isLoadingChunks, setIsLoadingChunks] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
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
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">
            {document.filename}
          </h3>
          <div className="mt-1 text-sm text-gray-400 space-y-1">
            <p>Chunks: {document.total_chunks}</p>
            <p>Uploaded: {formatDate(document.uploaded_at)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleViewChunks}
            disabled={isLoadingChunks}
          >
            {(() => {
              if (isLoadingChunks) return "...";
              return showChunks ? "Hide" : "View";
            })()}
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? "..." : "Delete"}
          </Button>
        </div>
      </div>

      {showChunks && chunks.length > 0 && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="p-3 bg-gray-900/50 rounded border border-gray-700"
            >
              <div className="text-xs text-gray-500 mb-1">
                Chunk {chunk.metadata.chunk_index + 1} of {chunk.metadata.total_chunks}
              </div>
              <p className="text-sm text-gray-300 line-clamp-3">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Document"
        message={`Are you sure you want to delete "${document.filename}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
