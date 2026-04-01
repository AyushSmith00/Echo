"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("user_id", String(data.user.id));
      localStorage.setItem("email", data.user.email);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.2),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.15),_transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">
          
          <div className="hidden flex-col justify-between border-r border-white/10 p-10 lg:flex">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                Echo SaaS Chat
              </div>

              <h1 className="max-w-md text-5xl font-bold leading-tight">
                Real-time team chat that actually looks premium.
              </h1>

              <p className="mt-6 max-w-lg text-base text-zinc-300">
                Servers, channels, invite codes, and realtime chat — now with a
                proper modern UI instead of “bro I just passed CSS”.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-zinc-400">Realtime</p>
                <p className="mt-2 text-2xl font-bold">WebSockets</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-zinc-400">Backend</p>
                <p className="mt-2 text-2xl font-bold">FastAPI</p>
              </div>
            </div>
          </div>

         
          <div className="p-6 sm:p-10">
            <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.2em] text-blue-400">
                  Welcome back
                </p>
                <h2 className="mt-3 text-4xl font-bold">Login</h2>
                <p className="mt-2 text-zinc-400">
                  Enter your credentials to continue.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-400"
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 font-semibold text-white transition hover:scale-[1.01] hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>

              <div className="my-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-sm text-zinc-500">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className="text-sm text-zinc-400">
                Don’t have an account?{" "}
                <a href="/register" className="font-semibold text-blue-400 hover:text-blue-300">
                  Create one
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
