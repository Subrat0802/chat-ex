import axios from "axios"
import { BACKEND_URL } from "../app/config"
import { ChatRoomClient } from "./ChatRoomClient";

interface Message {
    id: number;
    message: string;
    userId: string;
    roomId: number;
    createdAt: string;
}

async function getChats(roomId: number) {
    try {
        const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
        return response.data.messages || [];  // Fixed typo: mesaages -> messages
    } catch (error) {
        console.error("Failed to fetch chats:", error);
        return [];
    }
}

export async function ChatRoom({ id }: {
    id: number  // Fixed: id should be number, not string
}) {
    const messages = await getChats(id);
    return <ChatRoomClient id={id} messages={messages} />
}