import { useEffect } from "react";
import { toast } from "react-toastify";
import api from "../components/services/api";

export default function useNotifications(user) {
  useEffect(() => {
    if (!user?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}/ws/notifications/`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("🔔 Notifications connected");
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type !== "notification") return;

        const { title, message, data } = msg.payload;

        toast.info(
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm">{message}</div>

            {data?.file_url && (
              <button
                className="text-blue-600 underline mt-1"
                onClick={() => handleDownload(data.file_url)}
              >
                Download attachment
              </button>
            )}
          </div>,
          { autoClose: 8000 }
        );
      } catch (e) {
        console.error("Invalid notification payload", e);
      }
    };

    ws.onclose = () => {
      console.log("🔕 Notifications disconnected");
    };

    return () => ws.close();
  }, [user]);
}

async function handleDownload(apiUrl) {
  const res = await api.get(apiUrl);
  if (res.data?.url) {
    window.open(res.data.url, "_blank");
  }
}
