// import { useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { registerUser } from "../components/services/auth";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//   const { login } = useContext(AuthContext);
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const data = await registerUser({ username, email, password });
//       login(data.user, data.access);
//       navigate("/");
//     } catch (err) {
//       if (err.response && err.response.data) {
//         const messages = Object.values(err.response.data).flat().join(" ");
//         setError(messages || "Registration failed");
//       } else {
//         setError("Something went wrong, please try again.");
//       }
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
//       <h1 className="text-xl font-bold mb-4">Register</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           className="w-full border px-3 py-2 rounded"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         <input
//           className="w-full border px-3 py-2 rounded"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           className="w-full border px-3 py-2 rounded"
//           placeholder="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         {error && <p className="text-red-500">{error}</p>}
//         <button className="w-full bg-green-600 text-white py-2 rounded">
//           Register
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { registerUser } from "../components/services/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import AuthFormContainer from "../components/common/AuthFormContainer";
import FormField from "../components/common/FormField";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

      const data = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      login(data.user, data.access);
      toast.success(`Welcome to FreelanceHub, ${data.user.username}!`);
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);

      const errorData = err.response?.data || {};
      let errorMessage = "Registration failed. Please try again.";

      // Handle different error formats from backend
      if (errorData.username) {
        errorMessage = errorData.username[0];
      } else if (errorData.email) {
        errorMessage = errorData.email[0];
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }

      setErrors({ submit: errorMessage });
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthFormContainer title="Creating Account...">
        <LoadingSpinner text="Setting up your account..." />
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer title="Create Your Account">
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
            placeholder="Choose a username"
            disabled={loading}
            autoComplete="username"
          />
        </FormField>

        <FormField label="Email Address" error={errors.email} required>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className={`input-field ${errors.email ? "input-error" : ""}`}
            placeholder="Enter your email"
            disabled={loading}
            autoComplete="email"
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
              placeholder="Create a password"
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Must contain uppercase, lowercase, and number
          </p>
        </FormField>

        <FormField
          label="Confirm Password"
          error={errors.confirmPassword}
          required
        >
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={onChange}
            className={`input-field ${
              errors.confirmPassword ? "input-error" : ""
            }`}
            placeholder="Confirm your password"
            disabled={loading}
            autoComplete="new-password"
          />
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </AuthFormContainer>
  );
}
