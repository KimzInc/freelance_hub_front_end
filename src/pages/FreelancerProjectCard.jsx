import { useState, useEffect } from "react";
import ChatBox from "../components/chat/ChatBox";
import { toast } from "react-toastify";
import api from "../components/services/api";

export default function FreelancerProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Calculate time remaining until deadline
  useEffect(() => {
    if (!project || !project.deadline) return;

    const calculateTimeRemaining = () => {
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
      setIsUrgent(days === 0 && hours < 24 && hours >= 0);
      setTimeRemaining({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeRemaining();

    if (!timeRemaining.expired) {
      const timer = setInterval(calculateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [project, timeRemaining.expired]);

  const formatTimeRemaining = () => {
    if (timeRemaining.expired) return "Deadline passed";
    if (!timeRemaining.days && !timeRemaining.hours && !timeRemaining.minutes)
      return "Less than a minute remaining";

    let parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`);
    return parts.join(" ") + " remaining";
  };

  const statusColors = {
    REQUESTED: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  // Upload handler with better error handling
  const handleCompletedUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: size check (10MB example)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum 10MB allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("completed_file", file);

    try {
      setUploading(true);
      await api.patch(`/request/${project.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Completed file uploaded!");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || "Failed to upload file";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-lg">{project.title}</h4>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[project.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {project.status}
          </span>
          {isUrgent && !timeRemaining.expired && (
            <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
              ⚡ URGENT
            </span>
          )}
        </div>
      </div>

      {project.deadline && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <h3 className="font-medium text-blue-800 text-sm mb-1">
            Time Remaining
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-lg font-mono font-bold text-blue-900">
              {timeRemaining.expired ? (
                <span className="text-red-600 text-sm">⏰ EXPIRED</span>
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
            <div className="text-xs text-blue-700">{formatTimeRemaining()}</div>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Deadline: {new Date(project.deadline).toLocaleString()}
          </p>
        </div>
      )}

      <p className="text-gray-600 mb-3">
        {project.description?.slice(0, 120)}...
      </p>

      <div className="text-sm text-gray-500 mb-3">
        <p>Pages: {project.number_of_pages}</p>
        <p>Style: {project.style}</p>
        <p>Sources: {project.sources}</p>
      </div>

      <p className="font-semibold mb-2">
        Price: $
        {project.display_price !== undefined
          ? parseFloat(project.display_price).toFixed(0)
          : parseFloat(project.total_price).toFixed(0)}
      </p>
      <p className="font-semibold mb-3">
        Client: {project.client_display_name}
      </p>

      <button
        className="text-blue-600 hover:underline text-sm"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? "Hide Details & Chat" : "View Details & Chat"}
      </button>

      {expanded && (
        <div className="mt-4 border-t pt-4">
          <h5 className="font-semibold mb-2">Full Description</h5>
          <p className="text-gray-700 mb-4 whitespace-pre-line">
            {project.description}
          </p>

          {/* Completed File Upload (freelancer only) */}
          {project.status === "IN_PROGRESS" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Upload Completed Project
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip"
                onChange={handleCompletedUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4 file:rounded-full
                  file:border-0 file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && (
                <p className="text-xs text-gray-500 mt-1">Uploading…</p>
              )}
            </div>
          )}

          {/* Chat */}
          <ChatBox requestId={project.id} />
        </div>
      )}
    </div>
  );
}
