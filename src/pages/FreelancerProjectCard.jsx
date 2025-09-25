import { useState, useEffect } from "react";
import ChatBox from "../components/chat/ChatBox";

export default function FreelancerProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [isUrgent, setIsUrgent] = useState(false);

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

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second if not expired
    if (!timeRemaining.expired) {
      const timer = setInterval(calculateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [project, timeRemaining.expired]);

  // Format the timer display
  const formatTimeRemaining = () => {
    if (timeRemaining.expired) {
      return "Deadline passed";
    }

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
    REQUESTED: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-lg">{project.title}</h4>
        <div className="flex flex-col items-end gap-1">
          {/* Status badge */}
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[project.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {project.status}
          </span>

          {/* URGENT badge */}
          {isUrgent && !timeRemaining.expired && (
            <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
              ⚡ URGENT
            </span>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
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

      {/* FIX: Use display_price directly */}
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

          {/* Chat */}
          <ChatBox requestId={project.id} />
        </div>
      )}
    </div>
  );
}
