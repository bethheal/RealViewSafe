// BuyerProfile.jsx
import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import buyerService from "../../services/buyer.service";

export default function BuyerProfile() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    buyerService.getProfile().then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <div className="text-gray-600 font-semibold">Loading...</div>;

  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await buyerService.updateProfile({
        phone: profile.phone,
        location: profile.location,
        avatarUrl: profile.avatarUrl,
      });
      alert("Profile saved");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwLoading(true);
    try {
      await buyerService.changePassword(pw);
      setPw({ currentPassword: "", newPassword: "" });
      alert("Password updated");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Buyer Profile</h1>
        <p className="text-gray-600 mt-1">Your account details.</p>
      </div>

      <Card title="Profile" subtitle="Update your contact info (email is your login)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={profile.fullName} readOnly />
          <Input label="Email (Login)" value={profile.email} readOnly />
          <Input label="Phone" value={profile.phone || ""} onChange={(e) => update("phone", e.target.value)} />
          <Input label="Location" value={profile.location || ""} onChange={(e) => update("location", e.target.value)} />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <Input
              label="Avatar Image URL"
              value={profile.avatarUrl || ""}
              onChange={(e) => update("avatarUrl", e.target.value)}
              placeholder="https://..."
            />
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="avatar"
                className="mt-3 w-20 h-20 rounded-full object-cover border"
              />
            ) : null}
          </div>

          <div className="sm:text-right">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Change Password" subtitle="Update your password securely">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Current Password"
            type="password"
            value={pw.currentPassword}
            onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <Input
            label="New Password"
            type="password"
            value={pw.newPassword}
            onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
          />
        </div>
        <div className="mt-4">
          <Button onClick={changePassword} disabled={pwLoading || !pw.currentPassword || !pw.newPassword}>
            {pwLoading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
