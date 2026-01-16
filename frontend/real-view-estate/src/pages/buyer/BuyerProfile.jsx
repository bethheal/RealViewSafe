import React from 'react';

import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import buyerService  from "../../services/buyer.service";

export default function BuyerProfile() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    buyerService.getProfile().then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <div className="text-gray-600 font-semibold">Loading...</div>;

  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await buyerService.updateProfile(profile);
      alert("Saved (mock/API)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Buyer Profile</h1>
        <p className="text-gray-600 mt-1">Your account details.</p>
      </div>

      <Card title="Profile" subtitle="Update your contact info">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={profile.fullName} readOnly />
          <Input label="Email" value={profile.email} readOnly />
          <Input label="Phone" value={profile.phone || ""} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div className="mt-4">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
