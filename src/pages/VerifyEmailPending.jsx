import { useLocation, Link } from "react-router-dom";
import { resendVerificationEmail } from "../components/services/auth";
import { toast } from "react-toastify";
import AuthFormContainer from "../components/common/AuthFormContainer";

export default function VerifyEmailPending() {
  const location = useLocation();
  const { email, role } = location.state || {};

  const handleResend = async () => {
    if (!email) return;

    try {
      await resendVerificationEmail(email);
      toast.success("Verification email sent successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to send verification email"
      );
    }
  };

  return (
    <AuthFormContainer title="Check Your Email">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>

        <div className="space-y-4">
          <p className="text-gray-600">
            We've sent a verification link to <strong>{email}</strong>
          </p>

          <p className="text-sm text-gray-500">
            Click the link in the email to activate your account and start using
            FreelanceHub.
          </p>

          {role === "FREELANCER" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note for Freelancers:</strong> After email verification,
                your account will need admin approval before you can start
                claiming projects.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4">
          <button onClick={handleResend} className="btn-secondary w-full">
            Resend Verification Email
          </button>

          <Link to="/login" className="block text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </AuthFormContainer>
  );
}
