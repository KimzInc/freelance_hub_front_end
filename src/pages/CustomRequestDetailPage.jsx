import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getCustomRequest } from "../components/services/requests";

export default function CustomRequestDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showFullFile, setShowFullFile] = useState(false);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const data = await getCustomRequest(id);
        setRequest(data);
      } catch (err) {
        console.error("Failed to fetch request:", err);
        setError(
          err.response?.data?.error || "Could not fetch request details."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading request details…</p>
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!request) {
    return <p className="p-6">No request found.</p>;
  }

  const formatMoney = (val) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);

  const statusColors = {
    REQUESTED: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8 space-y-4">
      <h1 className="text-2xl font-bold">{request.title}</h1>

      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          statusColors[request.status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {request.status}
      </span>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p>
          <span className="font-medium">Deadline:</span> {request.deadline}
        </p>
        <p>
          <span className="font-medium">Style:</span> {request.style}
        </p>
        <p>
          <span className="font-medium">Pages:</span> {request.number_of_pages}
        </p>
        <p>
          <span className="font-medium">Sources:</span> {request.sources}
        </p>
        <p>
          <span className="font-medium">Total Price:</span>{" "}
          {formatMoney(request.total_price)}
        </p>
        <p>
          <span className="font-medium">Paid:</span>{" "}
          {formatMoney(request.paid_amount)}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {request.description}
        </p>
      </div>

      {request.attached_file_content && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Attached File Content</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap overflow-y-auto max-h-60">
            {showFullFile
              ? request.attached_file_content
              : request.attached_file_content.slice(0, 1000) + "…"}
          </pre>
          <button
            onClick={() => setShowFullFile((s) => !s)}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            {showFullFile ? "Show Less" : "Show Full File"}
          </button>
        </div>
      )}

      <div className="pt-6">
        <Link
          to="/my-requests"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          ← Back to My Requests
        </Link>
      </div>
    </div>
  );
}
