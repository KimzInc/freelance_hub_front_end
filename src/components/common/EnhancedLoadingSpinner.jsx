export default function EnhancedLoadingSpinner({
  size = "medium",
  text = "Loading...",
  type = "spinner", // spinner, dots, skeleton
  skeletonLines = 3,
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  if (type === "skeleton") {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(skeletonLines)].map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-200 rounded ${
              i === skeletonLines - 1 ? "w-3/4" : "w-full"
            }`}
          ></div>
        ))}
      </div>
    );
  }

  if (type === "dots") {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`}
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
        {text && <p className="mt-2 text-gray-600">{text}</p>}
      </div>
    );
  }

  // Default spinner
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
}
