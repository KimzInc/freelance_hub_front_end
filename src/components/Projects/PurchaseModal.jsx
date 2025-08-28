import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { purchaseProject } from "../services/projects";
import { Link, useNavigate } from "react-router-dom";

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{project.title}</h2>

        {!user ? (
          <div>
            <p className="mb-4">
              Please login or register to purchase this project.
            </p>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Register
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mr-2"
              />
              I accept the terms and conditions.
            </label>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Processing..." : "Purchase"}
            </button>
            {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
          </div>
        )}

        <button onClick={onClose} className="mt-4 w-full border py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
}
