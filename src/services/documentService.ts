import { API_URL } from "@/consts"
import axios from "axios"
import type { 
  Document, 
  UploadDocumentResponse, 
  ListDocumentsResponse,
  DocumentChunksResponse 
} from "@/types/types"

class DocumentService {
  
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  async uploadDocument(file: File): Promise<UploadDocumentResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post<UploadDocumentResponse>(
        `${API_URL}/documents`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to upload document')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  async listDocuments(): Promise<Document[]> {
    try {
      const response = await axios.get<ListDocumentsResponse>(
        `${API_URL}/documents`,
        { headers: this.getAuthHeaders() }
      )
      
      return response.data.documents
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to fetch documents')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_URL}/documents/${documentId}`,
        { headers: this.getAuthHeaders() }
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to delete document')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  async getDocumentChunks(documentId: string) {
    try {
      const response = await axios.get<DocumentChunksResponse>(
        `${API_URL}/documents/${documentId}/chunks`,
        { headers: this.getAuthHeaders() }
      )
      
      return response.data.chunks
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to fetch document chunks')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export const documentService = new DocumentService()
