import { UIMessage } from "ai"
export interface User{
    id:number
    email:string
    role: "admin" | "user"
}
export interface Response{
    statusCode:number
    detail:string
    ok:boolean
}
export interface ContentPart {
  text?: string;
}

export interface LoginCredentials{
  email:string
  password:string
}
export interface RegisterCredentials{
    email:string
   password:string
}

export interface ApiResponse {
  message: string
}

export interface LoginResponse {
  access_token: string
}

export interface BackendError {
  success: false
  error: {
    type: string
    message: string
    details?: string[]
  }
}

export interface JWTPayload {
  sub: string       // user id
  email: string
  role: "admin" | "user"
  exp: number       // expiration
  iat: number       // issued at
}

// Document types
export interface Document {
  document_id: string
  filename: string
  uploaded_at: string
  total_chunks: number
}

export interface DocumentChunk {
  id: string
  content: string
  metadata: {
    document_id: string
    filename: string
    chunk_index: number
    total_chunks: number
    uploaded_at: string
  }
}

export interface UploadDocumentResponse {
  message: string
  document_id: string
}


// Thread types
export interface Thread {
  thread_id: string
  created_at: string
  updated_at?: string
  metadata?: Metadata
  values?: unknown
}

export interface Metadata {
    userId: string;
}

export type MyUIMessage = UIMessage<Metadata>;

export interface ActiveThread{
    id: string;
    messages: MyUIMessage[];
    newConversation:boolean
}