import { authService } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: "processing" | "ready" | "error";
}

export interface DocumentsResponse {
  documents: Document[];
}

export interface UploadProgress {
  current: number;
  total: number;
  percentage: number;
}

class DocumentService {
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getDocuments(): Promise<Document[]> {
    try {
      const response = await fetch(`${API_URL}/documents`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data: DocumentsResponse = await response.json();
        return data.documents || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  }

  async uploadDocument(file: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error("Error uploading document:", error);
      return false;
    }
  }

  async uploadDocuments(
    files: File[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; failedFiles: string[] }> {
    const failedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const success = await this.uploadDocument(file);

      if (!success) {
        failedFiles.push(file.name);
      }

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          percentage: ((i + 1) / files.length) * 100,
        });
      }
    }

    return {
      success: failedFiles.length === 0,
      failedFiles,
    };
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }
}

export const documentService = new DocumentService();
