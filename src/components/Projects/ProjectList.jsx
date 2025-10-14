import ProjectCard from "./ProjectCard";
import withErrorBoundary from "../common/withErrorBoundary";

function ProjectList({ projects, loading = false }) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="card animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Better safety check for projects data
  if (!projects) {
    console.warn("Projects data is undefined or null");
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No projects data available
        </h3>
        <p className="text-gray-600">
          Please try refreshing the page or contact support.
        </p>
      </div>
    );
  }

  // Check if projects is an array, if not try to extract results
  let projectsArray = [];
  if (Array.isArray(projects)) {
    projectsArray = projects;
  } else if (projects && Array.isArray(projects.results)) {
    projectsArray = projects.results;
  } else if (projects && Array.isArray(projects.data)) {
    projectsArray = projects.data;
  } else {
    console.warn("Projects data is not in expected format:", projects);
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📝❌</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Unable to display projects
        </h3>
        <p className="text-gray-600 mb-4">
          The projects data format is unexpected.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  try {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projectsArray.map((p) => {
          // Validate each project object
          if (!p || !p.id) {
            console.warn("Invalid project object encountered:", p);
            return null; // Skip invalid projects instead of crashing
          }

          return <ProjectCard key={p.id} project={p} />;
        })}
      </div>
    );
  } catch (error) {
    console.error("Error rendering ProjectList:", error);
    throw error; // Re-throw to be caught by error boundary
  }
}

// Custom fallback component for ProjectList
const ProjectListFallback = ({ error, resetErrorBoundary }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="text-red-600 text-4xl mb-4">📝❌</div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">
      Failed to load projects
    </h3>
    <p className="text-red-600 mb-4">
      We encountered an issue while displaying the projects.
    </p>
    <div className="flex gap-3 justify-center">
      <button onClick={resetErrorBoundary} className="btn-primary">
        Try Again
      </button>
      <button
        onClick={() => window.location.reload()}
        className="btn-secondary"
      >
        Refresh Page
      </button>
    </div>

    {process.env.NODE_ENV === "development" && error && (
      <details className="mt-4 text-left">
        <summary className="cursor-pointer text-sm text-red-700">
          Error Details (Development)
        </summary>
        <pre className="text-xs text-red-600 mt-2 p-3 bg-red-100 rounded overflow-auto">
          {error.toString()}
        </pre>
      </details>
    )}
  </div>
);

// Wrap with error boundary
export default withErrorBoundary(ProjectList, {
  FallbackComponent: ProjectListFallback,
  onError: (error, errorInfo) => {
    console.error("ProjectList Error:", error, errorInfo);
    // Here you can log to your error monitoring service
  },
  onReset: () => {
    // Custom reset logic for ProjectList
    console.log("ProjectList error boundary reset");
  },
});
