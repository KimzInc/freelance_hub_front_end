import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">
        FreelanceHub
      </Link>

      <nav className="flex items-center gap-6">
        <Link to="/">Home</Link>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Hi, {user.username}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 border rounded shadow-lg z-50">
                <Link
                  to="/my-requests"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  My Requests
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/profile/edit"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Edit Profile
                </Link>
                <Link
                  to="/change-password"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Change Password
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Logout
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
