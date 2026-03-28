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

type CurrentUser = {
  id: number;
  username: string;
  email: string;
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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const API_URL = "http://localhost:8000";
  const WS_URL = "ws://localhost:8000/ws/channels";

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCurrentUser = async () => {
  const token = getToken();

  console.log("TOKEN USED:", token);

  if (!token) {
    router.push("/login");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/get_user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("GET_USER STATUS:", response.status);

    const data = await response.json();

    console.log("GET_USER DATA:", data);

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch current user");
    }

    setCurrentUser(data);
  } catch (err: any) {
    console.error("FULL ERROR:", err);
  }
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

      console.log("FETCHED MESSAGES:", data);

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
    fetchCurrentUser();
    fetchMessages();

    const socket = new WebSocket(`${WS_URL}/${channelId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      console.log("WS MESSAGE RECEIVED:", newMessage);

      setMessages((prev) => [...prev, newMessage]);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          content: messageText.trim(),
          channel_id: Number(channelId),
        }),
      });

      const data = await response.json();

      console.log("SENT MESSAGE RESPONSE:", data);

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
    <main className="h-screen bg-linear-to-br from-gray-950 via-slate-900 to-black text-white">
      <div className="mx-auto flex h-screen max-w-5xl flex-col px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Channel Chat</h1>
            <p className="text-sm text-gray-400">Channel ID: {channelId}</p>
            <p className="text-xs text-gray-500 mt-1">
              Logged in as: {currentUser?.username || "Loading..."} | ID:{" "}
              {currentUser?.id ?? "?"}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Back
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 shrink-0">
            {error}
          </div>
        )}

        {/* Chat container */}
        <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {loading ? (
              <div className="text-gray-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-gray-400">No messages yet.</div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const isMe = Number(message.user_id) === Number(currentUser?.id);

                  console.log("MESSAGE CHECK:", {
                    messageUserId: message.user_id,
                    currentUserId: currentUser?.id,
                    isMe,
                    content: message.content,
                  });

                  return (
                    <div
                      key={`${message.id ?? "ws"}-${index}`}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 border ${
                          isMe
                            ? "bg-green-600 border-green-500 text-white rounded-br-md"
                            : "bg-black/20 border-white/10 text-gray-200 rounded-bl-md"
                        }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-semibold mb-1 text-indigo-400">
                            {message.username || `User ${message.user_id}`}
                          </p>
                        )}

                        <p className="text-sm wrap-break-words">{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="flex gap-3 border-t border-white/10 p-4 shrink-0"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sending}
              className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-green-400 disabled:opacity-70"
            />

            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold transition hover:bg-green-500 disabled:opacity-70"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
