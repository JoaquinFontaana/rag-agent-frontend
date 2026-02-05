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
