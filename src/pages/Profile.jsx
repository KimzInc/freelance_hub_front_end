import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../components/services/requests";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.response?.data?.error || "Could not fetch profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!profile) {
    return <p className="p-6">No profile found.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p>
        <span className="font-medium">Username:</span> {profile.username}
      </p>
      <p>
        <span className="font-medium">Email:</span> {profile.email}
      </p>

      <div className="pt-4">
        <Link
          to="/profile/edit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
