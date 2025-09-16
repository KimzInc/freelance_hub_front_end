import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../components/services/api";

export default function AdminFreelancerApproval() {
  const [pendingFreelancers, setPendingFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingFreelancers();
  }, []);

  const fetchPendingFreelancers = async () => {
    try {
      const { data } = await api.get("/admin/freelancers/");
      setPendingFreelancers(data);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      toast.error("Failed to fetch pending freelancers");
    } finally {
      setLoading(false);
    }
  };

  const approveFreelancer = async (userId) => {
    try {
      await api.patch(`/admin/freelancers/${userId}/approve/`);
      toast.success("Freelancer approved successfully");

      // Remove approved freelancer from list
      setPendingFreelancers((prev) => prev.filter((f) => f.id !== userId));
    } catch (error) {
      console.error("Error approving freelancer:", error);
      toast.error("Failed to approve freelancer");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Freelancer Approval</h1>

      {pendingFreelancers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No pending freelancer applications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingFreelancers.map((freelancer) => (
                <tr key={freelancer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {freelancer.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {freelancer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => approveFreelancer(freelancer.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
