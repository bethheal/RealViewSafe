import React from "react";  
import {StatCard} from "../../components/data/StatCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { Users, Clock, CreditCard, Activity } from "lucide-react";

export default function AdminDashboard() {
  // later: replace with api + mock
  const stats = { agents: 23, pending: 7, revenue: 12 };
  const activity = [
    { id: "1", title: "2 Bedroom Apartment", agent: "Ama Agent", status: "PENDING", date: "2026-01-15" },
    { id: "2", title: "Luxury Villa", agent: "Kojo Agent", status: "APPROVED", date: "2026-01-13" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage agents, reviews and subscriptions.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Agents" value={stats.agents} icon={<Users size={30} />} />
        <StatCard title="Pending Reviews" value={stats.pending} icon={<Clock size={30} />} />
        <StatCard title="Active Subs" value={stats.revenue} icon={<CreditCard size={30} />} />
      </div>

      <Card
        title="Recent Activity"
        subtitle="Latest property submissions and approvals"
        right={<div className="text-gray-300"><Activity size={20} /></div>}
      >
        {activity.length === 0 ? (
          <EmptyState title="No activity yet" desc="Property submissions will show here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-extrabold">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {activity.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-4 font-bold text-gray-900">{a.title}</td>
                    <td className="px-4 py-4 text-gray-700">{a.agent}</td>
                    <td className="px-4 py-4">
                      <Badge tone={a.status === "PENDING" ? "yellow" : a.status === "APPROVED" ? "green" : "red"}>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
