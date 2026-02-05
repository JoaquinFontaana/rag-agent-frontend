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

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface StreamChunk {
  event: string;
  data: MessageChunk[];
}

export interface MessageChunk {
  type: string;
  content: string | ContentPart[];
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