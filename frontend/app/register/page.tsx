"use client"

import { useState } from "react";

export default function registerPage() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const registerUser = async() => {
      setLoading(true)
      
      try {
            const res = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            })

            const data = await res.json()
            console.log(data)

            if (res.ok) {
                alert("User registered successfully!")
                setUsername("")
                setEmail("")
                setPassword("")
            } else {
                alert(data.detail || "Something went wrong")
            }

        } catch (error) {
            console.error(error)
            alert("Server error")
        }

        setLoading(false)

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
            
            <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
                
                <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    Create Account 🚀
                </h1>

                <div className="space-y-4">

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 transition"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 transition"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 transition"
                    />

                    <button
                        onClick={registerUser}
                        disabled={loading}
                        className="w-full p-3 sm:p-4 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all font-semibold text-white disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Register"}
                    </button>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 h-px bg-gray-600"></div>
                    <span className="px-3 text-gray-400 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-600"></div>
                </div>

                {/* Login redirect */}
                <p className="text-center text-gray-400 text-sm">
                    Already have an account?{" "}
                    <a href="/login" className="text-green-400 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    )


}