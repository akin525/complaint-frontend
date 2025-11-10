import { JSX, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
    X,
    LayoutDashboard,
    MessageSquare,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    User,
    Settings,
    HelpCircle,
    LogOut,
    GraduationCap,
    Bell,
    Search,
    Plus,
    Users,
    Shield,
    Tag,
    Activity,
    FileBarChart,
    UserCheck,
    Database
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getAuthToken } from "@/utils/auth";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function Sidebar({
                                    isOpen,
                                    onClose,
                                }: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(isOpen);
    const [stats, setStats] = useState({
        pendingComplaints: 0,
        unreadNotifications: 0,
        inProgressComplaints: 0,
        resolvedComplaints: 0
    });
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        setSidebarOpen(isOpen);
    }, [isOpen]);

    useEffect(() => {
        if (user) {
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}complaints?status=pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Update stats based on response
                setStats(prev => ({
                    ...prev,
                    pendingComplaints: data.data?.length || 0
                }));
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = async () => {
        try {
            const token = getAuthToken();
            await fetch(`${baseUrl}logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // removeAuthToken();
            // logout();
            navigate('/login');
            toast.success('Logged out successfully');
        }
    };

    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff' || user?.role === 'admin';
    const isStudent = user?.role === 'student';

    // Role-based navigation items
    const getNavigationSections = () => {
        const sections = [];

        // Dashboard section - available to all authenticated users
        sections.push({
            title: "Dashboard",
            items: [
                {
                    to: "/dashboard",
                    icon: <LayoutDashboard size={20} />,
                    label: "Overview",
                    show: true
                },
                // {
                //     to: "/analytics",
                //     icon: <BarChart3 size={20} />,
                //     label: "Analytics",
                //     show: isStaff // Only staff and admin can see analytics
                // }
            ]
        });

        // Complaints section - different views based on role
        if (isStudent) {
            sections.push({
                title: "My Complaints",
                items: [
                    {
                        to: "/complaints",
                        icon: <FileText size={20} />,
                        label: "All Complaints",
                        show: true
                    },
                    {
                        to: "/complaints?status=pending",
                        icon: <Clock size={20} />,
                        label: "Pending Review",
                        badge: stats.pendingComplaints,
                        show: true
                    },
                    {
                        to: "/complaints?status=in-progress",
                        icon: <AlertTriangle size={20} />,
                        label: "In Progress",
                        badge: stats.inProgressComplaints,
                        show: true
                    },
                    {
                        to: "/complaints?status=resolved",
                        icon: <CheckCircle size={20} />,
                        label: "Resolved",
                        show: true
                    }
                ]
            });
        } else if (isStaff) {
            sections.push({
                title: "Complaint Management",
                items: [
                    {
                        to: "/complaints",
                        icon: <FileText size={20} />,
                        label: "All Complaints",
                        show: true
                    },
                    {
                        to: "/complaints?status=new",
                        icon: <Clock size={20} />,
                        label: "New Complaints",
                        badge: stats.pendingComplaints,
                        show: true
                    },
                    {
                        to: "/complaints?status=assigned",
                        icon: <UserCheck size={20} />,
                        label: "Assigned to Me",
                        show: true
                    },
                    {
                        to: "/staff/complaints?status=in-progress",
                        icon: <AlertTriangle size={20} />,
                        label: "In Progress",
                        show: true
                    },
                    {
                        to: "/staff/complaints?status=resolved",
                        icon: <CheckCircle size={20} />,
                        label: "Resolved",
                        show: true
                    }
                ]
            });
        }

        // Admin-specific sections
        if (isAdmin) {
            sections.push({
                title: "Administration",
                items: [
                    {
                        to: "/admin/dashboard",
                        icon: <Shield size={20} />,
                        label: "Admin Dashboard",
                        show: true
                    },
                    {
                        to: "/admin/users",
                        icon: <Users size={20} />,
                        label: "User Management",
                        show: true
                    },
                    {
                        to: "/admin/reports",
                        icon: <FileBarChart size={20} />,
                        label: "Reports",
                        show: true
                    }
                ]
            });

            sections.push({
                title: "System Management",
                items: [
                    {
                        to: "/admin/categories",
                        icon: <Tag size={20} />,
                        label: "Categories",
                        show: true
                    },
                    {
                        to: "/admin/statuses",
                        icon: <Activity size={20} />,
                        label: "Status Management",
                        show: true
                    },
                    {
                        to: "/admin/system",
                        icon: <Database size={20} />,
                        label: "System Settings",
                        show: true
                    }
                ]
            });
        }

        // Communication section
        sections.push({
            title: "Communication",
            items: [
                {
                    to: "/messages",
                    icon: <MessageSquare size={20} />,
                    label: "Messages",
                    show: true
                },
                {
                    to: "/notifications",
                    icon: <Bell size={20} />,
                    label: "Notifications",
                    badge: stats.unreadNotifications,
                    show: true
                }
            ]
        });

        // Tools section
        sections.push({
            title: "Tools",
            items: [
                {
                    to: "/search",
                    icon: <Search size={20} />,
                    label: "Search",
                    show: true
                },
                {
                    to: "/help",
                    icon: <HelpCircle size={20} />,
                    label: "Help & FAQ",
                    show: true
                }
            ]
        });

        // Account section
        sections.push({
            title: "Account",
            items: [
                {
                    to: "/profile",
                    icon: <User size={20} />,
                    label: "My Profile",
                    show: true
                },
                {
                    to: "/settings",
                    icon: <Settings size={20} />,
                    label: "Settings",
                    show: true
                }
            ]
        });

        return sections.filter(section =>
            section.items.some(item => item.show)
        );
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrator';
            case 'staff': return 'Staff Member';
            case 'student': return 'Student';
            default: return 'User';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'from-red-400 to-pink-400';
            case 'staff': return 'from-green-400 to-blue-400';
            case 'student': return 'from-blue-400 to-purple-400';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    return (
        <>
            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 lg:static`}
            >
                {/* Scrollable Container */}
                <div className="flex flex-col h-full overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">

                    {/* Header */}
                    <div className="px-6 py-6 border-b border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/10 p-2 rounded-lg">
                                    <GraduationCap className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">University Portal</h1>
                                    <p className="text-indigo-200 text-sm">Student Complaints</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-white/70 hover:text-white lg:hidden transition-colors"
                                aria-label="Close sidebar"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* User Info Card */}
                        {user && (
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor(user.role)} rounded-full flex items-center justify-center`}>
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{user.name}</p>
                                        <p className="text-indigo-200 text-sm">
                                            {user.student_id ? `ID: ${user.student_id}` : getRoleDisplayName(user.role)}
                                        </p>
                                    </div>
                                    {isAdmin && (
                                        <Shield className="h-4 w-4 text-yellow-400" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    {isStudent && (
                        <div className="px-6 py-4 border-b border-white/10">
                            <Link
                                to="/complaints/create"
                                className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Submit New Complaint
                            </Link>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 px-6 py-4">
                        {getNavigationSections().map((section, index) => (
                            <Section
                                key={section.title}
                                title={section.title}
                                className={index > 0 ? "mt-8" : ""}
                            >
                                {section.items
                                    .filter(item => item.show)
                                    .map((item) => (
                                        <SidebarLink
                                            key={item.to}
                                            to={item.to}
                                            icon={item.icon}
                                            badge={item.badge}
                                            isActive={
                                                location.pathname === item.to ||
                                                (item.to.includes('?') && location.pathname === item.to.split('?')[0] && location.search === '?' + item.to.split('?')[1])
                                            }
                                        >
                                            {item.label}
                                        </SidebarLink>
                                    ))
                                }
                            </Section>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-white/10 p-6">
                        {/* Status Indicator */}
                        <div className="bg-white/10 rounded-lg p-4 mb-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white text-sm font-medium">System Status</p>
                                    <div className="flex items-center mt-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                        <span className="text-green-300 text-xs">All systems operational</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium text-red-300 hover:text-red-200 hover:bg-red-500/20"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-red-500/20 text-red-300">
                                    <LogOut size={20} />
                                </div>
                                <span className="font-medium">Sign Out</span>
                            </div>
                        </button>

                        {/* Version Info */}
                        <div className="mt-4 text-center">
                            <p className="text-white/50 text-xs">Version 2.1.0</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

function SidebarLink({
                         to,
                         icon,
                         children,
                         badge,
                         isActive = false,
                         className = "",
                     }: {
    to: string;
    icon: JSX.Element;
    children: React.ReactNode;
    badge?: number;
    isActive?: boolean;
    className?: string;
}) {
    const baseClasses = "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium group";
    const activeClasses = isActive
        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
        : "text-white/80 hover:text-white hover:bg-white/10";

    return (
        <Link
            to={to}
            className={`${baseClasses} ${activeClasses} ${className}`}
        >
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                    isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white"
                }`}>
                    {icon}
                </div>
                <span className="font-medium">{children}</span>
            </div>
            {badge && badge > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center animate-pulse">
                    {badge > 99 ? '99+' : badge}
                </div>
            )}
        </Link>
    );
}

function Section({
                     title,
                     children,
                     className = "",
                 }: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <h4 className="text-xs font-semibold uppercase text-white/60 tracking-wider mb-4 px-4 select-none">
                {title}
            </h4>
            <div className="space-y-1">{children}</div>
        </div>
    );
}
