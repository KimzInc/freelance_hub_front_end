import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getFreelancerProjects,
  claimProject,
} from "../components/services/projects";

export default function FreelancerDashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.is_approved) {
      getFreelancerProjects()
        .then(setProjects)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user?.is_approved) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Pending Approval</h2>
        <p className="text-gray-600">
          Your account is under review. Please wait for admin approval before
          claiming projects.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Projects</h2>
      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p>No available projects at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((proj) => (
            <li key={proj.id} className="border p-4 rounded shadow-sm">
              <h3 className="font-bold">{proj.title}</h3>
              <p>{proj.description.slice(0, 120)}...</p>
              <p className="text-sm text-gray-600">Deadline: {proj.deadline}</p>
              <p className="font-semibold">Price: ${proj.display_price}</p>
              <button
                className="btn-primary mt-2"
                onClick={() => claimProject(proj.id)}
              >
                Claim Project
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
