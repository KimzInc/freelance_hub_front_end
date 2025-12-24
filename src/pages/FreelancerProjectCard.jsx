import { useState, useEffect, useCallback } from "react";
import ChatBox from "../components/chat/ChatBox";
import { toast } from "react-toastify";
import api from "../components/services/api";

export default function FreelancerProjectCard({
  project,
  onProjectUpdate,
  disciplines = [],
  assignmentTypes = [],
}) {
  const [expanded, setExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Helper function to get name from ID
  const getNameFromId = (id, options) => {
    if (!id || !Array.isArray(options)) return "Not specified";
    const option = options.find((opt) => opt.id === id);
    return option ? option.name : "Unknown";
  };

  // Payment status helper functions
  const getPaymentStatus = (project) => {
    if (!project.paid_amount || project.paid_amount === 0)
      return "Awaiting client payment";
    if (project.paid_amount < project.total_price)
      return "Partial payment received";
    return "Fully paid by client";
  };

  const getPaymentStatusColor = (project) => {
    if (!project.paid_amount || project.paid_amount === 0)
      return "bg-yellow-500";
    if (project.paid_amount < project.total_price) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPaymentStatusText = (project) => {
    if (!project.paid_amount || project.paid_amount === 0) return "Pending";
    if (project.paid_amount < project.total_price) return "In Progress";
    return "Completed";
  };

  const getPaymentStatusDescription = (project) => {
    if (!project.paid_amount || project.paid_amount === 0)
      return "Client will pay deposit soon";
    if (project.paid_amount < project.total_price)
      return "Client has made initial payment";
    return "All client payments received";
  };

  // FIXED: Better time calculation with useCallback
  const calculateTimeRemaining = useCallback(() => {
    if (!project || !project.deadline) {
      setTimeRemaining({ expired: false });
      setIsUrgent(false);
      return;
    }

    const deadline = new Date(project.deadline);
    const now = new Date();
    const difference = deadline - now;

    if (difference <= 0) {
      setTimeRemaining({ expired: true });
      setIsUrgent(false);
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Check if urgent (less than 24 hours)
    const totalHours = days * 24 + hours;
    setIsUrgent(totalHours < 24 && totalHours >= 0);
    setTimeRemaining({ days, hours, minutes, seconds, expired: false });
  }, [project]);

  // FIXED: Better useEffect for timer
  useEffect(() => {
    calculateTimeRemaining();

    if (!timeRemaining.expired && project?.deadline) {
      const timer = setInterval(calculateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [calculateTimeRemaining, timeRemaining.expired, project]);

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

  const statusColors = {
    REQUESTED: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border border-blue-300",
    COMPLETED: "bg-green-100 text-green-800 border border-green-300",
    CANCELLED: "bg-red-100 text-red-800 border border-red-300",
  };

  const handleCompletedUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      toast.error("File too large. Maximum 10MB allowed.");
      return;
    }

    try {
      setUploading(true);

      // 1️⃣ Ask backend for presigned upload URL
      const presignRes = await api.post(
        `/custom-requests/${project.id}/upload-completed/`,
        { filename: file.name }
      );

      const { upload_url, s3_key } = presignRes.data;

      // 2️⃣ Upload directly to S3 (IMPORTANT: no auth header here)
      await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      // 3️⃣ Confirm upload with backend (save s3_key)
      await api.post(
        `/custom-requests/${project.id}/confirm-completed-upload/`,
        { s3_key }
      );

      toast.success("Completed project uploaded successfully!");

      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to upload completed project"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!project) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
        <p className="text-gray-500 text-center">Project data not available</p>
      </div>
    );
  }

  const displayDescription = showFullDescription
    ? project.description
    : project.description?.slice(0, 150) || "No description available";

  const shouldShowReadMore =
    project.description && project.description.length > 150;

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition-all duration-300">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {/* Order ID - Moved to header */}
          <div className="mb-2">
            <span className="text-sm font-mono font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              Order ID: {project.order_id || project.id}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {project.title || "Untitled Project"}
          </h3>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[project.status] ||
                "bg-gray-100 text-gray-800 border border-gray-300"
              }`}
            >
              {project.status?.replace("_", " ") || "UNKNOWN"}
            </span>
            {isUrgent && !timeRemaining.expired && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-300">
                ⚡ URGENT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Time Remaining Section - Prominent Display */}
      {project.deadline && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 text-sm mb-2">
            ⏰ Time Remaining
          </h4>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-mono font-bold text-blue-900">
              {timeRemaining.expired ? (
                <span className="text-red-600 text-lg">DEADLINE PASSED</span>
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
          <p className="text-xs text-blue-600 mt-2">
            Deadline: {new Date(project.deadline).toLocaleDateString()} at{" "}
            {new Date(project.deadline).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Project Description - Single Version */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">
          📋 Project Description
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {displayDescription}
            {!showFullDescription && shouldShowReadMore && "..."}
          </p>
          {shouldShowReadMore && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2"
            >
              {showFullDescription ? "▲ Show Less" : "▼ Read More"}
            </button>
          )}
        </div>
      </div>

      {/* Project Details Grid - Improved Layout */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">📊 Project Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
              Pages
            </span>
            <p className="text-lg font-bold text-blue-600">
              {project.number_of_pages || "N/A"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
              Style
            </span>
            <p className="text-md font-semibold text-purple-600">
              {project.style || "Not specified"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
              Sources
            </span>
            <p className="text-lg font-bold text-indigo-600">
              {project.sources || "N/A"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
              Discipline
            </span>
            <p className="text-md font-semibold text-green-600">
              {getNameFromId(project.discipline, disciplines)}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
              Assignment Type
            </span>
            <p className="text-md font-semibold text-green-600">
              {getNameFromId(project.assignment_type, assignmentTypes)}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
              Client
            </span>
            <p className="text-md font-semibold text-gray-700">
              {project.client_display_name || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Information - Freelancer View Only */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
            Your Earnings
          </span>
          <p className="text-2xl font-bold text-green-600">
            $
            {project.display_price !== undefined
              ? parseFloat(project.display_price).toFixed(0)
              : project.total_price
              ? parseFloat(project.total_price * 0.6).toFixed(0)
              : "0"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getPaymentStatus(project)}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
            Payment Status
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div
              className={`w-3 h-3 rounded-full ${getPaymentStatusColor(
                project
              )}`}
            ></div>
            <p className="text-sm font-medium text-gray-700">
              {getPaymentStatusText(project)}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {getPaymentStatusDescription(project)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <>
              <span>👆</span>
              Hide Chat
            </>
          ) : (
            <>
              <span>👇</span>
              View Chat
            </>
          )}
        </button>

        {/* Upload Button - Only show for IN_PROGRESS projects */}
        {project.status === "IN_PROGRESS" && (
          <label className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <span>📤</span>
            Upload Work
            <input
              type="file"
              accept=".pdf,.doc,.docx,.zip"
              onChange={handleCompletedUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 font-medium">Uploading your file...</p>
          </div>
        </div>
      )}

      {/* Expanded Chat Section */}
      {expanded && (
        <div className="mt-6 border-t pt-6">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>💬</span>
            Project Chat
          </h4>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-1">
            <ChatBox requestId={project.id} />
          </div>
        </div>
      )}

      {/* Project Metadata Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <span>
          Created: {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
