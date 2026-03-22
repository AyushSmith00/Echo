"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Server = {
  id: number
  name: string
}

type Channel = {
  id: number
  name: string
  server_id: number
}

type Message = {
  id: number
  content: string
  channel_id: number
  user_id: number
}

export default function ChatPage() {
  const router = useRouter()

  const [servers, setServers] = useState<Server[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)

  const [messageText, setMessageText] = useState("")
  const [loadingServers, setLoadingServers] = useState(true)
  const [loadingChannels, setLoadingChannels] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")

    console.log("TOKEN FROM LOCALSTORAGE:", token)

    if (!token) {
      router.push("/login")
      return
    }

    void fetchServers(token)
  }, [router])

  const fetchServers = async (token: string) => {
    try {
      setLoadingServers(true)

      console.log("TOKEN BEING SENT:", token)

      const res = await fetch("http://localhost:8000/servers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("SERVERS STATUS:", res.status)

      if (res.status === 401) {
        console.log("Unauthorized. Removing bad token.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!res.ok) {
        const errorText = await res.text()
        console.log("SERVERS ERROR BODY:", errorText)
        throw new Error(`Failed to fetch servers. Status: ${res.status}`)
      }

      const data = await res.json()
      console.log("SERVERS DATA:", data)

      setServers(data)

      if (data.length > 0) {
        setSelectedServer(data[0])
        await fetchChannels(data[0].id, token)
      } else {
        setSelectedServer(null)
        setChannels([])
        setSelectedChannel(null)
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching servers:", error)
    } finally {
      setLoadingServers(false)
    }
  }

  const fetchChannels = async (serverId: number, token: string) => {
    try {
      setLoadingChannels(true)
      setChannels([])
      setSelectedChannel(null)
      setMessages([])

      const res = await fetch(`http://localhost:8000/servers/${serverId}/channels`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("CHANNELS STATUS:", res.status)

      if (res.status === 401) {
        console.log("Unauthorized while fetching channels.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!res.ok) {
        const errorText = await res.text()
        console.log("CHANNELS ERROR BODY:", errorText)
        throw new Error(`Failed to fetch channels. Status: ${res.status}`)
      }

      const data = await res.json()
      console.log("CHANNELS DATA:", data)

      setChannels(data)

      if (data.length > 0) {
        setSelectedChannel(data[0])
        await fetchMessages(data[0].id, token)
      } else {
        setSelectedChannel(null)
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching channels:", error)
      setChannels([])
      setSelectedChannel(null)
      setMessages([])
    } finally {
      setLoadingChannels(false)
    }
  }

  const fetchMessages = async (channelId: number, token: string) => {
    try {
      setLoadingMessages(true)

      const res = await fetch(`http://localhost:8000/messages/${channelId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("MESSAGES STATUS:", res.status)

      if (res.status === 401) {
        console.log("Unauthorized while fetching messages.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!res.ok) {
        const errorText = await res.text()
        console.log("MESSAGES ERROR BODY:", errorText)
        throw new Error(`Failed to fetch messages. Status: ${res.status}`)
      }

      const data = await res.json()
      console.log("MESSAGES DATA:", data)

      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleServerClick = async (server: Server) => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setSelectedServer(server)
    await fetchChannels(server.id, token)
  }

  const handleChannelClick = async (channel: Channel) => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setSelectedChannel(channel)
    await fetchMessages(channel.id, token)
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login")
      return
    }

    if (!selectedChannel || !messageText.trim()) return

    try {
      setSendingMessage(true)

      const res = await fetch("http://localhost:8000/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: messageText.trim(),
          channel_id: selectedChannel.id,
        }),
      })

      console.log("SEND MESSAGE STATUS:", res.status)

      if (res.status === 401) {
        console.log("Unauthorized while sending message.")
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!res.ok) {
        const errorText = await res.text()
        console.log("SEND MESSAGE ERROR BODY:", errorText)
        throw new Error(`Failed to send message. Status: ${res.status}`)
      }

      setMessageText("")
      await fetchMessages(selectedChannel.id, token)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <aside className="w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-4">
        <div className="text-xs text-zinc-400 font-semibold">Echo</div>

        {loadingServers ? (
          <div className="text-[10px] text-zinc-500">...</div>
        ) : servers.length > 0 ? (
          servers.map((server) => (
            <button
              key={server.id}
              onClick={() => handleServerClick(server)}
              className={`w-12 h-12 rounded-2xl transition-all text-sm font-bold flex items-center justify-center ${
                selectedServer?.id === server.id
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
              title={server.name}
            >
              {server.name.charAt(0).toUpperCase()}
            </button>
          ))
        ) : (
          <div className="text-[10px] text-zinc-500 text-center px-1">
            No servers
          </div>
        )}
      </aside>

      <aside className="w-64 bg-zinc-900/80 border-r border-zinc-800 p-4 hidden md:block">
        <h2 className="text-lg font-bold mb-4">
          {selectedServer ? selectedServer.name : "Channels"}
        </h2>

        {loadingChannels ? (
          <p className="text-sm text-zinc-500">Loading channels...</p>
        ) : channels.length > 0 ? (
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelClick(channel)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  selectedChannel?.id === channel.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                # {channel.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No channels found</p>
        )}
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="h-16 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between px-4">
          <div>
            <h1 className="font-semibold text-lg">
              {selectedChannel ? `# ${selectedChannel.name}` : "Select a channel"}
            </h1>
            <p className="text-xs text-zinc-500">
              {selectedServer ? `Server: ${selectedServer.name}` : "Welcome to Echo chat"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium transition"
          >
            Logout
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
          {loadingMessages ? (
            <p className="text-zinc-500">Loading messages...</p>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-xl"
              >
                <p className="text-sm font-semibold text-indigo-400">
                  User {message.user_id}
                </p>
                <p className="text-zinc-300 mt-1">{message.content}</p>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-xl">
              <p className="text-sm font-semibold text-zinc-400">System</p>
              <p className="text-zinc-300 mt-1">
                {selectedChannel
                  ? "No messages yet. Send the first one."
                  : "Select a channel to view messages."}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={selectedChannel ? "Type a message..." : "Select a channel first"}
              disabled={!selectedChannel || sendingMessage}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!selectedChannel || sendingMessage || !messageText.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingMessage ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
