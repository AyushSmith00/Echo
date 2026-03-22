"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Server = {
  id: number;
  name: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [servers, setServers] = useState<Server[]>([]);
  const [createName, setCreateName] = useState("");
  const [joinServerId, setJoinServerId] = useState("");

  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = "http://localhost:8000";

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchServers = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/servers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch servers");
      }

      setServers(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    fetchServers();
  }, []);

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createName.trim()) {
      setError("Server name is required");
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
        `${API_URL}/servers?name=${encodeURIComponent(createName)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create server");
      }

      setSuccess("Server created successfully");
      setCreateName("");
      fetchServers();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinServer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinServerId.trim()) {
      setError("Server ID is required");
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setJoinLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/servers/${joinServerId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to join server");
      }

      setSuccess("Joined server successfully");
      setJoinServerId("");
      fetchServers();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleOpenServer = (serverId: number) => {
    router.push(`/servers/${serverId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-950 via-slate-900 to-black px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-300 md:text-base">
              Create a server, join one, or open a server you already belong to.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold transition hover:bg-red-400"
          >
            Logout
          </button>
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
            <h2 className="text-xl font-semibold">Create Server</h2>
            <p className="mt-2 text-sm text-gray-400">
              Start your own server and become admin automatically.
            </p>

            <form onSubmit={handleCreateServer} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Enter server name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-400"
              />

              <button
                type="submit"
                disabled={createLoading}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {createLoading ? "Creating..." : "Create Server"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold">Join Server</h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter a server ID to join an existing server.
            </p>

            <form onSubmit={handleJoinServer} className="mt-6 space-y-4">
              <input
                type="number"
                placeholder="Enter server ID"
                value={joinServerId}
                onChange={(e) => setJoinServerId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-400"
              />

              <button
                type="submit"
                disabled={joinLoading}
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {joinLoading ? "Joining..." : "Join Server"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="mt-2 text-sm text-gray-400">
              Click any joined server below to enter the chat page.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-gray-400">Joined servers</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {loading ? "..." : servers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Your Servers</h2>
            <p className="mt-1 text-sm text-gray-400">
              Open a server to go to its chat page.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-gray-300">
              Loading servers...
            </div>
          ) : servers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-gray-400">
              No joined servers yet. Create one or join one first.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {servers.map((server) => (
                <button
                  key={server.id}
                  onClick={() => handleOpenServer(server.id)}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5 text-left transition hover:border-blue-400 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold">
                      {server.name.charAt(0).toUpperCase()}
                    </div>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                      ID: {server.id}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">{server.name}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Click to enter this server.
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
