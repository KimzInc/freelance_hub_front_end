import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../components/services/requests";
import { toast } from "react-toastify";

export default function ChangePasswordForm() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: "" }));
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setFieldErrors({ confirm_password: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});
      await changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
      });

      toast.success("Password updated successfully. Please log in again.");
      logout();
      navigate("/login");
    } catch (err) {
      // Handle serializer-style errors: { old_password: [...], new_password: [...] } or { error: "..."}
      const data = err?.response?.data || {};
      if (typeof data === "object") {
        const fe = {};
        if (data.old_password) fe.old_password = String(data.old_password);
        if (data.new_password) fe.new_password = String(data.new_password);
        if (Object.keys(fe).length) setFieldErrors(fe);
      }
      setError(data.error || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-xl font-bold mb-4">Change Password</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Old Password</label>
          <input
            type="password"
            name="old_password"
            value={form.old_password}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          {fieldErrors.old_password && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.old_password}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="new_password"
            value={form.new_password}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            required
            minLength={8}
          />
          {fieldErrors.new_password && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.new_password}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          {fieldErrors.confirm_password && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.confirm_password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
