import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  UserPlus,
  Settings,
  Download,
} from "lucide-react";
import { getAuthToken } from "@/utils/auth";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface DashboardStats {
  total_complaints: number;
  resolved_complaints: number;
  pending_complaints: number;
  resolution_rate: number;
  complaints_by_category: Array<{ category: string; count: number }>;
  complaints_by_status: Array<{ status: string; color: string; count: number }>;
  users_by_role: Array<{ role: string; count: number }>;
  recent_complaints: Array<any>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.status) {
        setStats(data.data);
      } else {
        toast.error(data.message || "Failed to load dashboard statistics");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex text-gray-900 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of system statistics and activities</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/admin/users")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Manage Users
                </button>
                <button
                  onClick={() => navigate("/admin/reports")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Reports
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Complaints"
                value={stats.total_complaints}
                icon={MessageSquare}
                color="blue"
                trend="+12% from last month"
              />
              <StatCard
                title="Pending"
                value={stats.pending_complaints}
                icon={Clock}
                color="yellow"
                trend="Awaiting response"
              />
              <StatCard
                title="Resolved"
                value={stats.resolved_complaints}
                icon={CheckCircle}
                color="green"
                trend={`${stats.resolution_rate}% resolution rate`}
              />
              <StatCard
                title="Users"
                value={stats.users_by_role.reduce((sum, role) => sum + role.count, 0)}
                icon={Users}
                color="purple"
                trend="Active users"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Complaints by Category */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-indigo-600" />
                  Complaints by Category
                </h3>
                <div className="space-y-3">
                  {stats.complaints_by_category.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="w-32 text-sm text-gray-700">{item.category}</div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{
                                width: `${(item.count / stats.total_complaints) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 w-12 text-right">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complaints by Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                  Complaints by Status
                </h3>
                <div className="space-y-3">
                  {stats.complaints_by_status.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="w-32 text-sm text-gray-700">{item.status}</div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(item.count / stats.total_complaints) * 100}%`,
                                backgroundColor: item.color,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 w-12 text-right">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Users by Role */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                Users by Role
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.users_by_role.map((role, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{role.count}</div>
                    <div className="text-sm text-gray-600 capitalize">{role.role}s</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                  Recent Complaints
                </h3>
                <button
                  onClick={() => navigate("/complaints")}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Submitted By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recent_complaints.map((complaint) => (
                      <tr
                        key={complaint.id}
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{complaint.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {complaint.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {complaint.category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${complaint.status.color}20`,
                              color: complaint.status.color,
                            }}
                          >
                            {complaint.status.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {complaint.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickActionCard
                title="Manage Users"
                description="Add, edit, or remove users"
                icon={Users}
                onClick={() => navigate("/admin/users")}
              />
              <QuickActionCard
                title="Categories"
                description="Manage complaint categories"
                icon={FileText}
                onClick={() => navigate("/admin/categories")}
              />
              <QuickActionCard
                title="System Settings"
                description="Configure system settings"
                icon={Settings}
                onClick={() => navigate("/admin/settings")}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "purple" | "yellow" | "green";
  trend: string;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
      <div className="text-xs text-gray-500">{trend}</div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
    >
      <div className="flex items-center mb-4">
        <div className="p-3 bg-indigo-50 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}