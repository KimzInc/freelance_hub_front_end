export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <span className="text-yellow-600 text-xl">⏳</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your freelancer account is under review. Please wait for admin
            approval before accessing freelancer features.
          </p>
        </div>
      </div>
    </div>
  );
}
