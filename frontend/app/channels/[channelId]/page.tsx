"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Message = {
  id: number;
  content: string;
  user_id: number;
  channel_id: number;
  created_at?: string;
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
  const WS_URL = "ws://localhost:8000";

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
        throw new Error(data.detail || "Failed to load messages");
      }

      setMessages(data.reverse());
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const socket = new WebSocket(`${WS_URL}/ws/channels/${channelId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);

      setMessages((prev) => [...prev, newMessage]);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    fetchMessages();
    connectWebSocket();

    return () => {
      socketRef.current?.close();
    };
  }, [channelId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

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

      socketRef.current?.send(
        JSON.stringify({
          id: data.id,
          content: data.content,
          user_id: data.user_id,
          channel_id: data.channel_id,
          created_at: data.created_at,
        })
      );

      setMessageText("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen flex-col bg-linear-to-br from-gray-950 via-slate-900 to-black text-white">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Channel Chat</h1>
            <p className="text-sm text-gray-400">Channel ID: {channelId}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              Back
            </button>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-medium hover:bg-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          {loading ? (
            <div className="text-gray-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              No messages yet. Send the first one.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="max-w-xl rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="text-sm font-semibold text-blue-400">
                    User {message.user_id}
                  </p>
                  <p className="mt-1 text-gray-200">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-400"
          />

          <button
            type="submit"
            disabled={sending}
            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-70"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
