import { useState } from "react";
import PurchaseModal from "./PurchaseModal";

export default function ProjectCard({ project }) {
  const [showModal, setShowModal] = useState(false);
  const isPurchased = !!project.full_content;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="card hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] relative group"
      >
        {isPurchased && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 z-10">
            <span>✅</span> Purchased
          </span>
        )}

        <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 overflow-hidden relative">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
            <span className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              View Details
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {project.title}
        </h2>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {isPurchased ? project.full_content : project.partial_content}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${project.price}
          </span>
          <button
            className="btn-primary text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            View Details
          </button>
        </div>
      </div>

      {showModal && (
        <PurchaseModal project={project} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
