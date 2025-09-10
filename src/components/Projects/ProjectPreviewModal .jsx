import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Portal from "../common/Portal";

export default function ProjectPreviewModal({ project, onClose }) {
  const { user } = useContext(AuthContext);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Calculate 20% of the content for preview
  const previewContent = project.partial_content
    ? project.partial_content.substring(
        0,
        Math.floor(project.partial_content.length * 0.2)
      ) + "..."
    : "Preview content not available";

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal className="modal-container">
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content max-w-4xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            &times;
          </button>

          <h2 className="text-2xl font-bold mb-4">{project.title}</h2>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">
              ⚡ This is a preview (20% of content).{" "}
              {user
                ? "Purchase to access the full project."
                : "Sign up or login to purchase and access the full project."}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Project Details:</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-gray-600">Price: </span>
                <span className="font-semibold">${project.price}</span>
              </div>
              {project.number_of_pages && (
                <div>
                  <span className="text-gray-600">Pages: </span>
                  <span className="font-semibold">
                    {project.number_of_pages}
                  </span>
                </div>
              )}
              {project.level && (
                <div>
                  <span className="text-gray-600">Level: </span>
                  <span className="font-semibold">{project.level}</span>
                </div>
              )}
              {project.format && (
                <div>
                  <span className="text-gray-600">Format: </span>
                  <span className="font-semibold">{project.format}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Preview Content:</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-line">
                {previewContent}
              </p>
            </div>
          </div>

          {user ? (
            <div className="flex gap-4">
              <Link
                to={`/project/${project.id}`}
                className="flex-1 btn-primary text-center py-3"
                onClick={onClose}
              >
                Purchase Full Project
              </Link>
              <button onClick={onClose} className="flex-1 btn-secondary py-3">
                Close Preview
              </button>
            </div>
          ) : (
            <div>
              {showSignupPrompt ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-blue-800 mb-3">
                    Create an account or login to purchase this project
                  </p>
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      className="flex-1 btn-primary text-center py-2"
                      onClick={onClose}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 btn-secondary text-center py-2"
                      onClick={onClose}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSignupPrompt(true)}
                  className="w-full btn-primary py-3"
                >
                  Unlock Full Project
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full btn-secondary mt-3 py-2"
              >
                Close Preview
              </button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
