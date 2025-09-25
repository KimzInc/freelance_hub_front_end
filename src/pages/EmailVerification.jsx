import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  verifyEmail,
  resendVerificationEmail,
} from "../components/services/auth";
import {
  showSuccessToast,
  showErrorToast,
} from "../components/common/EnhancedToast";
import AuthFormContainer from "../components/common/AuthFormContainer";
import EnhancedLoadingSpinner from "../components/common/EnhancedLoadingSpinner";

export default function EnhancedEmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [userData, setUserData] = useState(null); // Store user data for the button

  // Define redirectUser with useCallback to stabilize the reference
  const redirectUser = useCallback(
    (user) => {
      if (user?.role === "CLIENT") {
        navigate("/my-requests");
      } else if (user?.role === "FREELANCER") {
        navigate(
          user.is_approved ? "/freelancer/dashboard" : "/pending-approval"
        );
      } else {
        navigate("/");
      }
    },
    [navigate]
  );

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        setLoading(true);
        const data = await verifyEmail(token);

        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Store user data for the button
        setUserData(data.user);
        localStorage.setItem("userData", JSON.stringify(data.user));

        setStatus("success");
        showSuccessToast(data.message || "Email verified successfully!");

        // Auto-redirect with progress indicator
        let countdown = 5;
        const countdownInterval = setInterval(() => {
          countdown--;
          if (countdown === 0) {
            clearInterval(countdownInterval);
            redirectUser(data.user);
          }
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(countdownInterval);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        showErrorToast(error.response?.data?.error || "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken(token);
    }
  }, [token, redirectUser]);

  const handleResendEmail = async () => {
    if (!email.trim() || cooldown > 0) return;

    try {
      setLoading(true);
      await resendVerificationEmail(email);
      setResendCount((prev) => prev + 1);
      setCooldown(60);
      showSuccessToast("Verification email sent successfully!");
      setStatus("resend_success");
    } catch (error) {
      showErrorToast(
        error.response?.data?.error || "Failed to send verification email"
      );
    } finally {
      setLoading(false);
    }
  };

  const VerificationSuccess = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto success-animation">
        <svg
          className="w-10 h-10 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Email Verified Successfully!
        </h2>
        <p className="text-gray-600 mb-4">
          Redirecting you to the dashboard in 5 seconds...
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-green-600 h-2 rounded-full progress-bar"></div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => {
            // Use userData from state or fallback to localStorage
            if (userData) {
              redirectUser(userData);
            } else {
              const storedUser = localStorage.getItem("userData");
              if (storedUser) {
                redirectUser(JSON.parse(storedUser));
              }
            }
          }}
          className="btn-primary w-full"
        >
          Go to Dashboard Now
        </button>
        <Link to="/login" className="block text-blue-600 hover:underline">
          Or return to login
        </Link>
      </div>
    </div>
  );

  const ResendForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Resend Verification Email
        </h3>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleResendEmail();
        }}
        className="space-y-4"
      >
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
          disabled={loading || cooldown > 0}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : cooldown > 0
            ? `Resend available in ${cooldown}s`
            : "Resend Verification Email"}
        </button>
      </form>

      {resendCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Tip:</strong> Check your spam folder if you don't see the
            email.
            {resendCount >= 2 &&
              " You may want to try a different email address."}
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <AuthFormContainer title="Verifying Email">
        <EnhancedLoadingSpinner
          type="dots"
          text="Verifying your email address..."
        />
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer
      title={
        status === "success"
          ? "Email Verified!"
          : status === "error"
          ? "Verification Failed"
          : "Check Your Email"
      }
    >
      {status === "success" && <VerificationSuccess />}
      {status === "error" && <ResendForm />}
      {(status === "resend" || status === "resend_success") && <ResendForm />}
    </AuthFormContainer>
  );
}
