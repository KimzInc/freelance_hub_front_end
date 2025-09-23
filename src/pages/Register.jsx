import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../components/services/auth";
import AuthFormContainer from "../components/common/AuthFormContainer";
import FormField from "../components/common/FormField";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null); // CLIENT or FREELANCER
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) newErrors.username = "Username is required";
    else if (form.username.length < 3)
      newErrors.username = "Username must be at least 3 characters";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email address is invalid";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!role) newErrors.role = "Please choose your role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      await registerUser({
        ...form,
        role,
      });

      toast.success(
        `Registration successful! Please check your email (${form.email}) for verification instructions.`
      );

      // Redirect to a page that explains what to do next
      navigate("/verify-email-pending", {
        state: { email: form.email, role: role },
      });
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.error || "Registration failed. Try again.";
      setErrors({ submit: errorMessage });
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    // Initial role selection screen
    return (
      <AuthFormContainer title="Join as a Client or Freelancer">
        <div className="space-y-6">
          <button
            onClick={() => setRole("CLIENT")}
            className="w-full btn-primary py-3 text-lg"
          >
            I want to hire a freelancer
          </button>
          <button
            onClick={() => setRole("FREELANCER")}
            className="w-full btn-secondary py-3 text-lg"
          >
            I want to work as a freelancer
          </button>
        </div>
      </AuthFormContainer>
    );
  }

  if (loading) {
    return (
      <AuthFormContainer title="Creating Account...">
        <LoadingSpinner text="Registering..." />
      </AuthFormContainer>
    );
  }

  // Registration form (role preselected)
  return (
    <AuthFormContainer
      title={
        role === "CLIENT" ? "Register as Client" : "Register as Freelancer"
      }
    >
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
            placeholder="Enter username"
          />
        </FormField>

        <FormField label="Email" error={errors.email} required>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className={`input-field ${errors.email ? "input-error" : ""}`}
            placeholder="Enter email"
          />
        </FormField>

        <FormField label="Password" error={errors.password} required>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            className={`input-field ${errors.password ? "input-error" : ""}`}
            placeholder="Enter password"
          />
        </FormField>

        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
          You are registering as a{" "}
          <strong>
            {role === "CLIENT"
              ? "Client (Can post requests)"
              : "Freelancer (Requires admin approval)"}
          </strong>
        </div>

        <button type="submit" className="w-full btn-primary py-3 text-lg">
          Create Account
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthFormContainer>
  );
}
