"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Channel = {
  id: number;
  name: string;
  server_id: number;
};

type Server = {
  id: number;
  name: string;
  invite_code?: string;
};

const API_URL = "http://localhost:8000";

export default function ServerPage() {
  const router = useRouter();
  const params = useParams();
  const serverId = params.serverId as string;

  const [server, setServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelName, setChannelName] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingServer, setDeletingServer] = useState(false);
  const [deletingChannelId, setDeletingChannelId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchServerAndChannels = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const serverRes = await fetch(`${API_URL}/servers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const serverData = await serverRes.json();

      if (!serverRes.ok) {
        throw new Error(serverData.detail || "Failed to fetch servers");
      }

      const foundServer = serverData.find((s: Server) => String(s.id) === serverId);
      setServer(foundServer || null);

      const channelRes = await fetch(`${API_URL}/servers/${serverId}/channels`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const channelData = await channelRes.json();

      if (!channelRes.ok) {
        throw new Error(channelData.detail || "Failed to fetch channels");
      }

      setChannels(channelData);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerAndChannels();
  }, [serverId]);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelName.trim()) {
      setError("Channel name is required");
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        `${API_URL}/servers/${serverId}/channels?name=${encodeURIComponent(channelName.trim())}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create channel");
      }

      setSuccess("Channel created successfully");
      setChannelName("");
      fetchServerAndChannels();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const confirmDelete = confirm("Delete this channel?");
    if (!confirmDelete) return;

    try {
      setDeletingChannelId(channelId);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_URL}/channels/${channelId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to delete channel");
      }

      setSuccess("Channel deleted successfully");
      fetchServerAndChannels();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDeletingChannelId(null);
    }
  };

  const handleDeleteServer = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const confirmDelete = confirm(
      "Are you sure you want to delete this server? This will remove all channels too."
    );
    if (!confirmDelete) return;

    try {
      setDeletingServer(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_URL}/servers/${serverId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to delete server");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDeletingServer(false);
    }
  };

  const openChannel = (channelId: number) => {
    router.push(`/channels/${channelId}`);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.15),_transparent_25%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_30%)]" />

      <div className="mx-auto max-w-7xl px-4 py-8">
       
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-400">
              Server Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">
              {server?.name || "Loading..."}
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              Invite Code: {server?.invite_code || "N/A"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              Back to Dashboard
            </button>

            <button
              onClick={handleDeleteServer}
              disabled={deletingServer}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold transition hover:bg-red-500 disabled:opacity-60"
            >
              {deletingServer ? "Deleting..." : "Delete Server"}
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
         
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Create Channel</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Add a new text channel inside this server.
            </p>

            <form onSubmit={handleCreateChannel} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="general, memes, backend-help..."
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-400"
              />

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-4 font-semibold transition hover:from-blue-500 hover:to-violet-500 disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Channel"}
              </button>
            </form>
          </div>

          
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-zinc-400">Total Channels</p>
              <p className="mt-3 text-4xl font-bold">{loading ? "..." : channels.length}</p>
            </div>
          </div>

         
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Realtime Ready</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Open any channel below to start chatting with live WebSocket updates.
            </p>
          </div>
        </div>

        
        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-400">
              Channels
            </p>
            <h2 className="mt-2 text-3xl font-bold">Server Channels</h2>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-8 text-zinc-400">
              Loading channels...
            </div>
          ) : channels.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-zinc-400">
              No channels yet. Create one first.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="group rounded-[28px] border border-white/10 bg-black/20 p-5 transition hover:-translate-y-1 hover:border-emerald-400 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-2xl font-bold">
                      #
                    </div>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                      ID: {channel.id}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-semibold"># {channel.name}</h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    Open this channel and start chatting.
                  </p>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => openChannel(channel.id)}
                      className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold transition hover:bg-emerald-500"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      disabled={deletingChannelId === channel.id}
                      className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold transition hover:bg-red-500 disabled:opacity-60"
                    >
                      {deletingChannelId === channel.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
