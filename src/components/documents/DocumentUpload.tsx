"use client"

import { useState, useRef, DragEvent } from "react"
import { documentService } from "@/services/documentService"

interface DocumentUploadProps {
  readonly onUploadSuccess: () => void
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await uploadFile(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await uploadFile(files[0])
    }
  }

  const uploadFile = async (file: File) => {
    setError(null)
    setIsUploading(true)

    try {
      await documentService.uploadDocument(file)
      onUploadSuccess()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer w-full
          transition-all
          ${isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-500/50 hover:bg-gray-800/50"}
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-2">
          {isUploading ? (
            <p className="text-gray-300">Uploading...</p>
          ) : (
            <>
              <p className="text-gray-200 font-medium">
                Drop a file here or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supports PDF, TXT and MD files
              </p>
            </>
          )}
        </div>
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
