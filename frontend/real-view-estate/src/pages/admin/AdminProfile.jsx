import { useAuth } from "../../context/AuthContext";

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <div className="rounded-2xl bg-white shadow-sm p-6 max-w-lg">
      <h1 className="text-2xl font-extrabold text-gray-900">Admin Profile</h1>

      <div className="mt-4 space-y-3">
        <div>
          <div className="text-sm text-gray-500">Full name</div>
          <div className="font-bold">{user?.fullName}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-bold">{user?.email}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Roles</div>
          <div className="font-bold">{user?.roles?.join(", ")}</div>
        </div>
      </div>
    </div>
  );
}
