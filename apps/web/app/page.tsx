'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [slug, setSlug] = useState("");
  const router = useRouter();
  
  return (
    <div style={{padding:"30px"}}>
      <input 
        placeholder="Room Id" 
        type="text" 
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <button onClick={() => {
        if (slug.trim()) {
          router.push(`/room/${slug}`)
        }
      }}>
        Join room
      </button>
    </div>
  );
}