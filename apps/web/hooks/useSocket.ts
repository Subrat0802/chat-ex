import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZTEwZjFkLTk1YmYtNDdiMi1hNjQ3LWQwNWRiZmFiMDQ1MiIsImVtYWlsIjoic3VicmF0amlAZ21haWwuY29tIiwiaWF0IjoxNzY5MDMzNzM4LCJleHAiOjE3NjkxMjAxMzh9.mz2T99zfwIABbBQygUXwV1gzYODFNIwCUx0gr25PBUs";
        
        if (!token) {
            // console.error("No token found");
            setLoading(false);
            return;
        }

        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            console.log("WebSocket connected");
            setSocket(ws);
            setLoading(false);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setLoading(false);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setSocket(null);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    return { socket, loading };
}
