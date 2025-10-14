import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import FreelancerProjectCard from "./FreelancerProjectCard";
import {
  getFreelancerProjects,
  claimProject,
  getMyFreelancerProjects,
} from "../components/services/projects";
import { toast } from "react-toastify";
import {
  checkApproval,
  getDisciplines,
  getAssignmentTypes,
} from "../components/services/requests";

export default function FreelancerDashboard() {
  const { user, updateUser } = useContext(AuthContext);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disciplines, setDisciplines] = useState([]);
  const [assignmentTypes, setAssignmentTypes] = useState([]);

  // Check approval status
  const checkApprovalIfNeeded = useCallback(async () => {
    if (user?.is_approved === undefined || !user?.is_approved) {
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

  // Load disciplines and assignment types
  const loadOptions = useCallback(async () => {
    try {
      const [disciplineData, assignmentTypeData] = await Promise.all([
        getDisciplines(),
        getAssignmentTypes(),
      ]);
      setDisciplines(disciplineData || []);
      setAssignmentTypes(assignmentTypeData || []);
    } catch (error) {
      console.error("Error loading options:", error);
      // Continue even if options fail to load
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Check if user is approved
      const isApproved = await checkApprovalIfNeeded();

      if (!isApproved) {
        setLoading(false);
        return;
      }

      // Load options and projects in parallel
      await loadOptions();

      // Load both available and assigned projects
      const [availableData, myProjectsData] = await Promise.all([
        getFreelancerProjects(),
        getMyFreelancerProjects(),
      ]);

      console.log("Available projects data:", availableData);
      console.log("My projects data:", myProjectsData);

      setAvailableProjects(availableData || []);
      setMyProjects(myProjectsData || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      setError("Failed to load projects");

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to load projects. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [checkApprovalIfNeeded, loadOptions]);

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
      // Reload both lists to reflect changes
      loadProjects();
    } catch (error) {
      console.error("Error claiming project:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to claim project";
      toast.error(errorMessage);
    }
  };

  // Helper function to get name from ID
  const getNameFromId = (id, options) => {
    if (!id || !Array.isArray(options)) return "Not specified";
    const option = options.find((opt) => opt.id === id);
    return option ? option.name : "Unknown";
  };

  // Access denied for non-freelancers
  if (user?.role !== "FREELANCER") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-gray-600">This page is for freelancers only.</p>
      </div>
    );
  }

  // Pending approval message
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button onClick={loadProjects} className="btn-primary mt-2">
            Retry
          </button>
        </div>
      )}

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
          {!availableProjects || availableProjects.length === 0 ? (
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
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : "Not specified"}
                    </p>
                    <p>Pages: {project.number_of_pages}</p>
                    <p>Style: {project.style}</p>
                    <p>
                      Discipline:{" "}
                      {getNameFromId(project.discipline, disciplines)}
                    </p>
                    <p>
                      Assignment Type:{" "}
                      {getNameFromId(project.assignment_type, assignmentTypes)}
                    </p>
                  </div>
                  <p className="font-semibold mb-3">
                    Price: $
                    {project.display_price !== undefined
                      ? parseFloat(project.display_price).toFixed(0)
                      : project.total_price
                      ? parseFloat(project.total_price).toFixed(0)
                      : "0"}
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
          {!myProjects || myProjects.length === 0 ? (
            <p className="text-gray-600">
              You haven't claimed any projects yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myProjects.map((project) => (
                <FreelancerProjectCard
                  key={project.id}
                  project={project}
                  onProjectUpdate={loadProjects}
                  disciplines={disciplines}
                  assignmentTypes={assignmentTypes}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
