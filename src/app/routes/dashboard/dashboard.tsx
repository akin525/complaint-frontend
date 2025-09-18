import { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import DashboardHeader from "../../../components/DashboardHeader";
import { Link } from "react-router";
import {
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Plus,
    TrendingUp,
    Calendar,
    MessageSquare,
    Bell,
    Eye,
    ArrowRight
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import {getAuthToken} from "@/utils/auth.tsx";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
    });
    const { user } = useUser() as any;

    useEffect(() => {
        fetchComplaints();
        fetchStats();
    }, []);
    const token = getAuthToken();

    const fetchComplaints = async () => {
        try {
            const response = await fetch(`${baseUrl}complaint`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.status) {
                setComplaints(data.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to fetch complaints");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        // Mock stats calculation - replace with actual API call
        const mockStats = {
            total: 12,
            pending: 3,
            inProgress: 5,
            resolved: 4
        };
        setStats(mockStats);
    };

    const StatCard = ({
                          title,
                          value,
                          icon: Icon,
                          color = "text-gray-700",
                          bgColor = "bg-gray-50",
                          change,
                          changeType = "positive"
                      }: {
        title: string;
        value: string | number;
        icon: any;
        color?: string;
        bgColor?: string;
        change?: string;
        changeType?: "positive" | "negative" | "neutral";
    }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                {change && (
                    <div className={`flex items-center text-sm font-medium ${
                        changeType === 'positive' ? 'text-green-600' :
                            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {change}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <h4 className="text-sm font-medium text-gray-600">{title}</h4>
            </div>
        </div>
    );

    const ComplaintCard = ({ complaint }: { complaint: any }) => {
        const getStatusColor = (status: string) => {
            switch (status.toLowerCase()) {
                case 'new': return 'bg-blue-100 text-blue-800';
                case 'in progress': return 'bg-yellow-100 text-yellow-800';
                case 'resolved': return 'bg-green-100 text-green-800';
                case 'closed': return 'bg-gray-100 text-gray-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };

        const getCategoryIcon = (category: string) => {
            switch (category.toLowerCase()) {
                case 'it services': return '💻';
                case 'facilities': return '🏢';
                case 'academic': return '📚';
                case 'administrative': return '📋';
                default: return '📝';
            }
        };

        return (
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(complaint.category?.name || '')}</span>
                        <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                                {complaint.subject}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {complaint.category?.name} • #{complaint.id}
                            </p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status?.name || '')}`}>
                        {complaint.status?.name}
                    </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {complaint.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                    <Link
                        to={`/complaints/${complaint.id}`}
                        className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
        );
    };

    const QuickActionCard = ({
                                 title,
                                 description,
                                 icon: Icon,
                                 link,
                                 color = "indigo",
                                 onClick
                             }: {
        title: string;
        description: string;
        icon: any;
        link?: string;
        color?: string;
        onClick?: () => void;
    }) => {
        const colorClasses = {
            indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
            green: "bg-green-50 text-green-600 hover:bg-green-100",
            blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
            purple: "bg-purple-50 text-purple-600 hover:bg-purple-100"
        };

        const Component = link ? Link : 'button';
        const props = link ? { to: link } : { onClick };

        return (
            <Component
                {...props}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 text-left w-full"
            >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
            </Component>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Welcome Section */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Welcome back, {user?.name || 'Student'} 👋
                                    </h1>
                                    <p className="text-indigo-100 text-lg">
                                        Student ID: {user?.student_id} • {user?.department}
                                    </p>
                                    <p className="text-indigo-200 mt-2">
                                        Track and manage your complaints efficiently
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <Link
                                        to="/submit-complaint"
                                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        New Complaint
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Complaints"
                                value={stats.total}
                                icon={FileText}
                                color="text-indigo-600"
                                bgColor="bg-indigo-50"
                                change="+2 this month"
                                changeType="positive"
                            />
                            <StatCard
                                title="Pending Review"
                                value={stats.pending}
                                icon={Clock}
                                color="text-yellow-600"
                                bgColor="bg-yellow-50"
                                change="3 awaiting"
                                changeType="neutral"
                            />
                            <StatCard
                                title="In Progress"
                                value={stats.inProgress}
                                icon={AlertTriangle}
                                color="text-blue-600"
                                bgColor="bg-blue-50"
                                change="5 active"
                                changeType="positive"
                            />
                            <StatCard
                                title="Resolved"
                                value={stats.resolved}
                                icon={CheckCircle}
                                color="text-green-600"
                                bgColor="bg-green-50"
                                change="80% success rate"
                                changeType="positive"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <QuickActionCard
                                    title="Submit Complaint"
                                    description="File a new complaint or report an issue"
                                    icon={Plus}
                                    link="/submit-complaint"
                                    color="indigo"
                                />
                                <QuickActionCard
                                    title="View All Complaints"
                                    description="See all your submitted complaints"
                                    icon={Eye}
                                    link="/my-complaints"
                                    color="blue"
                                />
                                <QuickActionCard
                                    title="Check Messages"
                                    description="View responses and updates"
                                    icon={MessageSquare}
                                    link="/messages"
                                    color="green"
                                />
                                <QuickActionCard
                                    title="Help & FAQ"
                                    description="Get help and find answers"
                                    icon={Bell}
                                    link="/help"
                                    color="purple"
                                />
                            </div>
                        </div>

                        {/* Recent Complaints & Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Complaints */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900">Recent Complaints</h2>
                                        <Link
                                            to="/my-complaints"
                                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
                                        >
                                            View All
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>

                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-xl"></div>
                                            ))}
                                        </div>
                                    ) : complaints.length > 0 ? (
                                        <div className="space-y-4">
                                            {complaints.slice(0, 3).map((complaint) => (
                                                <ComplaintCard key={complaint.id} complaint={complaint} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
                                            <p className="text-gray-500 mb-4">Submit your first complaint to get started</p>
                                            <Link
                                                to="/submit-complaint"
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Submit Complaint
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity Feed */}
                            <div className="space-y-6">
                                {/* System Status */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Response Time</span>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                <span className="text-sm font-medium text-green-600">Good</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Average Resolution</span>
                                            <span className="text-sm font-medium text-gray-900">2-3 days</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Success Rate</span>
                                            <span className="text-sm font-medium text-gray-900">95%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm text-gray-600">Submitted</span>
                                            </div>
                                            <span className="text-lg font-semibold text-gray-900">2</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="text-sm text-gray-600">Resolved</span>
                                            </div>
                                            <span className="text-lg font-semibold text-gray-900">1</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center mr-3">
                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                </div>
                                                <span className="text-sm text-gray-600">Avg. Response</span>
                                            </div>
                                            <span className="text-lg font-semibold text-gray-900">4h</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Help Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Check our FAQ or contact support for assistance
                                    </p>
                                    <div className="space-y-2">
                                        <Link
                                            to="/help"
                                            className="block text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                        >
                                            View FAQ →
                                        </Link>
                                        <Link
                                            to="/contact-support"
                                            className="block text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                        >
                                            Contact Support →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
