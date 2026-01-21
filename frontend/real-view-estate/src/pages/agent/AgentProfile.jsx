import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import api from "../../lib/api";
import { agentService } from "../../services/agent.service";

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}

function isValidUrl(u) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

export default function AgentProfile() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  // uploads
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [bizFile, setBizFile] = useState(null);

  // password change
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [modal, setModal] = useState({ open: false, title: "", message: "" });

  useEffect(() => {
    agentService.getProfile().then((res) => setProfile(res.data));
  }, []);

  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const pwScore = useMemo(() => strength(pw.next), [pw.next]);

  const resolvedAvatarUrl = useMemo(() => {
    const a = profile?.avatarUrl || "";
    if (!a) return "";
    if (isValidUrl(a)) return a;

    if (a.startsWith("/")) {
      const base = import.meta.env.VITE_API_URL || "";
      return base ? `${base}${a}` : a;
    }
    return a;
  }, [profile?.avatarUrl]);

  if (!profile) return <div className="text-gray-600 font-semibold">Loading...</div>;

  const saveProfile = async () => {
    setSaving(true);
    try {
      await agentService.updateProfile({
        phone: profile.phone,
        company: profile.company,
        bio: profile.bio,
      });

      setModal({ open: true, title: "Saved", message: "Profile saved successfully." });
    } catch (e) {
      setModal({
        open: true,
        title: "Error",
        message: e?.response?.data?.message || "Failed to save profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) {
      setModal({ open: true, title: "Error", message: "Please choose an image first." });
      return;
    }

    try {
      setAvatarUploading(true);
      const form = new FormData();
      form.append("avatar", avatarFile);

      // baseURL = VITE_API_URL + "/api"
      const res = await api.patch("/auth/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res?.data?.data ?? res?.data;
      const newUrl = data?.user?.avatarUrl;

      if (!newUrl) {
        setModal({ open: true, title: "Error", message: "Upload succeeded but no avatarUrl returned." });
        return;
      }

      setProfile((p) => ({ ...(p || {}), avatarUrl: newUrl }));
      setAvatarFile(null);

      setModal({ open: true, title: "Success", message: "Avatar uploaded successfully." });
    } catch (e) {
      setModal({
        open: true,
        title: "Upload failed",
        message: e?.response?.data?.message || "Failed to upload avatar.",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const changePassword = async () => {
    if (!pw.current || !pw.next) {
      setModal({ open: true, title: "Error", message: "Please fill all password fields." });
      return;
    }
    if (pw.next !== pw.confirm) {
      setModal({ open: true, title: "Error", message: "New password and confirm do not match." });
      return;
    }
    if (pwScore < 3) {
      setModal({
        open: true,
        title: "Weak Password",
        message: "Use 8+ chars with uppercase, number and symbol.",
      });
      return;
    }

    try {
      await agentService.changePassword?.({
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      setPw({ current: "", next: "", confirm: "" });
      setModal({ open: true, title: "Success", message: "Password updated." });
    } catch (e) {
      setModal({
        open: true,
        title: "Error",
        message: e?.response?.data?.message || "Password change failed (API not connected yet).",
      });
    }
  };

  const tone = profile.verified ? "green" : "yellow";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Agent Profile</h1>
          <p className="text-gray-600 mt-1">Your public details buyers will trust.</p>
        </div>
        <Badge tone={tone}>{profile.verified ? "VERIFIED" : "PENDING VERIFICATION"}</Badge>
      </div>

      <Card title="Profile Details" subtitle="Existing signup details are shown here">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={profile.fullName || ""} readOnly />
          <Input label="Email" value={profile.email || ""} readOnly />

          <Input
            label="Phone"
            value={profile.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="e.g. 233501234567"
          />
          <Input
            label="Company"
            value={profile.company || ""}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Your business name"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-bold text-gray-700">Bio</label>
          <textarea
            rows={4}
            value={profile.bio || ""}
            onChange={(e) => update("bio", e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Tell buyers why they should trust you."
          />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4 items-start">
          <div>
            <label className="text-sm font-bold text-gray-700">Avatar Upload</label>

            {resolvedAvatarUrl ? (
              <img
                src={resolvedAvatarUrl}
                alt="avatar"
                className="mt-2 w-20 h-20 rounded-full object-cover border"
              />
            ) : (
              <p className="text-xs text-gray-500 mt-2">No avatar uploaded yet.</p>
            )}

            <input
              className="mt-2"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />

            <div className="mt-2">
              <Button onClick={uploadAvatar} disabled={!avatarFile || avatarUploading}>
                {avatarUploading ? "Uploading..." : "Upload Avatar"}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Business Verification Upload</label>
            <input
              className="mt-2"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setBizFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-gray-500 mt-1">Upload CAC/License to verify.</p>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      <Card title="Change Password" subtitle="More robust password update">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Current Password"
            type="password"
            value={pw.current}
            onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
          />
          <div />

          <Input
            label="New Password"
            type="password"
            value={pw.next}
            onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
            hint="8+ chars, uppercase, number, symbol"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={pw.confirm}
            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
          />
        </div>

        <div className="mt-3">
          <p className="text-sm font-bold text-gray-700">
            Strength:{" "}
            <span className="font-extrabold">
              {pwScore <= 1 ? "Weak" : pwScore === 2 ? "Okay" : pwScore === 3 ? "Strong" : "Very Strong"}
            </span>
          </p>
        </div>

        <div className="mt-4">
          <Button onClick={changePassword}>Update Password</Button>
        </div>
      </Card>

      <Modal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ open: false, title: "", message: "" })}
        actions={<Button onClick={() => setModal({ open: false, title: "", message: "" })}>OK</Button>}
      >
        <p className="text-gray-700 font-semibold">{modal.message}</p>
      </Modal>
    </div>
  );
}
