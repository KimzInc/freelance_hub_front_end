import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import CustomRequestForm from "../components/custom/CustomRequestForm";

export default function CustomRequest() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
        <h1 className="text-2xl font-bold mb-2">Start a Custom Request</h1>
        <p className="mb-4">
          You need to be logged in to submit a custom project request.
        </p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Custom Project Request</h1>
      <CustomRequestForm />
    </div>
  );
}
