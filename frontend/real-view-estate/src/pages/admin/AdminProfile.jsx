import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

export default function AdminProfile() {
  const admin = { fullName: "Admin User", email: "admin@demo.com" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600 mt-1">Your account details.</p>
      </div>

      <Card title="Profile" subtitle="This is read-only for now.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={admin.fullName} readOnly />
          <Input label="Email" value={admin.email} readOnly />
        </div>
      </Card>
    </div>
  );
}
