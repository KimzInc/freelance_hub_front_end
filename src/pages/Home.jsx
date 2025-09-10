import { useEffect, useState } from "react";
import { getProjects } from "../components/services/projects";
import ProjectList from "../components/Projects/ProjectList";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PriceCalculator from "./PriceCalculator";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProjects()
      .then((data) => {
        setProjects(data);
        setFilteredProjects(data);
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter projects based on search term
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(search.toLowerCase()) ||
          (project.partial_content &&
            project.partial_content
              .toLowerCase()
              .includes(search.toLowerCase())) ||
          (project.full_content &&
            project.full_content.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredProjects(filtered);
    }
  }, [search, projects]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Loading projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-3"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Find Your Perfect Project
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Browse available projects or use our calculator to estimate the cost
          of your custom request
        </p>
      </div>

      {/* Price calculator */}
      <div className="mb-12">
        <PriceCalculator />
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Available Projects
          </h2>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or content..."
                value={search}
                onChange={handleSearchChange}
                className="input-field pl-10 pr-10 py-2"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Search results info */}
            {search && (
              <div className="mt-2 text-sm text-gray-600">
                {filteredProjects.length === projects.length ? (
                  <span>Showing all {projects.length} projects</span>
                ) : (
                  <span>
                    Found {filteredProjects.length} of {projects.length}{" "}
                    projects matching "{search}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            {search ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 mb-4">
                  No projects match your search for "{search}"
                </p>
                <button onClick={clearSearch} className="btn-primary">
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No projects available
                </h3>
                <p className="text-gray-600">
                  Check back later for new projects!
                </p>
              </>
            )}
          </div>
        ) : (
          <ProjectList projects={filteredProjects} />
        )}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Don't see what you're looking for?
        </h3>
        <p className="text-gray-600 mb-6">
          Request a custom project tailored to your specific needs
        </p>
        <a href="/custom-request" className="btn-primary px-8 py-3 text-lg">
          Request Custom Project
        </a>
      </div>
    </div>
  );
}
