import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest(".user-menu")) setOpen(false);
      if (mobileMenuOpen && !event.target.closest(".mobile-menu"))
        setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-gray-800 text-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-700 mobile-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <Link to="/" className="font-bold text-xl flex items-center">
          ⚡ FreelanceHub
        </Link>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden mobile-menu shadow-xl">
          <nav className="p-4 space-y-4 text-sm">
            {/* Main */}
            <div>
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="w-5 text-center">🏠</span>
                <span>Home</span>
              </Link>
            </div>

            {/* Admin section */}
            {user?.role === "ADMIN" && (
              <div className="border-t border-gray-700 pt-3">
                <p className="px-4 pb-1 text-xs uppercase text-gray-400 font-semibold">
                  Administration
                </p>

                <Link
                  to="/admin/freelancer-approval"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-5 text-center">👨‍💼</span>
                  <span>Admin Panel</span>
                </Link>

                <Link
                  to="/admin/audit-logs"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-5 text-center">📊</span>
                  <span>Audit Logs</span>
                </Link>
              </div>
            )}

            {/* Role-based section */}
            {user?.role === "CLIENT" && (
              <div className="border-t border-gray-700 pt-3">
                <p className="px-4 pb-1 text-xs uppercase text-gray-400 font-semibold">
                  Client
                </p>

                <Link
                  to="/my-requests"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-5 text-center">📋</span>
                  <span>My Requests</span>
                </Link>
              </div>
            )}

            {user?.role === "FREELANCER" && (
              <div className="border-t border-gray-700 pt-3">
                <p className="px-4 pb-1 text-xs uppercase text-gray-400 font-semibold">
                  Freelancer
                </p>

                {user.is_approved ? (
                  <Link
                    to="/freelancer/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-5 text-center">💼</span>
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/pending-approval"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="w-5 text-center">⏳</span>
                    <span>Pending Approval</span>
                  </Link>
                )}
              </div>
            )}

            {/* Account */}
            {user && (
              <div className="border-t border-gray-700 pt-3">
                <p className="px-4 pb-1 text-xs uppercase text-gray-400 font-semibold">
                  Account
                </p>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-5 text-center">👤</span>
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/profile/edit"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-5 text-center">✏️</span>
                  <span>Edit Profile</span>
                </Link>

                <Link
                  to="/change-password"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-5 text-center">🔒</span>
                  <span>Change Password</span>
                </Link>
              </div>
            )}

            {/* Logout */}
            {user && (
              <div className="border-t border-gray-700 pt-3">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <span className="w-5 text-center">🚪</span>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      <nav className="hidden md:flex items-center gap-6">
        <Link to="/">Home</Link>

        {user ? (
          <div className="relative user-menu">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg"
            >
              {user.username} ▼
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 border rounded-xl shadow-xl z-50 overflow-hidden">
                {/* User header */}
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="font-semibold text-sm">{user.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                {/* Admin section */}
                {user.role === "ADMIN" && (
                  <div className="py-1 border-b">
                    <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
                      Administration
                    </p>

                    <Link
                      to="/admin/freelancer-approval"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    >
                      <span className="w-5 text-center">👨‍💼</span>
                      <span>Admin Panel</span>
                    </Link>

                    <Link
                      to="/admin/audit-logs"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    >
                      <span className="w-5 text-center">📊</span>
                      <span>Audit Logs</span>
                    </Link>
                  </div>
                )}

                {/* Personal section */}
                <div className="py-1 border-b">
                  <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase">
                    Account
                  </p>

                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                  >
                    <span className="w-5 text-center">👤</span>
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/profile/edit"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                  >
                    <span className="w-5 text-center">✏️</span>
                    <span>Edit Profile</span>
                  </Link>

                  <Link
                    to="/change-password"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                  >
                    <span className="w-5 text-center">🔒</span>
                    <span>Change Password</span>
                  </Link>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="w-5 text-center">🚪</span>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
