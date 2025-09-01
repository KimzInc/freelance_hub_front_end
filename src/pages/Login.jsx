import { useState, useContext } from "react";
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

      login(data.user, data.access);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid username or password";

      setErrors({ submit: errorMessage });
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoType) => {
    const demoAccounts = {
      client: { username: "demo_client", password: "demopassword123" },
      freelancer: { username: "demo_freelancer", password: "demopassword123" },
    };

    try {
      setLoading(true);
      setErrors({});

      const credentials = demoAccounts[demoType];
      const data = await loginUser(credentials);

      login(data.user, data.access);
      toast.success(`Welcome to demo mode, ${data.user.username}!`);
      navigate("/");
    } catch (err) {
      console.error("Demo login error:", err);
      setErrors({ submit: "Demo login failed. Please try again." });
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
            to="/forgot-password" // You might want to add this route later
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

        {/* // Demo Login Buttons */}
        {/* <div className="border-t pt-6">
          <p className="text-center text-sm text-gray-600 mb-4">
            Want to try out the platform?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("client")}
              disabled={loading}
              className="btn-secondary text-sm py-2"
            >
              Demo as Client
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("freelancer")}
              disabled={loading}
              className="btn-secondary text-sm py-2"
            >
              Demo as Freelancer
            </button>
          </div>
        </div> */}
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
