import { Link } from "react-router-dom";

export default function ErrorFallback({
  error,
  resetErrorBoundary,
  showDetails = false,
  onToggleDetails,
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-6">💥</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something broke!
          </h1>
          <p className="text-gray-600">
            We're sorry, but something went wrong with this component.
          </p>
        </div>

        <div className="card space-y-4">
          <button onClick={resetErrorBoundary} className="w-full btn-primary">
            Try Again
          </button>

          <Link to="/" className="w-full btn-secondary block text-center">
            Go to Homepage
          </Link>

          {error && (
            <div className="pt-4 border-t">
              <button
                onClick={onToggleDetails}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {showDetails ? "Hide" : "Show"} Error Details
              </button>

              {showDetails && (
                <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                  <pre className="text-xs text-red-600 overflow-auto">
                    {error.toString()}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
