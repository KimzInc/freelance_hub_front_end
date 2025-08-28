import { useState } from "react";
import PurchaseModal from "./PurchaseModal";

export default function ProjectCard({ project }) {
  const [showModal, setShowModal] = useState(false);
  const isPurchased = !!project.full_content;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="border p-4 rounded shodow hover:shadow-lg cursor-pointer relative"
      >
        {isPurchased && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            ✅ Purchased
          </span>
        )}
        <h2 className="text-xl font-bold">{project.title}</h2>
        <p className="text-gray-600">
          {isPurchased ? project.full_content : project.partial_content}
        </p>
        <p className="font-semibold mt-2">${project.price}</p>
      </div>

      {showModal && (
        <PurchaseModal project={project} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
