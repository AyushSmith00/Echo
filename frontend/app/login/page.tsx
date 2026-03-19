"use client"

import { useState } from "react"

export default function LoginPage() {

    const[email, setEmail] = useState("")
    const[password, setPassword] = useState("")
    const[loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)

        try {

            const res= await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })

            const data:any =await res.json()
            console.log(data)

            if(res.ok) {
                localStorage.setItem("token", data.access_token)
                alert("Login successfully")
            } else {
                alert(data.detail || "Login failed")
            }
            
        } catch (error) {
            console.error(error)
            alert("Login error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
            
            <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
                
                <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                    Welcome Back 👋
                </h1>

                <div className="space-y-4">
                    
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full p-3 sm:p-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all font-semibold text-white disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 h-px bg-gray-600"></div>
                    <span className="px-3 text-gray-400 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-600"></div>
                </div>

                {/* Register redirect */}
                <p className="text-center text-gray-400 text-sm">
                    Don’t have an account?{" "}
                    <a href="/register" className="text-blue-400 hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    )



}