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
    <div>
      <h1>Register</h1>

      <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={registerUser} disabled={loading}>
          {loading ? "Registering..." : "Register"}
      </button>
    </div>
  )

}