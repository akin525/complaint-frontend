import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Shield,
  Users,
  MessageSquare,
  Settings,
  Activity,
  Database,
  // AlertTriangle,
  CheckCircle,
  Clock,
  // TrendingUp,
  // FileText,
  Download,
  Trash2,
  // UserCog,
  Power,
  Eye,
  // EyeOff,
} from "lucide-react";
import { getAuthToken } from "@/utils/auth";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface SystemStats {
  users: {
    total: number;
    students: number;
    staff: number;
    admins: number;
    superadmins: number;
    recent: number;
  };
  complaints: {
    total: number;
    pending: number;
    resolved: number;
    today: number;
    this_week: number;
    this_month: number;
  };
  categories: number;
  statuses: number;
  system: {
    maintenance_mode: boolean;
    database_size: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  student_id?: string;
  department?: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "system">("overview");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSystemStats();
    fetchUsers();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}superadmin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.status) {
        setStats(data.data);
        setMaintenanceMode(data.data.system.maintenance_mode);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load system statistics");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}admin/users?per_page=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.status) {
        setUsers(data.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}superadmin/maintenance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !maintenanceMode,
          message: maintenanceMessage || "System is currently under maintenance. Please check back later.",
        }),
      });

      const data = await response.json();
      if (data.status) {
        setMaintenanceMode(!maintenanceMode);
        toast.success(data.message);
        setShowMaintenanceModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
      toast.error("Failed to toggle maintenance mode");
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}superadmin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (data.status) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const bulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to delete");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}superadmin/users/bulk-delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_ids: selectedUsers }),
      });

      const data = await response.json();
      if (data.status) {
        toast.success(data.message);
        setSelectedUsers([]);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete users");
    }
  };

  const exportData = async (type: "users" | "complaints" | "all") => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}superadmin/export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, format: "json" }),
      });

      const data = await response.json();
      if (data.status) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-export-${new Date().toISOString()}.json`;
        a.click();
        toast.success("Data exported successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            SuperAdmin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Complete system control and monitoring</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              maintenanceMode
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            <Power className="w-4 h-4" />
            {maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "users", label: "User Management", icon: Users },
            { id: "system", label: "System Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              icon={Users}
              color="blue"
              subtitle={`${stats.users.recent} new this week`}
            />
            <StatCard
              title="Total Complaints"
              value={stats.complaints.total}
              icon={MessageSquare}
              color="purple"
              subtitle={`${stats.complaints.today} today`}
            />
            <StatCard
              title="Pending"
              value={stats.complaints.pending}
              icon={Clock}
              color="yellow"
              subtitle="Awaiting response"
            />
            <StatCard
              title="Resolved"
              value={stats.complaints.resolved}
              icon={CheckCircle}
              color="green"
              subtitle={`${Math.round((stats.complaints.resolved / stats.complaints.total) * 100)}% resolution rate`}
            />
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.users.students}</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.users.staff}</div>
                <div className="text-sm text-gray-600">Staff</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.users.admins}</div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.users.superadmins}</div>
                <div className="text-sm text-gray-600">SuperAdmins</div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Maintenance Mode</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    maintenanceMode ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {maintenanceMode ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Database Size</span>
                <span className="font-medium text-gray-900">{stats.system.database_size}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Categories</span>
                <span className="font-medium text-gray-900">{stats.categories}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Statuses</span>
                <span className="font-medium text-gray-900">{stats.statuses}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedUsers.length > 0 && (
                <button
                  onClick={bulkDeleteUsers}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedUsers.length})
                </button>
              )}
            </div>
            <button
              onClick={() => exportData("users")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Users
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map((u) => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      checked={selectedUsers.length === users.length}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md"
                      >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">SuperAdmin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/dashboard/user/${user.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Data Export</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => exportData("users")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Users className="w-8 h-8 text-indigo-600 mb-2" />
                <div className="font-medium">Export Users</div>
                <div className="text-sm text-gray-500">Download all user data</div>
              </button>
              <button
                onClick={() => exportData("complaints")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <MessageSquare className="w-8 h-8 text-indigo-600 mb-2" />
                <div className="font-medium">Export Complaints</div>
                <div className="text-sm text-gray-500">Download all complaints</div>
              </button>
              <button
                onClick={() => exportData("all")}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Database className="w-8 h-8 text-indigo-600 mb-2" />
                <div className="font-medium">Export All Data</div>
                <div className="text-sm text-gray-500">Complete system backup</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {maintenanceMode ? "Disable" : "Enable"} Maintenance Mode
            </h3>
            <p className="text-gray-600 mb-4">
              {maintenanceMode
                ? "Users will be able to access the system again."
                : "This will prevent all users except superadmins from accessing the system."}
            </p>
            {!maintenanceMode && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="System is currently under maintenance..."
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={toggleMaintenanceMode}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  maintenanceMode ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "purple" | "yellow" | "green";
  subtitle: string;
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
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
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}