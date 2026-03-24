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

  const [loadingServer, setLoadingServer] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [creatingChannel, setCreatingChannel] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://localhost:8000";

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  const fetchServer = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoadingServer(true);
      setError("");

      const response = await fetch(`${API_URL}/servers/${serverId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch server");
      }

      setServer(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingServer(false);
    }
  };

  const fetchChannels = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoadingChannels(true);
      setError("");

      const response = await fetch(`${API_URL}/servers/${serverId}/channels`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch channels");
      }

      setChannels(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingChannels(false);
    }
  };

  useEffect(() => {
    fetchServer();
    fetchChannels();
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
      setCreatingChannel(true);
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

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create channel");
      }

      setSuccess("Channel created successfully");
      setChannelName("");
      fetchChannels();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setCreatingChannel(false);
    }
  };

  const handleOpenChannel = (channelId: number) => {
    router.push(`/channels/${channelId}`);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-950 via-slate-900 to-black px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="mb-3 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold md:text-4xl">
              {loadingServer ? "Loading server..." : server?.name || "Server"}
            </h1>

            <p className="mt-2 text-sm text-gray-300">
              Create channels and enter the server chat.
            </p>
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
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold">Create Channel</h2>
            <p className="mt-2 text-sm text-gray-400">
              Admins can create new channels for this server.
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
                disabled={creatingChannel}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creatingChannel ? "Creating..." : "Create Channel"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Channels</h2>
              <p className="mt-1 text-sm text-gray-400">
                Open a channel to view and send messages.
              </p>
            </div>

            {loadingChannels ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-gray-300">
                Loading channels...
              </div>
            ) : channels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-gray-400">
                No channels yet. Create the first one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleOpenChannel(channel.id)}
                    className="rounded-3xl border border-white/10 bg-black/20 p-5 text-left transition hover:border-blue-400 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold">
                        #
                      </div>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                        ID: {channel.id}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">{channel.name}</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Click to open this channel.
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
