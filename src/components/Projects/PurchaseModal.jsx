import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { purchaseProject } from "../services/projects";
import { Link, useNavigate } from "react-router-dom";
import Portal from "../common/Portal";

export default function PurchaseModal({ project, onClose }) {
  const { user } = useContext(AuthContext);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!terms) {
      setMessage("You must accept the terms before purchasing.");
      return;
    }
    try {
      setLoading(true);
      await purchaseProject(project.id);
      navigate(`/project/${project.id}`);
    } catch (err) {
      setMessage(err.response?.data?.error || "Purchase failed.");
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <Portal className="modal-container">
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            &times;
          </button>

          <h2 className="text-xl font-bold mb-4">{project.title}</h2>

          {!user ? (
            <div>
              <p className="mb-4 text-gray-600">
                Please login or register to purchase this project.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="flex-1 btn-primary text-center"
                  onClick={onClose}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 btn-secondary text-center"
                  onClick={onClose}
                >
                  Register
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Price: ${project.price}</p>

              <label className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => {
                    setTerms(e.target.checked);
                    setMessage("");
                  }}
                  className="mr-3"
                />
                <span className="text-sm">
                  I accept the terms and conditions for purchasing this project.
                </span>
              </label>

              <button
                onClick={handlePurchase}
                disabled={loading || !terms}
                className="w-full btn-primary py-2"
              >
                {loading ? "Processing..." : "Purchase Now"}
              </button>

              {message && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {message}
                </p>
              )}
            </div>
          )}

          <button onClick={onClose} className="w-full btn-secondary mt-4">
            Close
          </button>
        </div>
      </div>
    </Portal>
  );
}
