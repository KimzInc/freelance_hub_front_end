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

const RouteErrorBoundary = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // You can send errors to your monitoring service here
      console.log("Route error captured:", error.message);
    }}
    onReset={() => {
      // Custom reset logic for routes
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
                  path="/register"
                  element={
                    <RouteErrorBoundary>
                      <Register />
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
                      <CustomRequest />
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/request/:id"
                  element={
                    <RouteErrorBoundary>
                      <CustomRequestDetailPage />
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/my-requests"
                  element={
                    <RouteErrorBoundary>
                      <MyRequests />
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RouteErrorBoundary>
                      <Profile />
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <RouteErrorBoundary>
                      <ProfileForm />
                    </RouteErrorBoundary>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <RouteErrorBoundary>
                      <ChangePasswordForm />
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
      </AuthProvider>
    </ErrorBoundary>
  );
}
