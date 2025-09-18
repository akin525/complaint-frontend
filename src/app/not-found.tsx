import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="bg-[#0D1117] text-white min-h-screen flex justify-center h-full w-full items-center flex-col gap-4">
      <h5>Page Not Found</h5>

      <Link to="/">
        <button className="px-4 py-2 text-xs border rounded-lg cursor-pointer">
          Go home
        </button>
      </Link>
    </div>
  );
}
