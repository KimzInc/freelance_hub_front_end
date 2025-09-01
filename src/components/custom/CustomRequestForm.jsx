import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { submitCustomRequest } from "../services/requests";
import FormField from "../common/FormField";
import LoadingSpinner from "../common/LoadingSpinner";

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
  const [filePreview, setFilePreview] = useState(null);
  const navigate = useNavigate();

  // Calculate suggested price with useCallback
  const calculateSuggestedPrice = useCallback(() => {
    const basePrice = 50;
    const pagePrice = (form.number_of_pages || 0) * 20;
    const sourcePrice = (form.sources || 0) * 5;
    const stylePremium =
      form.style === "Harvard" || form.style === "Chicago" ? 15 : 0;
    return basePrice + pagePrice + sourcePrice + stylePremium;
  }, [form.number_of_pages, form.sources, form.style]);

  // Auto-suggest price when pages/sources change
  useEffect(() => {
    if (form.number_of_pages > 0 && !form.total_price) {
      const suggestedPrice = calculateSuggestedPrice();
      setForm((f) => ({ ...f, total_price: suggestedPrice.toFixed(2) }));
    }
  }, [
    form.number_of_pages,
    form.sources,
    form.style,
    form.total_price,
    calculateSuggestedPrice,
  ]);

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      const file = files?.[0];
      setForm((f) => ({ ...f, [name]: file }));

      // Create preview for image files
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.deadline) errs.deadline = "Deadline is required";

    // Validate deadline is not in the past
    if (form.deadline) {
      const selectedDate = new Date(form.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errs.deadline = "Deadline cannot be in the past";
      }
    }

    if (!form.description.trim()) errs.description = "Description is required";
    if (form.description.trim().length < 50)
      errs.description = "Description should be at least 50 characters";
    if (!form.total_price || Number(form.total_price) <= 0) {
      errs.total_price = "Enter a valid total price";
    }
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
      }, 1500);
    } catch (err) {
      console.error("Error submitting request:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Submission failed. Please try again.";
      setApiError(errorMessage);
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setForm(initial);
    setErrors({});
    setApiError("");
    setFilePreview(null);
  };

  if (loading) {
    return <LoadingSpinner text="Submitting your request..." />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormField label="Title" error={errors.title} required>
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          className={`input-field ${errors.title ? "input-error" : ""}`}
          placeholder="e.g., Literature Review on AI Ethics"
          disabled={loading}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Deadline" error={errors.deadline} required>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={onChange}
            className={`input-field ${errors.deadline ? "input-error" : ""}`}
            min={new Date().toISOString().split("T")[0]}
            disabled={loading}
          />
        </FormField>

        <FormField label="Citation Style">
          <select
            name="style"
            value={form.style}
            onChange={onChange}
            className="input-field"
            disabled={loading}
          >
            <option value="APA">APA</option>
            <option value="MLA">MLA</option>
            <option value="Chicago">Chicago</option>
            <option value="Harvard">Harvard</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Number of Pages">
          <input
            type="number"
            min="1"
            max="50"
            name="number_of_pages"
            value={form.number_of_pages}
            onChange={onChange}
            className="input-field"
            disabled={loading}
          />
        </FormField>

        <FormField label="Number of Sources">
          <input
            type="number"
            min="0"
            max="100"
            name="sources"
            value={form.sources}
            onChange={onChange}
            className="input-field"
            disabled={loading}
          />
        </FormField>

        <FormField label="Total Price" error={errors.total_price} required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="total_price"
              value={form.total_price}
              onChange={onChange}
              className={`input-field pl-8 ${
                errors.total_price ? "input-error" : ""
              }`}
              placeholder="0.00"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Suggested: ${calculateSuggestedPrice().toFixed(2)}
          </p>
        </FormField>
      </div>

      <FormField
        label="Project Description"
        error={errors.description}
        required
      >
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          className={`input-field ${errors.description ? "input-error" : ""}`}
          rows="6"
          placeholder="Please provide detailed instructions about your project. Include specific requirements, formatting preferences, and any other relevant information..."
          disabled={loading}
        />
        <div className="text-xs text-gray-500 mt-1">
          {form.description.length}/1000 characters • Minimum 50 characters
          required
        </div>
      </FormField>

      <FormField label="Attach File (optional)">
        <div className="space-y-3">
          <input
            type="file"
            name="attached_file_path"
            onChange={onChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
          </p>

          {filePreview && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">Image Preview:</p>
              <img
                src={filePreview}
                alt="File preview"
                className="max-w-xs rounded-lg border"
              />
            </div>
          )}
        </div>
      </FormField>

      <FormField error={errors.terms_accepted}>
        <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            name="terms_accepted"
            checked={form.terms_accepted}
            onChange={onChange}
            className="mt-1"
            disabled={loading}
          />
          <div>
            <span className="font-medium">
              I accept the terms and conditions
            </span>
            <p className="text-sm text-gray-600 mt-1">
              By checking this box, I agree to the project terms, confirm that
              the provided information is accurate, and understand that this
              request will be processed by our team of experts.
            </p>
          </div>
        </label>
      </FormField>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">{apiError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
        <div className="text-sm text-gray-600">
          <p>All fields marked with * are required</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            className="btn-secondary"
            disabled={loading}
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary min-w-[120px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
