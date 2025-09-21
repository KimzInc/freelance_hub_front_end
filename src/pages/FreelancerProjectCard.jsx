import { useState } from "react";
import ChatBox from "../components/chat/ChatBox";

export default function FreelancerProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <h4 className="font-bold text-lg mb-2">{project.title}</h4>
      <p className="text-gray-600 mb-3">
        {project.description?.slice(0, 120)}...
      </p>

      <div className="text-sm text-gray-500 mb-3">
        <p>Status: {project.status}</p>
        <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
        <p>Pages: {project.number_of_pages}</p>
        <p>Style: {project.style}</p>
      </div>

      <p className="font-semibold mb-2">
        Price: ${project.display_price || project.total_price}
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
