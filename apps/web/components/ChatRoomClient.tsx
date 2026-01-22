"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

interface Message {
    id?: number;
    message: string;
    userId?: string;
    username?: string;
    timestamp?: string;
}

export function ChatRoomClient({
    messages,
    id
}: {
    messages: Message[],  // Fixed: proper type
    id: number  // Fixed: number not string
}) {
    const [chats, setChats] = useState<Message[]>(messages);
    const { socket, loading } = useSocket();
    const [currentMessage, setCurrentMessage] = useState("");

    useEffect(() => {
        if (socket && !loading) {
            // Join the room
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }));

            // Listen for messages
            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                
                console.log("Received:", parsedData);

                if (parsedData.type === "chat") {
                    setChats(c => [...c, {
                        id: parsedData.messageId,
                        message: parsedData.message,
                        userId: parsedData.userId,
                        username: parsedData.username,
                        timestamp: parsedData.timestamp
                    }]);
                }

                if (parsedData.type === "history") {
                    setChats(parsedData.messages);
                }

                if (parsedData.type === "error") {
                    console.error("WebSocket error:", parsedData.message);
                }
            };
        }

        // Cleanup: leave room when component unmounts
        return () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: "leave_room",
                    roomId: id
                }));
            }
        };
    }, [socket, loading, id]);

    const sendMessage = () => {
        if (!currentMessage.trim() || !socket) return;

        socket.send(JSON.stringify({
            type: "chat",
            roomId: id,
            message: currentMessage
        }));
        
        setCurrentMessage("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return <div>Connecting to chat...</div>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2>Chat Room {id}</h2>
            
            <div style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "20px",
                height: "400px",
                overflowY: "auto",
                marginBottom: "20px",
                backgroundColor: "#f9f9f9"
            }}>
                {chats.map((m) => (
                    <div key={m.id} style={{
                        marginBottom: "10px",
                        padding: "8px",
                        backgroundColor: "#070000ff",
                        borderRadius: "4px"
                    }}>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                            {m.username || m.userId || "Unknown"} 
                            {m.timestamp && ` • ${new Date(m.timestamp).toLocaleTimeString()}`}
                        </div>
                        <div>{m.message}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    value={currentMessage}
                    onChange={e => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim()}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: "#0070f3",
                        color: "white",
                        cursor: currentMessage.trim() ? "pointer" : "not-allowed",
                        opacity: currentMessage.trim() ? 1 : 0.5
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}