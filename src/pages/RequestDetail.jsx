import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getRequestById,
  clientEditRequest,
} from "../components/services/requests";
import ClientRequestEditForm from "../components/ClientRequestEditForm";

export default function RequestDetailPage() {
  const { id } = useParams();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getRequestById(id);
      setReq(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const submitEdit = async (payload) => {
    setSaving(true);
    try {
      await clientEditRequest(id, payload);
      await load();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (!req) return <p className="p-6">Not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{req.title}</h1>
        <button
          className="px-3 py-2 rounded bg-gray-900 text-white"
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
      </div>

      <p>Status: {req.status}</p>
      <p>Deadline: {req.deadline}</p>
      <p>Pages: {req.number_of_pages}</p>
      <p>Total: {req.total_price}</p>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Request</h2>
              <button onClick={() => setEditing(false)}>✕</button>
            </div>
            <ClientRequestEditForm
              initial={req}
              onSubmit={submitEdit}
              onCancel={() => setEditing(false)}
              submitting={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}
