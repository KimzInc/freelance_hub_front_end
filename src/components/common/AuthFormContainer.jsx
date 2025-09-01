export default function AuthFormContainer({ title, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">Welcome to FreelanceHub</p>
          </div>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}
