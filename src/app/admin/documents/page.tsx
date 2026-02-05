"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { documentService, Document } from "@/services/documentService";
import Button from "@/components/ui/Button";

export default function AdminDocumentsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const fetchDocuments = useCallback(async () => {
    const docs = await documentService.getDocuments();
    setDocuments(docs);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/login");
    } else if (isAdmin) {
      fetchDocuments();
    }
  }, [authLoading, isAdmin, router, fetchDocuments]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setError("");
    setUploadProgress(0);

    const result = await documentService.uploadDocuments(files, (progress) => {
      setUploadProgress(progress.percentage);
    });

    if (!result.success) {
      setError(`Failed to upload: ${result.failedFiles.join(", ")}`);
    }

    await fetchDocuments();
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleDeleteDocument = async (id: string) => {
    const success = await documentService.deleteDocument(id);
    if (success) {
      setDocuments(documents.filter((doc) => doc.id !== id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusStyles = (status: Document["status"]) => {
    const styles = {
      ready: "bg-green-500/10 text-green-500",
      processing: "bg-yellow-500/10 text-yellow-500",
      error: "bg-red-500/10 text-red-500",
    };
    return styles[status];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
          <p className="text-gray-400 mt-2">Upload FAQs, product guides, and support documents for the AI assistant</p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 hover:border-gray-600"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.md,.doc,.docx"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">
                {isUploading ? "Uploading..." : "Drop files here or click to upload"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Supports PDF, TXT, MD, DOC, DOCX
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">{Math.round(uploadProgress)}% complete</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Documents List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Uploaded Documents</h2>
          
          {documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-xl">
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Size</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Uploaded</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-800 last:border-0">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-white">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-400">{formatFileSize(doc.size)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(doc.status)}`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          onClick={() => handleDeleteDocument(doc.id)}
                          variant="ghost"
                          className="text-red-500 hover:text-red-400 p-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
