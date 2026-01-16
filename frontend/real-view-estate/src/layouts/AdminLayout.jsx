import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* sidebar */}

      <div className="flex-1">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
          <div>
            <div className="text-sm text-gray-500">Signed in as</div>
            <div className="font-bold text-gray-900">{user?.email}</div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
            className="text-sm font-bold text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>

        {/* outlet */}
      </div>
    </div>
  );
}
