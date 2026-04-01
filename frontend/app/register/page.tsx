"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const registerUser = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setSuccess("Account created successfully. Redirecting to login...");
      setUsername("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.15),_transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">
          <div className="hidden flex-col justify-between border-r border-white/10 p-10 lg:flex">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                Build your space
              </div>

              <h1 className="max-w-md text-5xl font-bold leading-tight">
                Create your team’s new digital HQ.
              </h1>

              <p className="mt-6 max-w-lg text-base text-zinc-300">
                Create servers, channels, invite people, and start building a
                proper modern communication app.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-sm text-zinc-400">What you’re building</p>
              <p className="mt-2 text-3xl font-bold">Discord × SaaS vibe</p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
                  Get started
                </p>
                <h2 className="mt-3 text-4xl font-bold">Create account</h2>
                <p className="mt-2 text-zinc-400">
                  Register and jump into Echo.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Username</label>
                  <input
                    type="text"
                    placeholder="Ayush"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400"
                  />
                </div>

                <button
                  onClick={registerUser}
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 font-semibold text-white transition hover:scale-[1.01] hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create account"}
                </button>
              </div>

              <div className="my-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-sm text-zinc-500">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className="text-sm text-zinc-400">
                Already have an account?{" "}
                <a href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

