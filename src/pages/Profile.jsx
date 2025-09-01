// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { getProfile } from "../components/services/requests";

// export default function Profile() {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function fetchProfile() {
//       try {
//         const data = await getProfile();
//         setProfile(data);
//       } catch (err) {
//         console.error("Failed to fetch profile:", err);
//         setError(err.response?.data?.error || "Could not fetch profile.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProfile();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <p className="text-gray-500 animate-pulse">Loading profile…</p>
//       </div>
//     );
//   }

//   if (error) {
//     return <p className="p-6 text-red-600">{error}</p>;
//   }

//   if (!profile) {
//     return <p className="p-6">No profile found.</p>;
//   }

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded space-y-4">
//       <h1 className="text-2xl font-bold">My Profile</h1>
//       <p>
//         <span className="font-medium">Username:</span> {profile.username}
//       </p>
//       <p>
//         <span className="font-medium">Email:</span> {profile.email}
//       </p>

//       <div className="pt-4">
//         <Link
//           to="/profile/edit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Edit Profile
//         </Link>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getProfile, getMyRequests } from "../components/services/requests";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Profile() {
  const { user: authUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    inProgressRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const [profileData, requestsData] = await Promise.all([
          getProfile(),
          getMyRequests(),
        ]);

        setProfile(profileData);

        // Calculate stats from requests
        const requests = Array.isArray(requestsData)
          ? requestsData
          : requestsData.results || [];
        const completed = requests.filter(
          (req) => req.status === "COMPLETED"
        ).length;
        const inProgress = requests.filter(
          (req) => req.status === "IN_PROGRESS"
        ).length;

        setStats({
          totalRequests: requests.length,
          completedRequests: completed,
          inProgressRequests: inProgress,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.response?.data?.error || "Could not fetch profile data.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner text="Loading your profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          No profile found
        </h2>
        <p className="text-gray-600">
          We couldn't find your profile information.
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">
          Manage your account and track your requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalRequests}
          </div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.completedRequests}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {stats.inProgressRequests}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <p className="text-gray-900 font-medium">{profile.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <p className="text-gray-900 font-medium">{profile.email}</p>
          </div>
          {profile.date_joined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-gray-600">{formatDate(profile.date_joined)}</p>
            </div>
          )}
          {profile.last_login && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Login
              </label>
              <p className="text-gray-600">{formatDate(profile.last_login)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/profile/edit"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:text-blue-600">✏️</div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              Edit Profile
            </span>
          </Link>
          <Link
            to="/change-password"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:text-blue-600">🔒</div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              Change Password
            </span>
          </Link>
          <Link
            to="/my-requests"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:text-blue-600">📋</div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              My Requests
            </span>
          </Link>
          <Link
            to="/custom-request"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:text-blue-600">➕</div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              New Request
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity (if available) */}
      {stats.totalRequests > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600">
              You have {stats.totalRequests} request
              {stats.totalRequests !== 1 ? "s" : ""} in total
            </p>
            <Link to="/my-requests" className="btn-primary mt-4">
              View All Requests
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
