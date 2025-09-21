import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import FreelancerProjectCard from "./FreelancerProjectCard";
import {
  getFreelancerProjects,
  claimProject,
  getMyFreelancerProjects,
} from "../components/services/projects";
import { toast } from "react-toastify";
import { checkApproval } from "../components/services/requests";

export default function FreelancerDashboard() {
  const { user, updateUser } = useContext(AuthContext);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);

  // Only check approval status if needed
  const checkApprovalIfNeeded = useCallback(async () => {
    // If we don't have approval status or user is not approved, check with server
    if (user.is_approved === undefined || !user.is_approved) {
      try {
        const approvalStatus = await checkApproval();
        updateUser(approvalStatus);
        return approvalStatus.is_approved;
      } catch (error) {
        console.error("Error checking approval status:", error);
        return false;
      }
    }
    return user.is_approved;
  }, [user, updateUser]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);

      // Check if user is approved before loading projects
      const isApproved = await checkApprovalIfNeeded();

      if (!isApproved) {
        setLoading(false);
        return;
      }

      const [available, myProjects] = await Promise.all([
        getFreelancerProjects(),
        getMyFreelancerProjects(),
      ]);
      setAvailableProjects(available);
      setMyProjects(myProjects);
    } catch (error) {
      console.error("Error loading projects:", error);

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to load projects");
      }
    } finally {
      setLoading(false);
    }
  }, [checkApprovalIfNeeded]);

  useEffect(() => {
    if (user?.role === "FREELANCER") {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [user, loadProjects]);

  const handleClaimProject = async (projectId) => {
    try {
      await claimProject(projectId);
      toast.success("Project claimed successfully!");
      loadProjects(); // Reload projects after claiming
    } catch (error) {
      console.error("Error claiming project:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to claim project";
      toast.error(errorMessage);
    }
  };

  // This check should be redundant now due to ProtectedRoute,
  // but it's a good safety measure
  if (user?.role !== "FREELANCER") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-gray-600">This page is for freelancers only.</p>
      </div>
    );
  }

  if (!user?.is_approved) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Pending Approval</h2>
        <p className="text-gray-600">
          Your account is under review. Please wait for admin approval before
          accessing freelancer features.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Freelancer Dashboard</h2>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "available"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("available")}
        >
          Available Projects
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "myProjects"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("myProjects")}
        >
          My Projects
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : activeTab === "available" ? (
        <>
          <h3 className="text-xl font-semibold mb-4">Available Projects</h3>
          {availableProjects.length === 0 ? (
            <p className="text-gray-600">
              No available projects at the moment.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableProjects.map((project) => (
                <div
                  key={project.id}
                  className="border p-4 rounded-lg shadow-sm bg-white"
                >
                  <h4 className="font-bold text-lg mb-2">{project.title}</h4>
                  <p className="text-gray-600 mb-3">
                    {project.description?.slice(0, 120)}...
                  </p>
                  <div className="text-sm text-gray-500 mb-3">
                    <p>
                      Deadline:{" "}
                      {new Date(project.deadline).toLocaleDateString()}
                    </p>
                    <p>Pages: {project.number_of_pages}</p>
                    <p>Style: {project.style}</p>
                  </div>
                  <p className="font-semibold mb-3">
                    Price: ${project.display_price || project.total_price}
                  </p>
                  <button
                    className="btn-primary w-full"
                    onClick={() => handleClaimProject(project.id)}
                  >
                    Claim Project
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-4">My Projects</h3>
          {myProjects.length === 0 ? (
            <p className="text-gray-600">
              You haven't claimed any projects yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myProjects.map((project) => (
                <FreelancerProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
