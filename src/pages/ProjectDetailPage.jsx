import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProjectDetail,
  downloadProject,
} from "../components/services/projects";
import { AuthContext } from "../context/AuthContext";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!project) return;

    setDownloading(true);
    try {
      // This already calls backend and downloads the PDF
      // await downloadProject(project.id);
      await downloadProject(project.id, project.title);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-600">{error}</h1>
        {!user && (
          <p className="mt-4">
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>{" "}
            or{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>{" "}
            to purchase this project.
          </p>
        )}
      </div>
    );
  }

  if (!project) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Price</div>
          <div className="font-semibold text-lg">${project.price}</div>
        </div>
        {project.number_of_pages && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Pages</div>
            <div className="font-semibold">{project.number_of_pages}</div>
          </div>
        )}
        {project.level && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Level</div>
            <div className="font-semibold">{project.level}</div>
          </div>
        )}
        {project.format && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Format</div>
            <div className="font-semibold">{project.format}</div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Project Content</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="whitespace-pre-line">{project.full_content}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Preparing...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Project
            </>
          )}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Projects
        </button>
      </div>
    </div>
  );
}
