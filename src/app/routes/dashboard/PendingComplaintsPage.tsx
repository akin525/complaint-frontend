// src/pages/complaints/PendingComplaintsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'react-toastify';
import {
    Plus,
    Search,
    Filter,
    RefreshCw,
    Eye,
    Clock,
    Calendar,
    User,
    Tag,
    FileText,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    AlertCircle,
    MessageSquare,
    Grid,
    List,
    SortAsc,
    SortDesc,
    X,
    Loader,
    UserCheck,
    Send,
    Flag
} from 'lucide-react';
import { getAuthToken } from '@/utils/auth';
import { useUser } from '@/context/UserContext';
import Sidebar from "@/components/Sidebar.tsx";
import DashboardHeader from "@/components/DashboardHeader.tsx";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface Category {
    id: number;
    name: string;
    description: string;
}

interface Status {
    id: number;
    name: string;
    description: string;
    color: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    student_id?: string;
    department?: string;
}

interface Complaint {
    id: number;
    user_id: number;
    category_id: number;
    status_id: number;
    subject: string;
    description: string;
    attachments: string[] | null;
    is_anonymous: boolean;
    is_resolved: boolean;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    category: Category;
    status: Status;
    user?: User;
}

interface ComplaintsResponse {
    current_page: number;
    data: Complaint[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

const PendingComplaintsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [complaints, setComplaints] = useState<ComplaintsResponse | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedComplaints, setSelectedComplaints] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
    const [sortField, setSortField] = useState(searchParams.get('sort') || 'created_at');
    const [sortDirection, setSortDirection] = useState(searchParams.get('direction') || 'desc');

    const isStaff = user?.role === 'staff' || user?.role === 'admin';

    // Fetch pending complaints
    const fetchPendingComplaints = useCallback(async (page = 1, showLoader = true) => {
        try {
            if (showLoader) setIsLoading(true);
            else setIsRefreshing(true);

            const token = getAuthToken();
            const params = new URLSearchParams();

            // Filter for pending status
            params.append('status', 'pending');
            params.append('page', page.toString());

            if (searchTerm) params.append('search', searchTerm);
            if (categoryFilter) params.append('category_id', categoryFilter);
            if (sortField) params.append('sort_field', sortField);
            if (sortDirection) params.append('sort_direction', sortDirection);

            const response = await fetch(`${baseUrl}complaints?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending complaints');
            }

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'Failed to fetch pending complaints');
            }

            setComplaints(data.data);

        } catch (error: any) {
            console.error('Error fetching pending complaints:', error);
            toast.error(error.message || 'Failed to load pending complaints');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [searchTerm, categoryFilter, sortField, sortDirection]);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    setCategories(data.data || []);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Assign complaint to staff member
    const assignComplaint = async (complaintId: number) => {
        if (!isStaff) return;

        try {
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}complaints/${complaintId}/assign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ assigned_to: user?.id })
            });

            if (response.ok) {
                toast.success('Complaint assigned successfully');
                fetchPendingComplaints(complaints?.current_page || 1, false);
            } else {
                throw new Error('Failed to assign complaint');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign complaint');
        }
    };

    // Update complaint status
    const updateStatus = async (complaintId: number, statusId: number) => {
        if (!isStaff) return;

        try {
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}complaints/${complaintId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status_id: statusId })
            });

            if (response.ok) {
                toast.success('Status updated successfully');
                fetchPendingComplaints(complaints?.current_page || 1, false);
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchPendingComplaints();
    }, [fetchPendingComplaints]);

    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysAgo = (dateString: string) => {
        const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const renderComplaintCard = (complaint: Complaint) => {
        const daysAgo = getDaysAgo(complaint.created_at);
        const isUrgent = daysAgo > 3;

        return (
            <div
                key={complaint.id}
                className={`bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-200 overflow-hidden ${
                    isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
            >
                {/* Urgency Banner */}
                {isUrgent && (
                    <div className="bg-red-500 text-white px-4 py-2 text-sm font-medium flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Urgent: {daysAgo} days pending
                    </div>
                )}

                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">
                                    #{complaint.id}
                                </span>
                                <Clock className="w-4 h-4 text-orange-500" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                Pending Review
                            </span>
                        </div>
                    </div>

                    <Link
                        to={`/complaints/${complaint.id}`}
                        className="block hover:text-blue-600 transition-colors"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {complaint.subject}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {complaint.description}
                        </p>
                    </Link>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                                <Tag className="w-4 h-4 mr-1" />
                                {complaint.category.name}
                            </span>
                            {complaint.attachments && complaint.attachments.length > 0 && (
                                <span className="flex items-center">
                                    <FileText className="w-4 h-4 mr-1" />
                                    {complaint.attachments.length}
                                </span>
                            )}
                        </div>
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(complaint.created_at)}
                        </span>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            {!complaint.is_anonymous && complaint.user ? (
                                <>
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {complaint.user.name}
                                    </span>
                                    {complaint.user.department && (
                                        <span className="text-xs text-gray-500">
                                            • {complaint.user.department}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-sm text-gray-500 italic">
                                    Anonymous
                                </span>
                            )}
                        </div>
                        <span className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
                            {daysAgo} days ago
                        </span>
                    </div>

                    {/* Actions */}
                    {isStaff && (
                        <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => assignComplaint(complaint.id)}
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Assign to Me
                            </button>
                            <Link
                                to={`/complaints/${complaint.id}`}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Review
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading pending complaints...</p>
                </div>
            </div>
        );
    }

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
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            Pending Review
                                        </h1>
                                    </div>
                                    <p className="text-gray-600">
                                        {complaints ? `${complaints.total} complaints awaiting review` : 'Complaints that need immediate attention'}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => fetchPendingComplaints(complaints?.current_page || 1, false)}
                                        disabled={isRefreshing}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search pending complaints..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 ${
                                                viewMode === 'list'
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 ${
                                                viewMode === 'grid'
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        {complaints && complaints.data.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-orange-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total Pending</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {complaints.total}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Urgent (3+ days)</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {complaints.data.filter(c => getDaysAgo(c.created_at) > 3).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Today</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {complaints.data.filter(c => getDaysAgo(c.created_at) === 0).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {complaints && complaints.data.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {complaints.data.map(renderComplaintCard)}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-orange-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No pending complaints
                                </h3>
                                <p className="text-gray-500">
                                    Great! All complaints have been reviewed.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PendingComplaintsPage;
