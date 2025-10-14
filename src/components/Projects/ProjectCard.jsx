// import { useState, useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import PurchaseModal from "./PurchaseModal";
// import ProjectPreviewModal from "./ProjectPreviewModal ";
// import { getProjectPreview } from "../services/projects";

// export default function ProjectCard({ project }) {
//   const [showModal, setShowModal] = useState(false);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const [previewData, setPreviewData] = useState(null);
//   const [loadingPreview, setLoadingPreview] = useState(false);
//   const { user } = useContext(AuthContext);
//   const isPurchased = !!project.full_content;

//   const handleCardClick = async () => {
//     if (user) {
//       // For authenticated users, show purchase modal if not purchased
//       // or navigate to project detail if purchased
//       if (isPurchased) {
//         window.location.href = `/project/${project.id}`;
//       } else {
//         setShowModal(true);
//       }
//     } else {
//       // For unauthenticated users, load and show preview
//       setLoadingPreview(true);
//       try {
//         const preview = await getProjectPreview(project.id);
//         setPreviewData(preview);
//         setShowPreviewModal(true);
//       } catch (error) {
//         console.error("Failed to load preview:", error);
//         // Fallback to using available data
//         setPreviewData(project);
//         setShowPreviewModal(true);
//       } finally {
//         setLoadingPreview(false);
//       }
//     }
//   };

//   return (
//     <>
//       <div
//         onClick={handleCardClick}
//         className="card hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] relative group"
//       >
//         {isPurchased && (
//           <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 z-10">
//             <span>✅</span> Purchased
//           </span>
//         )}

//         <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 overflow-hidden relative">
//           <div className="w-full h-full flex items-center justify-center">
//             <span className="text-4xl">📝</span>
//           </div>
//           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
//             <span className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//               {user
//                 ? isPurchased
//                   ? "View Project"
//                   : "View Details"
//                 : "Preview Project"}
//             </span>
//           </div>
//           {loadingPreview && (
//             <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
//             </div>
//           )}
//         </div>

//         <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
//           {project.title}
//         </h2>

//         <p className="text-gray-600 text-sm mb-4 line-clamp-3">
//           {isPurchased ? project.full_content : project.partial_content}
//         </p>

//         <div className="flex justify-between items-center">
//           <span className="text-2xl font-bold text-blue-600">
//             ${project.price}
//           </span>
//           <button
//             className="btn-primary text-sm"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleCardClick();
//             }}
//           >
//             {user ? (isPurchased ? "View" : "Details") : "Preview"}
//           </button>
//         </div>
//       </div>

//       {showModal && (
//         <PurchaseModal project={project} onClose={() => setShowModal(false)} />
//       )}

//       {showPreviewModal && previewData && (
//         <ProjectPreviewModal
//           project={previewData}
//           onClose={() => {
//             setShowPreviewModal(false);
//             setPreviewData(null);
//           }}
//         />
//       )}
//     </>
//   );
// }

import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import PurchaseModal from "./PurchaseModal";
import ProjectPreviewModal from "./ProjectPreviewModal ";
import { getProjectPreview } from "../services/projects";

export default function ProjectCard({ project }) {
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { user } = useContext(AuthContext);

  // Check if project is purchased (has full_content)
  const isPurchased = !!project.full_content;

  const handleCardClick = async () => {
    if (user) {
      // For authenticated users, show purchase modal if not purchased
      // or navigate to project detail if purchased
      if (isPurchased) {
        window.location.href = `/project/${project.id}`;
      } else {
        setShowModal(true);
      }
    } else {
      // For unauthenticated users, load and show preview
      setLoadingPreview(true);
      try {
        const preview = await getProjectPreview(project.id);
        setPreviewData(preview);
        setShowPreviewModal(true);
      } catch (error) {
        console.error("Failed to load preview:", error);
        // Fallback to using available data
        setPreviewData(project);
        setShowPreviewModal(true);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
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
              {user
                ? isPurchased
                  ? "View Project"
                  : "View Details"
                : "Preview Project"}
            </span>
          </div>
          {loadingPreview && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {project.title}
        </h2>

        {/* Project metadata */}
        <div className="flex flex-wrap gap-2 mb-3">
          {project.discipline && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {project.discipline}
            </span>
          )}
          {project.assignment_type && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {project.assignment_type}
            </span>
          )}
          {project.level && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {project.level}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {isPurchased ? project.full_content : project.abstract}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${project.price}
          </span>
          <button
            className="btn-primary text-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            {user ? (isPurchased ? "View" : "Details") : "Preview"}
          </button>
        </div>
      </div>

      {showModal && (
        <PurchaseModal project={project} onClose={() => setShowModal(false)} />
      )}

      {showPreviewModal && previewData && (
        <ProjectPreviewModal
          project={previewData}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewData(null);
          }}
        />
      )}
    </>
  );
}
