import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getMyRequests,
  clientEditRequest,
} from "../components/services/requests";
import ClientRequestEditForm from "../components/common/ClientRequestEditForm";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // the request being edited
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await getMyRequests();
      setRequests(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setError("Could not load your requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onOpenEdit = (req) => setEditing(req);
  const onCloseEdit = () => setEditing(null);

  const onSubmitEdit = async (formValues) => {
    if (!editing) return;
    setSubmitting(true);

    try {
      // Send the multipart PATCH and receive the updated resource.
      // The backend response is expected to include total_price, paid_amount and amount_due.
      const updated = await clientEditRequest(editing.id, formValues);

      // If backend returned amount_due (string or number), prompt the user to pay remaining.
      const amountDueRaw =
        updated?.amount_due ?? updated?.amount_due_string ?? null;
      const amountDue = amountDueRaw != null ? Number(amountDueRaw) : 0;

      if (!Number.isNaN(amountDue) && amountDue > 0) {
        toast.info(
          `Remaining balance: $${amountDue.toFixed(
            2
          )}. Please pay to complete the order.`
        );

        // OPTIONAL: automatically open your existing payment modal / flow
        // If you have a payment modal opener, call it here. Example:
        // openPayModal({ requestId: updated.id || editing.id, amount: amountDue });

        // If you prefer to navigate to the request detail page where the user can pay:
        // navigate(`/request/${updated.id || editing.id}`);
      } else {
        toast.success("Request updated.");
      }

      // Refresh the list (or update local state with `updated`) to reflect new total_price / paid_amount
      // Using load() refetches everything; you could also merge `updated` into `requests` state for a local update
      await load();

      onCloseEdit();
    } catch (e) {
      console.error("Edit request failed:", e);

      // Try to read validation errors returned by DRF (common shape: { field: ["err1","err2"], non_field_errors: [...] })
      const resp = e?.response?.data;
      let userFriendly = "Update failed. Please try again.";

      if (resp) {
        if (typeof resp === "string") {
          userFriendly = resp;
        } else if (resp.detail && typeof resp.detail === "string") {
          userFriendly = resp.detail;
        } else if (typeof resp === "object") {
          // flatten field errors into a single string
          userFriendly = Object.entries(resp)
            .map(([k, v]) => {
              // v might be an array of messages or a single message
              const msg = Array.isArray(v) ? v.join(", ") : String(v);
              return `${k}: ${msg}`;
            })
            .join(" | ");
        }
      } else if (e?.message) {
        userFriendly = e.message;
      }

      // Show the error to the user (toast + alert fallback)
      try {
        toast.error(userFriendly);
      } catch {
        alert(userFriendly);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading your requests…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
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
              className="p-4 border rounded shadow-sm bg-white flex flex-col md:flex-row md:justify-between md:items-center gap-3"
            >
              <div>
                <h2 className="font-semibold">{req.title}</h2>
                <p className="text-sm text-gray-600">
                  Status: {req.status} — Deadline: {req.deadline}
                </p>
                <p className="text-sm text-gray-600">
                  Pages: {req.number_of_pages} • Total: {req.total_price}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/request/${req.id}`}
                  className="text-blue-600 font-medium hover:underline"
                >
                  View Details →
                </Link>
                <button
                  className="px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800"
                  onClick={() => onOpenEdit(req)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Edit Request — {editing.title}
              </h2>
              <button
                onClick={onCloseEdit}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <ClientRequestEditForm
              initial={editing}
              onCancel={onCloseEdit}
              onSubmit={onSubmitEdit}
              submitting={submitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
