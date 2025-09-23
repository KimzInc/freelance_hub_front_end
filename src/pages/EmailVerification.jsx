import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  verifyEmail,
  resendVerificationEmail,
} from "../components/services/auth";
import { toast } from "react-toastify";
import AuthFormContainer from "../components/common/AuthFormContainer";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, resend
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        setLoading(true);
        const data = await verifyEmail(token);

        // Store tokens and user data from successful verification
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        setStatus("success");
        toast.success(data.message || "Email verified successfully!");

        // Redirect after a delay
        setTimeout(() => {
          if (data.user.role === "CLIENT") {
            navigate("/my-requests");
          } else if (data.user.role === "FREELANCER") {
            navigate(
              data.user.is_approved
                ? "/freelancer/dashboard"
                : "/pending-approval"
            );
          } else {
            navigate("/");
          }
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        toast.error(error.response?.data?.error || "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken(token);
    }
  }, [token, navigate]);

  const handleResendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      await resendVerificationEmail(email);
      setStatus("resend_success");
      toast.success("Verification email sent successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to send verification email"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthFormContainer title="Verifying Email...">
        <LoadingSpinner text="Verifying your email..." />
      </AuthFormContainer>
    );
  }

  if (status === "success") {
    return (
      <AuthFormContainer title="Email Verified!">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Email Verified Successfully!
          </h2>
          <p className="text-gray-600">
            Your account has been activated. Redirecting you to the dashboard...
          </p>
          <div className="pt-4">
            <Link to="/login" className="text-blue-600 hover:underline">
              Or click here to login
            </Link>
          </div>
        </div>
      </AuthFormContainer>
    );
  }

  if (status === "error") {
    return (
      <AuthFormContainer title="Verification Failed">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Verification Failed
          </h2>
          <p className="text-gray-600">
            The verification link is invalid or has expired. Please request a
            new verification email.
          </p>

          <div className="pt-4">
            <button
              onClick={() => setStatus("resend")}
              className="btn-primary w-full"
            >
              Resend Verification Email
            </button>
            <Link
              to="/login"
              className="block text-center text-blue-600 hover:underline mt-4"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </AuthFormContainer>
    );
  }

  if (status === "resend" || status === "resend_success") {
    return (
      <AuthFormContainer title="Resend Verification Email">
        <div className="space-y-4">
          {status === "resend_success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">
                Verification email sent successfully! Please check your inbox.
              </p>
            </div>
          )}

          <p className="text-gray-600">
            Enter your email address to receive a new verification link.
          </p>

          <form onSubmit={handleResendEmail} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>
          </form>

          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer title="Verifying Email">
      <LoadingSpinner text="Verifying your email address..." />
    </AuthFormContainer>
  );
}
