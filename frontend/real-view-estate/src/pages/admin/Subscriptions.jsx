import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import { adminService } from "../../services/admin.service";
import { PLANS } from "../../constants/subscription";

export default function Subscription() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // simple assign form (demo)
  const [agentId, setAgentId] = useState("");
  const [plan, setPlan] = useState(PLANS.BASIC);
  const [days, setDays] = useState(30);

  useEffect(() => {
    adminService.getSubscriptions()
      .then((res) => setSubs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const assign = async () => {
    await adminService.assignSubscription({ agentId, plan, days: Number(days) });
    alert("Assigned (mock/API)");
  };

  const tone = (p) => (p === "PREMIUM" ? "purple" : p === "BASIC" ? "blue" : "gray");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Subscriptions</h1>
        <p className="text-gray-600 mt-1">Manage agent plans and priority.</p>
      </div>

      <Card title="Assign Plan" subtitle="Demo form (wire to real agentId later)">
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Agent ID" value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="agentId..." />
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="FREE">FREE</option>
              <option value="BASIC">BASIC</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
          </div>
          <Input label="Days" type="number" value={days} onChange={(e) => setDays(e.target.value)} />
        </div>
        <div className="mt-4">
          <Button onClick={assign}>Assign Subscription</Button>
        </div>
      </Card>

      <Card title="Current Subscriptions" subtitle="Desktop + mobile friendly list">
        {loading ? (
          <div className="text-gray-500 font-semibold">Loading...</div>
        ) : subs.length === 0 ? (
          <EmptyState title="No subscriptions" desc="Subscriptions will appear here." />
        ) : (
          <div className="space-y-3">
            {subs.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4"
              >
                <div>
                  <p className="font-extrabold text-gray-900">{s.agentName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Expires: <span className="font-mono">{new Date(s.expiresAt).toLocaleDateString()}</span>
                  </p>
                </div>
                <Badge tone={tone(s.plan)}>{s.plan}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
