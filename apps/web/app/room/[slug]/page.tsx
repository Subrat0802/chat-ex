import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../../components/ChatRoom";

async function getRoomId(slug: string) {
    const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
    console.log("ROOM RSPONSE", response.data);
    return response.data.roomId.id;
}

export default async function ChatRoomId({
    params
}: {
    params: Promise<{ slug: string }>  // Fixed: params is a Promise
}) {
    const { slug } = await params;  // Fixed: await params directly
    const roomId = await getRoomId(slug);

    return <ChatRoom id={roomId} />
}