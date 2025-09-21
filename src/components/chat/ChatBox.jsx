import { useEffect, useState, useRef, useCallback } from "react";
import { getMessages, sendMessage } from "../services/requests";

export default function ChatBox({ requestId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [ws, setWs] = useState(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial message history
  const fetchMessages = useCallback(async () => {
    try {
      const data = await getMessages(requestId);
      setMessages(Array.isArray(data) ? data : []);
      setHasLoadedHistory(true);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // WebSocket connection - ONLY for real-time updates
  useEffect(() => {
    if (!hasLoadedHistory) return; // Wait until history is loaded

    const backendHost = process.env.REACT_APP_API_URL;
    const backendUrl = new URL(backendHost);
    const protocol = backendUrl.protocol === "https:" ? "wss:" : "ws:";
    const host = backendUrl.host;
    const token = localStorage.getItem("access");
    const wsUrl = `${protocol}//${host}/ws/chat/${requestId}/?token=${token}`;

    console.log("Connecting to WebSocket:", wsUrl);

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected successfully");
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const serverMsg = data.message;

        setMessages((prev) => {
          // Check if message already exists by ID (for real messages)
          if (serverMsg.id && prev.some((m) => m.id === serverMsg.id)) {
            return prev;
          }

          // Check if this is an update for a temp message
          if (serverMsg.client_temp_id) {
            const idx = prev.findIndex(
              (m) => m.client_temp_id === serverMsg.client_temp_id
            );
            if (idx !== -1) {
              const newArr = [...prev];
              newArr[idx] = serverMsg;
              return newArr;
            }
          }

          // For new messages from other users, append to the end
          return [...prev, serverMsg];
        });
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      setWs(null);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) websocket.close();
    };
  }, [requestId, hasLoadedHistory]); // Only connect when history is loaded

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const tempId = `temp-${Date.now()}`;

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({ message: newMessage, client_temp_id: tempId })
        );

        // Optimistically show the message immediately
        const tempMessage = {
          id: tempId,
          content: newMessage,
          sender_display_name: "You",
          created_at: new Date().toISOString(),
          _temp: true,
          client_temp_id: tempId,
        };
        setMessages((prev) => [...prev, tempMessage]);
      } else {
        // Fallback to HTTP
        console.log("WebSocket not available, using HTTP fallback");
        const sentMessage = await sendMessage(requestId, newMessage);
        setMessages((prev) => [...prev, sentMessage]);
      }
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading chat…</p>;

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="font-semibold mb-2">Project Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 bg-white rounded">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id || msg.client_temp_id}
              className={`mb-2 ${msg._temp ? "opacity-70" : ""}`}
            >
              <span className="font-medium text-blue-700">
                {msg.sender_display_name}:
              </span>{" "}
              <span className="text-gray-800">{msg.content}</span>
              <div className="text-xs text-gray-400">
                {new Date(msg.created_at).toLocaleString()}
                {msg._temp && " (Sending...)"}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type a message…"
          disabled={isSending}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isSending || !newMessage.trim()}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>

      <div className="text-xs mt-2 text-gray-500">
        Connection:{" "}
        {ws
          ? ws.readyState === WebSocket.OPEN
            ? "✅ Connected"
            : "❌ Disconnected"
          : "❌ Not connected"}
      </div>
    </div>
  );
}
