import { useEffect, useState } from "react";
import {
  getProjects,
  getDisciplines,
  getAssignmentTypes,
} from "../components/services/projects";
import ProjectList from "../components/Projects/ProjectList";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PriceCalculator from "./PriceCalculator";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [selectedAssignmentType, setSelectedAssignmentType] = useState("");
  const [disciplines, setDisciplines] = useState([]);
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [projectsData, disciplinesData, assignmentTypesData] =
          await Promise.all([
            getProjects(),
            getDisciplines(),
            getAssignmentTypes(),
          ]);

        // Handle paginated response from getProjects()
        let projectsArray = [];
        if (projectsData && Array.isArray(projectsData.results)) {
          // Django REST Framework paginated response
          projectsArray = projectsData.results;
        } else if (Array.isArray(projectsData)) {
          // Direct array response
          projectsArray = projectsData;
        } else if (projectsData && Array.isArray(projectsData.data)) {
          // Alternative structure
          projectsArray = projectsData.data;
        } else {
          console.warn("Unexpected projects response structure:", projectsData);
          projectsArray = [];
        }

        setProjects(projectsArray);
        setFilteredProjects(projectsArray);
        setDisciplines(disciplinesData);
        setAssignmentTypes(assignmentTypesData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Apply filters whenever search or selections change
  useEffect(() => {
    if (
      search.trim() === "" &&
      !selectedDiscipline &&
      !selectedAssignmentType
    ) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter((project) => {
      const matchesSearch =
        search.trim() === "" ||
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        (project.abstract &&
          project.abstract.toLowerCase().includes(search.toLowerCase()));

      const matchesDiscipline =
        !selectedDiscipline ||
        (project.discipline &&
          project.discipline
            .toLowerCase()
            .includes(selectedDiscipline.toLowerCase()));

      const matchesAssignmentType =
        !selectedAssignmentType ||
        (project.assignment_type &&
          project.assignment_type
            .toLowerCase()
            .includes(selectedAssignmentType.toLowerCase()));

      return matchesSearch && matchesDiscipline && matchesAssignmentType;
    });

    setFilteredProjects(filtered);
  }, [search, selectedDiscipline, selectedAssignmentType, projects]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleDisciplineChange = (e) => {
    setSelectedDiscipline(e.target.value);
  };

  const handleAssignmentTypeChange = (e) => {
    setSelectedAssignmentType(e.target.value);
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedDiscipline("");
    setSelectedAssignmentType("");
  };

  const hasActiveFilters =
    search || selectedDiscipline || selectedAssignmentType;

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
          Browse available projects by discipline and assignment type, or use
          our calculator for custom requests
        </p>
      </div>

      {/* Price calculator */}
      <div className="mb-12">
        <PriceCalculator />
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Available Projects
          </h2>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={handleSearchChange}
                  className="input-field pl-10 pr-10 py-2 w-full sm:w-64"
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
                    onClick={() => setSearch("")}
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
            </div>

            {/* Discipline Filter */}
            <select
              value={selectedDiscipline}
              onChange={handleDisciplineChange}
              className="input-field py-2"
            >
              <option value="">All Disciplines</option>
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.name}>
                  {discipline.name}
                </option>
              ))}
            </select>

            {/* Assignment Type Filter */}
            <select
              value={selectedAssignmentType}
              onChange={handleAssignmentTypeChange}
              className="input-field py-2"
            >
              <option value="">All Assignment Types</option>
              {assignmentTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-secondary py-2 px-4 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Status */}
        {hasActiveFilters && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
              <span className="font-medium">Active filters:</span>
              {search && (
                <span className="bg-blue-100 px-2 py-1 rounded-full">
                  Search: "{search}"
                </span>
              )}
              {selectedDiscipline && (
                <span className="bg-blue-100 px-2 py-1 rounded-full">
                  Discipline: {selectedDiscipline}
                </span>
              )}
              {selectedAssignmentType && (
                <span className="bg-blue-100 px-2 py-1 rounded-full">
                  Type: {selectedAssignmentType}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </span>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            {hasActiveFilters ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 mb-4">
                  No projects match your current filters
                </p>
                <button onClick={clearAllFilters} className="btn-primary">
                  Clear All Filters
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

      {/* Categories Section */}
      {disciplines.length > 0 && assignmentTypes.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Browse by Category
          </h3>

          {/* Discipline Categories */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Popular Disciplines
            </h4>
            <div className="flex flex-wrap gap-3 justify-center">
              {disciplines.slice(0, 8).map((discipline) => (
                <button
                  key={discipline.id}
                  onClick={() => setSelectedDiscipline(discipline.name)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    selectedDiscipline === discipline.name
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {discipline.name}
                </button>
              ))}
            </div>
          </div>

          {/* Assignment Type Categories */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Assignment Types
            </h4>
            <div className="flex flex-wrap gap-3 justify-center">
              {assignmentTypes.slice(0, 8).map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedAssignmentType(type.name)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    selectedAssignmentType === type.name
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
