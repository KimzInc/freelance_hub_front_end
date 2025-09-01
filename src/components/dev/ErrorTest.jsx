import { useState } from "react";

export default function ErrorTest() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("This is a test error from ErrorTest component!");
  }

  return (
    <div className="card text-center">
      <h2 className="text-xl font-semibold mb-4">Error Boundary Test</h2>
      <p className="text-gray-600 mb-4">
        Click the button below to test the error boundary
      </p>
      <button onClick={() => setShouldError(true)} className="btn-danger">
        🧪 Trigger Test Error
      </button>
    </div>
  );
}
