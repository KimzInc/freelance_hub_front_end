import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import CustomRequest from "./pages/CustomRequest";
import CustomRequestDetailPage from "./pages/CustomRequestDetailPage";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import ProfileForm from "./pages/ProfileForm";
import ChangePasswordForm from "./pages/ChangePasswordForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PendingApproval from "./pages/PendingApproval";
import AdminFreelancerApproval from "./pages/AdminFreelancerApproval";
import EmailVerification from "./pages/EmailVerification";
import VerifyEmailPending from "./pages/VerifyEmailPending";

const RouteErrorBoundary = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.log("Route error captured:", error.message);
    }}
    onReset={() => {
      window.scrollTo(0, 0);
    }}
  >
    {children}
  </ErrorBoundary>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PayPalScriptProvider
          options={{ clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID }}
        >
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <RouteErrorBoundary>
                        <Home />
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <RouteErrorBoundary>
                        <Login />
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/verify-email/:token"
                    element={
                      <RouteErrorBoundary>
                        <EmailVerification />{" "}
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/verify-email-pending"
                    element={
                      <RouteErrorBoundary>
                        <VerifyEmailPending />
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <RouteErrorBoundary>
                        <Register />
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/pending-approval"
                    element={
                      <RouteErrorBoundary>
                        <PendingApproval />
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/admin/freelancer-approval"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute requiredRole="ADMIN">
                          <AdminFreelancerApproval />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/freelancer/dashboard"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute
                          requiredRole="FREELANCER"
                          requireApproval
                        >
                          <FreelancerDashboard />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/project/:id"
                    element={
                      <RouteErrorBoundary>
                        <ProjectDetailPage />
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/custom-request"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <CustomRequest />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/request/:id"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <CustomRequestDetailPage />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/my-requests"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <MyRequests />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/profile/edit"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <ProfileForm />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                  <Route
                    path="/change-password"
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <ChangePasswordForm />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              style={{ marginTop: "80px" }}
            />
          </BrowserRouter>
        </PayPalScriptProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
