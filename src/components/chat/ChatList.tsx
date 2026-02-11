import { Thread } from "@/types/types";

//Sidebar con todos los threads del usuario
interface ChatListProps{
    readonly threads:Thread[]
    readonly onSelect: (threadId: string) => void
}
export default function ChatList({threads, onSelect}:ChatListProps){
    //Iterate in the threads and sort for updated_at if the thread dont have title puts New conversation like title
    return(
        <>
        </>
    )
}