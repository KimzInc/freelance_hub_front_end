import { useEffect, useState } from "react";
import { getMessages, sendMessage } from "../services/requests";

export default function ChatBox({ requestId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load messages
  const fetchMessages = async () => {
    try {
      const data = await getMessages(requestId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(requestId, newMessage);
      setNewMessage("");
      fetchMessages(); // refresh
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Poll every 5 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages(requestId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  if (loading) return <p className="text-gray-500">Loading chat…</p>;

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="font-semibold mb-2">Project Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 bg-white rounded">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <span className="font-medium text-blue-700">
                {msg.sender_display_name}:
              </span>{" "}
              <span className="text-gray-800">{msg.content}</span>
              <div className="text-xs text-gray-400">
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type a message…"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
