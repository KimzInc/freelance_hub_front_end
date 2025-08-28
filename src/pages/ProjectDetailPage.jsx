import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectDetail } from "../components/services/projects";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProjectDetail(id)
      .then(setProject)
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            "You must purchase this project to view full content."
        );
      });
  }, [id]);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-600">{error}</h1>
      </div>
    );
  }

  if (!project) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
      <p className="mb-4">{project.full_content}</p>
      <p className="font-semibold">Price: ${project.price}</p>
    </div>
  );
}
