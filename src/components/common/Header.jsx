import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest(".user-menu")) {
        setOpen(false);
      }
      if (mobileMenuOpen && !event.target.closest(".mobile-menu")) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-gray-800 text-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-40">
      {/* Left section - Logo and mobile menu button */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors mobile-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                mobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        <Link
          to="/"
          className="font-bold text-xl flex items-center hover:text-blue-300 transition-colors"
        >
          <span className="text-blue-400 mr-2">⚡</span>
          <span className="hidden sm:inline">FreelanceHub</span>
          <span className="sm:hidden">FH</span>
        </Link>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden mobile-menu shadow-xl">
          <nav className="p-4 space-y-2">
            <Link
              to="/"
              className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Mobile navigation for unapproved freelancers */}
            {user && user.role === "FREELANCER" && !user.is_approved && (
              <Link
                to="/pending-approval"
                className="block py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pending Approval
              </Link>
            )}

            {/* Mobile navigation for authenticated users */}
            {user ? (
              <>
                {/* Role-based mobile navigation */}
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin/freelancer-approval"
                    className="flex items-center py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">👨‍💼</span>
                    Admin Panel
                  </Link>
                )}

                {user.role === "CLIENT" && (
                  <Link
                    to="/my-requests"
                    className="flex items-center py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">📋</span>
                    My Requests
                  </Link>
                )}

                {user.role === "FREELANCER" && (
                  <>
                    {user.is_approved ? (
                      <Link
                        to="/freelancer/dashboard"
                        className="flex items-center py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-3">💼</span>
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/pending-approval"
                        className="flex items-center py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-3">⏳</span>
                        Pending Approval
                      </Link>
                    )}
                  </>
                )}

                {/* Common user links */}
                <Link
                  to="/profile"
                  className="flex items-center py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3">👤</span>
                  My Profile
                </Link>
                <Link
                  to="/profile/edit"
                  className="flex items-center py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3">✏️</span>
                  Edit Profile
                </Link>
                <Link
                  to="/change-password"
                  className="flex items-center py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3">🔒</span>
                  Change Password
                </Link>

                {/* Mobile logout button */}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left py-3 px-4 hover:bg-gray-700 text-red-400 rounded-lg transition-colors"
                >
                  <span className="mr-3">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              /* Mobile auth buttons for non-authenticated users */
              <div className="pt-2 border-t border-gray-700">
                <Link
                  to="/login"
                  className="block w-full text-center py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/" className="hover:text-blue-300 transition-colors">
          Home
        </Link>

        {/* Desktop section for unapproved freelancers */}
        {user && user.role === "FREELANCER" && !user.is_approved && (
          <Link
            to="/pending-approval"
            className="hover:text-blue-300 transition-colors"
          >
            Pending Approval
          </Link>
        )}

        {user ? (
          <div className="relative user-menu">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors min-h-[44px]"
              aria-expanded={open}
              aria-haspopup="true"
            >
              <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium min-w-[32px]">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </span>
              <span className="hidden lg:inline">Hi, {user.username}</span>
              <span
                className={`transform transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b bg-gray-50">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>

                {/* Role-based navigation */}
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin/freelancer-approval"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span className="mr-2">👨‍💼</span>
                    Admin Panel
                  </Link>
                )}

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
                        to="/pending-approval"
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
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors min-h-[44px] flex items-center"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] flex items-center"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile auth buttons (visible only on mobile when menu is closed) */}
      {!user && !mobileMenuOpen && (
        <div className="md:hidden flex gap-2">
          <Link
            to="/login"
            className="px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm min-h-[44px] flex items-center"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm min-h-[44px] flex items-center"
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}
