import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getCustomRequest,
  getCustomRequestSummary,
} from "../components/services/requests";
import ChatBox from "../components/chat/ChatBox";
import CustomRequestPurchaseModal from "../components/Projects/CustomRequestPurchaseModal";

export default function CustomRequestDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFullFile, setShowFullFile] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await getCustomRequestSummary(id);
        setRequest(data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        setError(
          err.response?.data?.detail || "Could not fetch request summary."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [id]);

  // Calculate time remaining until deadline
  useEffect(() => {
    if (!request || !request.deadline) return;

    const calculateTimeRemaining = () => {
      const deadline = new Date(request.deadline);
      const now = new Date();
      const difference = deadline - now;

      if (difference <= 0) {
        setTimeRemaining({ expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeRemaining();
    if (!timeRemaining.expired) {
      const timer = setInterval(calculateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [request, timeRemaining.expired]);

  const isUrgent = () => {
    if (!request || !request.deadline) return false;
    const deadline = new Date(request.deadline);
    const now = new Date();
    const hoursRemaining = (deadline - now) / (1000 * 60 * 60);
    return hoursRemaining <= 24 && hoursRemaining > 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading request details…</p>
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!request) {
    return <p className="p-6">No request found.</p>;
  }

  const formatMoney = (val) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);

  const statusColors = {
    REQUESTED: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const urgentColors = {
    URGENT: "bg-red-100 text-red-800 border border-red-300",
  };

  const formatTimeRemaining = () => {
    if (timeRemaining.expired) return "Deadline passed";
    if (!timeRemaining.days && !timeRemaining.hours && !timeRemaining.minutes) {
      return "Less than a minute remaining";
    }

    let parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`);

    return parts.join(" ") + " remaining";
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8 space-y-4">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">{request.title}</h1>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[request.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {request.status}
          </span>

          {isUrgent() && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${urgentColors.URGENT}`}
            >
              ⚡ URGENT
            </span>
          )}
        </div>
      </div>

      {request.paid_amount > 0 && request.deadline && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Time Remaining</h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-mono font-bold text-blue-900">
              {timeRemaining.expired ? (
                <span className="text-red-600">⏰ EXPIRED</span>
              ) : (
                <>
                  {timeRemaining.days > 0 && (
                    <span>{timeRemaining.days}d </span>
                  )}
                  <span>{String(timeRemaining.hours).padStart(2, "0")}:</span>
                  <span>{String(timeRemaining.minutes).padStart(2, "0")}:</span>
                  <span>{String(timeRemaining.seconds).padStart(2, "0")}</span>
                </>
              )}
            </div>
            <div className="text-sm text-blue-700">{formatTimeRemaining()}</div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Deadline: {new Date(request.deadline).toLocaleString()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p>
          <span className="font-medium">Deadline:</span> {request.deadline}
        </p>
        <p>
          <span className="font-medium">Style:</span> {request.style}
        </p>
        <p>
          <span className="font-medium">Pages:</span> {request.number_of_pages}
        </p>
        <p>
          <span className="font-medium">Sources:</span> {request.sources}
        </p>
        <p>
          <span className="font-medium">Total Price:</span>{" "}
          {formatMoney(request.total_price)}
        </p>
        <p>
          <span className="font-medium">Paid:</span>{" "}
          {formatMoney(request.paid_amount)}
        </p>
      </div>

      {/* Only render description/attached content if backend includes them (paid/full access) */}
      {request.description && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {request.description}
          </p>
        </div>
      )}

      {request.attached_file_content && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Attached File Content</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap overflow-y-auto max-h-60">
            {showFullFile
              ? request.attached_file_content
              : request.attached_file_content.slice(0, 1000) + "…"}
          </pre>
          <button
            onClick={() => setShowFullFile((s) => !s)}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            {showFullFile ? "Show Less" : "Show Full File"}
          </button>
        </div>
      )}

      <div className="pt-6 space-y-4">
        {request.completed_file && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Completed Project</h2>

            {parseFloat(request.paid_amount) >=
            parseFloat(request.total_price) ? (
              <>
                <a
                  href={request.completed_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  download
                >
                  ⬇️ Download Completed File
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  Click to download the freelancer’s final submission.
                </p>
              </>
            ) : (
              <>
                <p className="text-red-600 mb-2">
                  You must pay the remaining balance to download this file.
                </p>
                <button
                  onClick={() => setShowPayModal(true)}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Pay Remaining Balance
                </button>
              </>
            )}

            {showPayModal && (
              <CustomRequestPurchaseModal
                request={request}
                onClose={() => {
                  setShowPayModal(false);
                  getCustomRequest(id).then(setRequest);
                }}
              />
            )}
          </div>
        )}

        <Link
          to="/my-requests"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          ← Back to My Requests
        </Link>
      </div>

      <div className="mt-8">
        <ChatBox requestId={id} />
      </div>
    </div>
  );
}
