"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Message = {
  id?: number;
  content: string;
  user_id?: number;
  username?: string;
  channel_id?: number;
  created_at?: string;
};

type CurrentUser = {
  id: number;
  username: string;
  email: string;
};

const API_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/ws/channels";

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fetchCurrentUser = async () => {
    const token = getToken();

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch current user");
      }

      setCurrentUser(data);
    } catch (err: any) {
      console.error("Current user error:", err);
      setError(err.message || "Failed to fetch user");
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

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch messages");
      }

      setMessages(data.reverse());
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 100);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();

    const socket = new WebSocket(`${WS_URL}/${channelId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);

      setMessages((prev) => {
        const alreadyExists = prev.some((msg) => msg.id === newMessage.id);
        if (alreadyExists) return prev;
        return [...prev, newMessage];
      });
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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!messageText.trim()) return;

    const trimmedMessage = messageText.trim();

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
          content: trimmedMessage,
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
            id: data.id,
            content: data.content,
            user_id: data.user_id,
            username: data.username,
            channel_id: data.channel_id,
            created_at: data.created_at,
          })
        );
      }

      setMessageText("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.15),_transparent_25%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_30%)]" />

      <div className="mx-auto flex h-screen max-w-7xl flex-col px-4 py-4">
        
        <div className="mb-4 flex shrink-0 items-center justify-between rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              Live Channel
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              # Channel {channelId}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Logged in as{" "}
              <span className="font-semibold text-white">
                {currentUser?.username || "Loading..."}
              </span>
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-4 shrink-0 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
         
          <div className="hidden w-72 shrink-0 border-r border-white/10 bg-black/20 p-5 lg:block">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
                Channel Space
              </p>
              <h2 className="mt-3 text-2xl font-bold">Realtime Chat</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                This is your live discussion room. Messages update through WebSocket,
                so the experience feels more like a real SaaS product instead of a static CRUD app.
              </p>
            </div>

            <div className="mt-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-sm text-emerald-300">Status</p>
              <p className="mt-2 text-xl font-bold text-white">Live</p>
              <p className="mt-2 text-sm text-zinc-300">
                WebSocket connected room
              </p>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-zinc-400">Messages</p>
              <p className="mt-2 text-3xl font-bold text-white">{messages.length}</p>
            </div>
          </div>

          
          <div className="flex min-h-0 flex-1 flex-col">
            
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Realtime Discussion</h2>
                <p className="text-sm text-zinc-400">
                  FastAPI + WebSocket powered chat
                </p>
              </div>

              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Live
              </div>
            </div>

            
            <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
              {loading ? (
                <div className="text-zinc-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-8 py-10 text-center">
                    <p className="text-lg font-semibold text-white">No messages yet</p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Start the first conversation in this channel.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => {
                    const isMe = Number(message.user_id) === Number(currentUser?.id);

                    return (
                      <div
                        key={`${message.id ?? "ws"}-${index}`}
                        className={`flex items-end gap-3 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMe && (
                          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 font-bold md:flex">
                            {(message.username || "U").charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div
                          className={`max-w-[90%] md:max-w-[70%] ${
                            isMe ? "items-end" : "items-start"
                          } flex flex-col`}
                        >
                          {!isMe && (
                            <div className="mb-2 flex items-center gap-2 px-1">
                              <p className="text-sm font-semibold text-blue-400">
                                {message.username || `User ${message.user_id}`}
                              </p>
                              <span className="text-xs text-zinc-500">
                                {formatDate(message.created_at)}
                              </span>
                            </div>
                          )}

                          <div
                            className={`rounded-[26px] border px-5 py-4 shadow-2xl ${
                              isMe
                                ? "rounded-br-md border-emerald-400/20 bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                                : "rounded-bl-md border-white/10 bg-[#12121a] text-zinc-100"
                            }`}
                          >
                            <p className="text-sm leading-7 break-words">
                              {message.content}
                            </p>

                            <p
                              className={`mt-3 text-[11px] ${
                                isMe ? "text-emerald-100/80" : "text-zinc-400"
                              }`}
                            >
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>

                        {isMe && (
                          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 font-bold md:flex">
                            {currentUser?.username?.charAt(0).toUpperCase() || "Y"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            
            <form
              onSubmit={handleSendMessage}
              className="shrink-0 border-t border-white/10 bg-black/10 p-4"
            >
              <div className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-[#111117] p-2 shadow-xl">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Drop your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending}
                  className="flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-zinc-500 disabled:opacity-70"
                />

                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

