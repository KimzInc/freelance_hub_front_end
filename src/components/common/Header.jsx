import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest(".user-menu")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-40">
      <Link
        to="/"
        className="font-bold text-xl flex items-center hover:text-blue-300 transition-colors"
      >
        <span className="text-blue-400 mr-2">⚡</span>
        FreelanceHub
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          to="/"
          className="hover:text-blue-300 transition-colors hidden sm:block"
        >
          Home
        </Link>

        {user ? (
          <div className="relative user-menu">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              aria-expanded={open}
              aria-haspopup="true"
            >
              <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </span>
              <span className="hidden md:inline">Hi, {user.username}</span>
              <span
                className={`transform transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {/* {* /// Add open ///*} */}
            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b bg-gray-50">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>

                {/* ✅ Role-based navigation */}
                {user.role === "CLIENT" && (
                  <Link
                    to="/my-requests"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span className="mr-2">📋</span>
                    My Requests
                  </Link>
                )}

                {user.role === "FREELANCER" && (
                  <>
                    {user.is_approved ? (
                      <Link
                        to="/freelancer/dashboard"
                        className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <span className="mr-2">💼</span>
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/freelancer/pending"
                        className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <span className="mr-2">⏳</span>
                        Pending Approval
                      </Link>
                    )}
                  </>
                )}

                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="mr-2">👤</span>
                  My Profile
                </Link>
                <Link
                  to="/profile/edit"
                  className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="mr-2">✏️</span>
                  Edit Profile
                </Link>
                <Link
                  to="/change-password"
                  className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="mr-2">🔒</span>
                  Change Password
                </Link>

                <div className="border-t">
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600 transition-colors"
                  >
                    <span className="mr-2">🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
