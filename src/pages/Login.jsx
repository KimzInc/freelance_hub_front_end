import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../components/services/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import AuthFormContainer from "../components/common/AuthFormContainer";
import FormField from "../components/common/FormField";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear any existing tokens when the login page loads
  useEffect(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }, []);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      const data = await loginUser({
        username: form.username.trim(),
        password: form.password,
      });

      // DEBUG: Check what we're receiving
      console.log("🔍 Login response data:", data);
      console.log("🔍 User is_active status:", data.user?.is_active);

      // Remove the is_active check - backend handles unverified/inactive users

      login(data);
      toast.success(`Welcome back, ${data.user.username}!`);

      // Use the user data from the login response directly
      // role-based redirect
      if (data.user.role === "CLIENT") {
        navigate("/my-requests");
      } else if (data.user.role === "FREELANCER") {
        if (data.user.is_approved) {
          navigate("/freelancer/dashboard");
        } else {
          navigate("/pending-approval");
        }
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);

      // The backend will return an error if the user is not active
      // Let the backend error message handle this
      const errorMessage =
        err.response?.data?.detail || // JWT error format
        err.response?.data?.error ||
        err.message ||
        "Invalid username or password";

      setErrors({ submit: errorMessage });

      // If it's an unverified email error, offer to resend verification
      if (
        errorMessage.includes("verify your email") ||
        errorMessage.includes("not active") ||
        errorMessage.includes("unverified")
      ) {
        navigate("/verify-email-pending", { state: { email: form.username } });
      }

      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthFormContainer title="Signing In...">
        <LoadingSpinner text="Authenticating..." />
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer title="Sign In to Your Account">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        <FormField label="Username" error={errors.username} required>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={onChange}
            className={`input-field ${errors.username ? "input-error" : ""}`}
            placeholder="Enter your username"
            disabled={loading}
            autoComplete="username"
          />
        </FormField>

        <FormField label="Password" error={errors.password} required>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              className={`input-field pr-10 ${
                errors.password ? "input-error" : ""
              }`}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </AuthFormContainer>
  );
}
