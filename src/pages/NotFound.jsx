import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-600">Page not found.</p>
      <Link to="/" className="mt-4 inline-block text-green-700 hover:underline">
        Back to Home
      </Link>
    </div>
  );
}