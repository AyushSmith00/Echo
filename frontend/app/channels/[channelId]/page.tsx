"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Message = {
  id?: number;
  content: string;
  user_id?: number;
  username?: string;
  channel_id?: number;
};

export default function ChannelPage() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.channelId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const socketRef = useRef<WebSocket | null>(null);

  const API_URL = "http://localhost:8000";
  const WS_URL = "ws://localhost:8000/ws/channels";

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchMessages = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/messages/${channelId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch messages");
      }

      setMessages(data.reverse());
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const socket = new WebSocket(`${WS_URL}/${channelId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [channelId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!messageText.trim()) return;

    try {
      setSending(true);
      setError("");

      const response = await fetch(`${API_URL}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: messageText,
          channel_id: Number(channelId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send message");
      }

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            content: data.content,
            user_id: data.user_id,
            username: data.username,
            channel_id: data.channel_id,
            id: data.id,
          })
        );
      }

      setMessageText("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-950 via-slate-900 to-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold">Channel Chat</h1>
            <p className="text-sm text-gray-400">Channel ID: {channelId}</p>
          </div>

          <button
            onClick={() => router.back()}
            className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          {loading ? (
            <div className="text-gray-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400">No messages yet.</div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.id ?? "ws"}-${index}`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="text-sm font-semibold text-indigo-400">
                    User {message.username || `User ${message.user_id}`}
                  </p>
                  <p className="mt-1 text-gray-200">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="mt-6 flex gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-indigo-400"
          />

          <button
            type="submit"
            disabled={sending}
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500 disabled:opacity-70"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
