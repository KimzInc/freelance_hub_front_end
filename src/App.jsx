import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/common/Header";
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/custom-request" element={<CustomRequest />} />
          <Route path="/request/:id" element={<CustomRequestDetailPage />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileForm />} />
          <Route path="/change-password" element={<ChangePasswordForm />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
