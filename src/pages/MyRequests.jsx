import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyRequests } from "../components/services/requests";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMyRequests();

        setRequests(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Failed to load requests:", err);
        setError("Could not load your requests.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Loading your requests…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">My Requests</h1>
      {requests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">
            You haven’t submitted any requests yet.
          </p>
          <Link
            to="/custom-request"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Your First Request
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 border rounded shadow-sm bg-white flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{req.title}</h2>
                <p className="text-sm text-gray-600">
                  Status: {req.status} — Deadline: {req.deadline}
                </p>
              </div>
              <Link
                to={`/request/${req.id}`}
                className="text-blue-600 font-medium hover:underline"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
