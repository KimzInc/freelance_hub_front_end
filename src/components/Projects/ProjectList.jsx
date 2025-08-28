import ProjectCard from "./ProjectCard";

export default function ProjectList({ projects }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
