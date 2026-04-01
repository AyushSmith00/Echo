"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Server = {
  id: number;
  name: string;
  invite_code?: string;
};

const API_URL = "http://localhost:8000";

export default function DashboardPage() {
  const router = useRouter();

  const [servers, setServers] = useState<Server[]>([]);
  const [createName, setCreateName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    const savedUsername = localStorage.getItem("username");
    if (savedUsername) setUsername(savedUsername);

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

      setSuccess(`Server created! Invite code: ${data.invite_code}`);
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

    if (!inviteCode.trim()) {
      setError("Invite code is required");
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

      const response = await fetch(`${API_URL}/servers/join-by-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invite_code: inviteCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to join server");
      }

      setSuccess("Joined server successfully");
      setInviteCode("");
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
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.15),_transparent_25%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_30%)]" />

      <div className="mx-auto max-w-7xl px-4 py-8">
        
        <div className="mb-8 flex flex-col gap-5 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-400">
              Control Center
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">
              {username ? `Welcome back, ${username}` : "Dashboard"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 md:text-base">
              Create servers, join communities with invite codes, and manage your
              realtime collaboration space.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
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

     
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Joined Servers</p>
            <p className="mt-3 text-4xl font-bold">{loading ? "..." : servers.length}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Realtime Status</p>
            <p className="mt-3 text-2xl font-bold text-emerald-400">Online</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-zinc-400">Workspace Mode</p>
            <p className="mt-3 text-2xl font-bold text-blue-400">Echo SaaS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Create Server</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Start your own private workspace instantly.
            </p>

            <form onSubmit={handleCreateServer} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Ex: Dev Team, Anime Gang, Startup Lab"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-400"
              />

              <button
                type="submit"
                disabled={createLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 font-semibold transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
              >
                {createLoading ? "Creating..." : "Create Server"}
              </button>
            </form>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Join Server</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Use an invite code to enter an existing server.
            </p>

            <form onSubmit={handleJoinServer} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Paste invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400"
              />

              <button
                type="submit"
                disabled={joinLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 font-semibold transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60"
              >
                {joinLoading ? "Joining..." : "Join Server"}
              </button>
            </form>
          </div>
        </div>

        
        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-400">
              Workspaces
            </p>
            <h2 className="mt-2 text-3xl font-bold">Your Servers</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Open a server to manage its channels and chat.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-8 text-zinc-400">
              Loading servers...
            </div>
          ) : servers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-zinc-400">
              No joined servers yet. Create one or join one first.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {servers.map((server) => (
                <button
                  key={server.id}
                  onClick={() => handleOpenServer(server.id)}
                  className="group rounded-[28px] border border-white/10 bg-black/20 p-5 text-left transition hover:-translate-y-1 hover:border-blue-400 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold shadow-lg">
                      {server.name.charAt(0).toUpperCase()}
                    </div>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                      ID: {server.id}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">{server.name}</h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    Invite Code: {server.invite_code || "N/A"}
                  </p>

                  <div className="mt-5 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                    Open workspace
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

