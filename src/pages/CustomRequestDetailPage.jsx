import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../components/services/api";
import { toast } from "react-toastify";
import {
  getCustomRequest,
  getDisciplines,
  getAssignmentTypes,
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
  const [disciplines, setDisciplines] = useState([]);
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [copied, setCopied] = useState(false);

  // Function to refresh request data
  const refreshRequestData = async () => {
    try {
      const requestData = await getCustomRequest(id);
      setRequest(requestData);
    } catch (err) {
      console.error("Failed to refresh request:", err);
    }
  };

  const handleDownloadCompleted = async () => {
    try {
      const res = await api.get(`/request/${id}/download-completed/`);
      const url = res.data?.url;

      if (!url) {
        toast.error("Failed to get download link");
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Download completed project failed", err);
      const msg =
        err.response?.data?.detail || err.message || "Download failed";
      toast.error(msg);
    }
  };

  // Fetch disciplines and assignment types
  const fetchOptions = async () => {
    try {
      const [disciplineResponse, assignmentTypeResponse] = await Promise.all([
        getDisciplines(),
        getAssignmentTypes(),
      ]);

      setDisciplines(disciplineResponse || []);
      setAssignmentTypes(assignmentTypeResponse || []);
    } catch (error) {
      console.error("Error fetching options:", error);
      setDisciplines([]);
      setAssignmentTypes([]);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Use getCustomRequest instead of getCustomRequestSummary to get full details
        const [requestData] = await Promise.all([
          getCustomRequest(id), // This is used here
          fetchOptions(),
        ]);
        setRequest(requestData);
      } catch (err) {
        console.error("Failed to fetch request details:", err);
        setError(
          err.response?.data?.detail || "Could not fetch request details."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Helper function to get name from ID
  const getNameFromId = (id, options) => {
    if (!id || !Array.isArray(options)) return "Not specified";
    const option = options.find((opt) => opt.id === id);
    return option ? option.name : "Unknown";
  };

  // Copy order ID to clipboard
  const copyOrderId = () => {
    if (request?.order_id) {
      navigator.clipboard.writeText(request.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  // Handle payment modal close
  const handlePaymentModalClose = () => {
    setShowPayModal(false);
    refreshRequestData(); // Refresh data after payment
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading request details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">{error}</p>
          <Link
            to="/my-requests"
            className="inline-block mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            ← Back to My Requests
          </Link>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-600">No request found.</p>
        <Link
          to="/my-requests"
          className="inline-block mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          ← Back to My Requests
        </Link>
      </div>
    );
  }

  const formatMoney = (val) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val || 0);

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {request.title}
          </h1>

          {/* Order ID Display */}
          {request.order_id && (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium text-gray-600">
                Order ID:
              </span>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg border">
                <code className="text-sm font-mono text-gray-800">
                  {request.order_id}
                </code>
                <button
                  onClick={copyOrderId}
                  className={`p-1 rounded transition-colors ${
                    copied
                      ? "text-green-600 bg-green-100"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Copy to clipboard"
                >
                  {copied ? "✓ Copied" : "📋"}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[request.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {request.status.replace("_", " ")}
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
      </div>

      {/* Rest of the component remains the same */}
      {/* Time Remaining Section */}
      {request.deadline && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">
            Time Remaining
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-mono font-bold text-blue-900">
              {timeRemaining.expired ? (
                <span className="text-red-600">⏰ DEADLINE PASSED</span>
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
            <div className="text-sm text-blue-700 font-medium">
              {formatTimeRemaining()}
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            Deadline: {new Date(request.deadline).toLocaleDateString()} at{" "}
            {new Date(request.deadline).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Project Details Grid - IMPROVED UX */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
          📋 Project Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1: Basic Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Deadline
              </span>
              <p className="text-lg font-bold text-gray-800">
                {request.deadline
                  ? new Date(request.deadline).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not specified"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Citation Style
              </span>
              <p className="text-lg font-semibold text-purple-600">
                {request.style || "Not specified"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Number of Pages
              </span>
              <p className="text-xl font-bold text-blue-600">
                {request.number_of_pages || "Not specified"}
              </p>
            </div>
          </div>

          {/* Column 2: Project Specifications */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Number of Sources
              </span>
              <p className="text-xl font-bold text-indigo-600">
                {request.sources || "Not specified"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Discipline
              </span>
              <p
                className={`text-lg font-semibold ${
                  getNameFromId(request.discipline, disciplines) ===
                  "Not specified"
                    ? "text-gray-400"
                    : "text-green-600"
                }`}
              >
                {getNameFromId(request.discipline, disciplines)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Assignment Type
              </span>
              <p
                className={`text-lg font-semibold ${
                  getNameFromId(request.assignment_type, assignmentTypes) ===
                  "Not specified"
                    ? "text-gray-400"
                    : "text-green-600"
                }`}
              >
                {getNameFromId(request.assignment_type, assignmentTypes)}
              </p>
            </div>
          </div>

          {/* Column 3: Financial Information */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm border border-green-200">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Total Price
              </span>
              <p className="text-2xl font-bold text-green-600">
                {formatMoney(request.total_price)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 shadow-sm border border-blue-200">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Amount Paid
              </span>
              <p className="text-xl font-bold text-blue-600">
                {formatMoney(request.paid_amount)}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((request.paid_amount || 0) /
                        (request.total_price || 1)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(
                  ((request.paid_amount || 0) / (request.total_price || 1)) *
                    100
                )}
                % paid
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 shadow-sm border border-orange-200">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Remaining Balance
              </span>
              <p className="text-xl font-bold text-orange-600">
                {formatMoney(
                  (request.total_price || 0) - (request.paid_amount || 0)
                )}
              </p>
              {(request.total_price || 0) - (request.paid_amount || 0) <= 0 && (
                <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  ✅ Fully Paid
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Description - Always visible to client */}
      {request.description && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Project Description
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {request.description}
            </p>
          </div>
        </div>
      )}

      {/* Attached File Content */}
      {request.attached_file_content && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Attached File Content
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-gray-700 whitespace-pre-wrap overflow-y-auto max-h-96 text-sm leading-relaxed font-sans">
              {showFullFile
                ? request.attached_file_content
                : request.attached_file_content.slice(0, 1500) +
                  (request.attached_file_content.length > 1500 ? "…" : "")}
            </pre>
            {request.attached_file_content.length > 1500 && (
              <button
                onClick={() => setShowFullFile((s) => !s)}
                className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                {showFullFile ? "▲ Show Less" : "▼ Show Full Content"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed Project Section */}
      {request.completed_file && (
        <div className="bg-white border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Completed Project
          </h2>

          {parseFloat(request.paid_amount || 0) >=
          parseFloat(request.total_price || 0) ? (
            <div className="text-center">
              <button
                onClick={handleDownloadCompleted}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <span className="text-xl">⬇️</span>
                Download Completed Project
              </button>

              <p className="text-sm text-gray-600 mt-2">
                Your project has been completed by the freelancer. Click to
                download the final submission.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-medium mb-2">
                  Complete payment to download the completed file
                </p>
                <p className="text-sm text-yellow-700">
                  Remaining balance:{" "}
                  {formatMoney(
                    (request.total_price || 0) - (request.paid_amount || 0)
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowPayModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                💳 Pay Remaining Balance
              </button>
            </div>
          )}

          {showPayModal && (
            <CustomRequestPurchaseModal
              request={request}
              onClose={handlePaymentModalClose}
            />
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
        <Link
          to="/my-requests"
          className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          ← Back to My Requests
        </Link>

        {request.completed_file &&
          parseFloat(request.paid_amount || 0) <
            parseFloat(request.total_price || 0) && (
            <button
              onClick={() => setShowPayModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              💳 Pay Now to Download
            </button>
          )}
      </div>

      {/* Chat Section */}
      <div className="mt-8">
        <ChatBox requestId={id} />
      </div>
    </div>
  );
}
