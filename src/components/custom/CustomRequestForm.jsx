import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { submitCustomRequest } from "../services/requests";

const initial = {
  title: "",
  deadline: "",
  number_of_pages: 1,
  sources: 0,
  style: "APA",
  description: "",
  total_price: "",
  attached_file_path: null,
  terms_accepted: false,
};

export default function CustomRequestForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      setForm((f) => ({ ...f, [name]: files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.deadline) errs.deadline = "Deadline is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.total_price || Number(form.total_price) <= 0)
      errs.total_price = "Enter a valid total price";
    if (!form.terms_accepted) errs.terms_accepted = "You must accept the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setApiError("");

      const data = await submitCustomRequest(form);

      toast.success("Request submitted successfully!");

      setTimeout(() => {
        navigate(`/request/${data.id}`);
      }, 800);
    } catch (err) {
      console.error("Error submitting request:", err);
      setApiError(err.response?.data?.error || "Submission failed.");

      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g., Literature Review on AI Ethics"
        />
        {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.deadline && (
            <p className="text-red-600 text-sm">{errors.deadline}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Style</label>
          <select
            name="style"
            value={form.style}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          >
            <option>APA</option>
            <option>MLA</option>
            <option>Chicago</option>
            <option>Harvard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pages</label>
          <input
            type="number"
            min="1"
            name="number_of_pages"
            value={form.number_of_pages}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sources</label>
          <input
            type="number"
            min="0"
            name="sources"
            value={form.sources}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="total_price"
            value={form.total_price}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., 120.00"
          />
          {errors.total_price && (
            <p className="text-red-600 text-sm">{errors.total_price}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          className="w-full border rounded px-3 py-2"
          rows="5"
          placeholder="Tell us exactly what you need…"
        />
        {errors.description && (
          <p className="text-red-600 text-sm">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Attach File (optional)
        </label>
        <input
          type="file"
          name="attached_file_path"
          onChange={onChange}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT…</p>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="terms_accepted"
          checked={form.terms_accepted}
          onChange={onChange}
        />
        <span>I accept the terms and conditions.</span>
      </label>
      {errors.terms_accepted && (
        <p className="text-red-600 text-sm">{errors.terms_accepted}</p>
      )}

      <div className="flex justify-between items-center pt-2">
        {apiError && <p className="text-red-600 text-sm">{apiError}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForm(initial)}
            className="border rounded px-4 py-2"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </form>
  );
}
