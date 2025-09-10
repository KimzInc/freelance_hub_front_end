import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { submitCustomRequest } from "../services/requests";
import FormField from "../common/FormField";
import LoadingSpinner from "../common/LoadingSpinner";
import CustomRequestPurchaseModal from "../Projects/CustomRequestPurchaseModal";

const initial = {
  title: "",
  deadline: "",
  project_type: "non-tech", // Added project type
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
  const [createdRequest, setCreatedRequest] = useState(null);

  // Calculate price based on project type, pages, timeframe, and style
  const calculatePrice = useCallback(() => {
    // Base price per page based on timeframe
    let basePricePerPage;
    const hoursUntilDeadline = calculateHoursUntilDeadline(form.deadline);

    if (hoursUntilDeadline <= 24) {
      basePricePerPage = 17;
    } else if (hoursUntilDeadline <= 48) {
      basePricePerPage = 14;
    } else if (hoursUntilDeadline <= 72) {
      basePricePerPage = 11;
    } else {
      basePricePerPage = 9;
    }

    // Add $6 for technical projects
    if (form.project_type === "tech") {
      basePricePerPage += 5;
    }

    // Style premium
    const stylePremium =
      form.style === "Harvard" || form.style === "Chicago" ? 1 : 0;

    // Calculate total price
    const pages = form.number_of_pages || 1;
    const sources = form.sources || 0;

    return pages * basePricePerPage + sources * 0 + stylePremium;
  }, [
    form.project_type,
    form.number_of_pages,
    form.deadline,
    form.style,
    form.sources,
  ]);

  // Calculate hours until deadline
  const calculateHoursUntilDeadline = (deadline) => {
    if (!deadline) return 96; // Default to longest timeframe

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate - now;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  };

  // Update price whenever relevant fields change
  useEffect(() => {
    if (form.deadline && form.number_of_pages > 0) {
      const calculatedPrice = calculatePrice();
      setForm((f) => ({ ...f, total_price: calculatedPrice.toFixed(2) }));
    }
  }, [
    form.project_type,
    form.number_of_pages,
    form.deadline,
    form.style,
    form.sources,
    calculatePrice,
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
      setCreatedRequest(data);
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

  // Get timeframe description for display
  const getTimeframeDescription = () => {
    const hours = calculateHoursUntilDeadline(form.deadline);

    if (hours <= 24) return "24 hours (Urgent) - $17/page";
    if (hours <= 48) return "48 hours - $14/page";
    if (hours <= 72) return "72 hours - $11/page";
    return "96+ hours - $9/page";
  };

  if (loading) {
    return <LoadingSpinner text="Submitting your request..." />;
  }

  return (
    <>
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

        {/* Project Type Selection */}
        <FormField label="Project Type" required>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${
                form.project_type === "non-tech"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setForm({ ...form, project_type: "non-tech" })}
            >
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-medium">Non-Technical</h4>
              <p className="text-sm text-gray-600 mt-1">
                Essays, Research, Writing
              </p>
            </div>
            <div
              className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${
                form.project_type === "tech"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setForm({ ...form, project_type: "tech" })}
            >
              <div className="text-2xl mb-2">💻</div>
              <h4 className="font-medium">Technical</h4>
              <p className="text-sm text-gray-600 mt-1">
                Coding, Excel, Data Analysis
              </p>
              {/* <p className="text-xs text-blue-600 mt-1">+$6 per page</p> */}
            </div>
          </div>
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
            {form.deadline && (
              <p className="text-xs text-gray-500 mt-1">
                Delivery timeframe: {getTimeframeDescription()}
              </p>
            )}
          </FormField>

          <FormField label="Citation Style">
            <select
              name="style"
              value={form.style}
              onChange={onChange}
              className="input-field"
              disabled={loading}
            >
              <option value="APA">APA (No additional charge)</option>
              <option value="MLA">MLA (No additional charge)</option>
              <option value="Chicago">Chicago (+$1 premium)</option>
              <option value="Harvard">Harvard (+$1 premium)</option>
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
            <p className="text-xs text-gray-500 mt-1">+$0 per source</p>
          </FormField>

          <FormField label="Total Price" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="text"
                name="total_price"
                value={form.total_price || "0.00"}
                className="input-field pl-8 bg-gray-100"
                readOnly
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Price is automatically calculated
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
          <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-100 transition-colors">
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
            <p className="text-xs mt-1">
              Price is automatically calculated based on your selections
            </p>
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
      {createdRequest && (
        <CustomRequestPurchaseModal
          request={createdRequest}
          onClose={() => {
            setCreatedRequest(null);
            navigate(`/request/${createdRequest.id}`);
          }}
        />
      )}
    </>
  );
}
