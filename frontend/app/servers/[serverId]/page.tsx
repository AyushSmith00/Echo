"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Server = {
  id: number;
  name: string;
};

type Channel = {
  id: number;
  name: string;
  server_id: number;
};

export default function ServerPage() {
  const router = useRouter();
  const params = useParams();

  const serverId = params.serverId as string;

  const [server, setServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelName, setChannelName] = useState("");

  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteServerLoading, setDeleteServerLoading] = useState(false);
  const [deletingChannelId, setDeletingChannelId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://localhost:8000";

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchServerData = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const serverRes = await fetch(`${API_URL}/servers/${serverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const serverData = await serverRes.json();

      if (!serverRes.ok) {
        throw new Error(serverData.detail || "Failed to fetch server");
      }

      setServer(serverData);

      const channelRes = await fetch(`${API_URL}/servers/${serverId}/channels`, {
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
    fetchServerData();
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
      setCreateLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/servers/${serverId}/channels?name=${encodeURIComponent(channelName)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create channel");
      }

      setSuccess("Channel created successfully");
      setChannelName("");
      fetchServerData();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    const confirmed = window.confirm("Delete this channel?");
    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setDeletingChannelId(channelId);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/channels/${channelId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete channel");
      }

      setSuccess("Channel deleted successfully");
      fetchServerData();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDeletingChannelId(null);
    }
  };

  const handleDeleteServer = async () => {
    const confirmed = window.confirm("Delete this server?");
    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setDeleteServerLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/servers/${serverId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete server");
      }

      alert("Server deleted successfully");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDeleteServerLoading(false);
    }
  };

  const handleOpenChannel = (channelId: number) => {
    router.push(`/channels/${channelId}`);
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-950 via-slate-900 to-black px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {server ? server.name : "Server"}
            </h1>
            <p className="mt-2 text-sm text-gray-300">
              Manage channels and open chat rooms.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20"
            >
              Back
            </button>

            <button
              onClick={handleDeleteServer}
              disabled={deleteServerLoading}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold transition hover:bg-red-500 disabled:opacity-70"
            >
              {deleteServerLoading ? "Deleting..." : "Delete Server"}
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
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-1">
            <h2 className="text-xl font-semibold">Create Channel</h2>
            <p className="mt-2 text-sm text-gray-400">
              Add a new channel inside this server.
            </p>

            <form onSubmit={handleCreateChannel} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Enter channel name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-400"
              />

              <button
                type="submit"
                disabled={createLoading}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-70"
              >
                {createLoading ? "Creating..." : "Create Channel"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Channels</h2>
              <p className="mt-1 text-sm text-gray-400">
                Open a channel or delete one.
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-gray-300">
                Loading channels...
              </div>
            ) : channels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-gray-400">
                No channels yet. Create your first one.
              </div>
            ) : (
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/20 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold"># {channel.name}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        Channel ID: {channel.id}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenChannel(channel.id)}
                        className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-500"
                      >
                        Open
                      </button>

                      <button
                        onClick={() => handleDeleteChannel(channel.id)}
                        disabled={deletingChannelId === channel.id}
                        className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500 disabled:opacity-70"
                      >
                        {deletingChannelId === channel.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
