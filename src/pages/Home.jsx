import { useEffect, useState } from "react";
import { getProjects } from "../components/services/projects";
import ProjectList from "../components/Projects/ProjectList";

export default function Home() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Projects</h1>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}
