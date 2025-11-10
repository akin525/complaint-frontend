import React, { useState, useEffect, useCallback } from 'react';
import { Link,  useSearchParams } from 'react-router';
import { toast } from 'react-toastify';
import {
    Plus,
    Search,
    Filter,
    RefreshCw,
    Eye,
    MessageSquare,
    Calendar,
    User,
    Tag,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Archive,
    Flag,
    Download,
    Grid,
    List,
    SortAsc,
    SortDesc,
    X,
    // Loader
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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ComplaintsResponse {
    current_page: number;
    data: Complaint[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Filters {
    category_id: string;
    status_id: string;
    is_resolved: string;
    search: string;
    sort_field: string;
    sort_direction: string;
    per_page: string;
}

const ComplaintsListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    // const navigate = useNavigate();
    const { user } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [complaints, setComplaints] = useState<ComplaintsResponse | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedComplaints, setSelectedComplaints] = useState<number[]>([]);

    const [filters, setFilters] = useState<Filters>({
        category_id: searchParams.get('category_id') || '',
        status_id: searchParams.get('status_id') || '',
        is_resolved: searchParams.get('is_resolved') || '',
        search: searchParams.get('search') || '',
        sort_field: searchParams.get('sort_field') || 'created_at',
        sort_direction: searchParams.get('sort_direction') || 'desc',
        per_page: searchParams.get('per_page') || '10'
    });

    const isStaff = user?.role === 'staff' || user?.role === 'admin';
    const canCreateComplaint = true; // All users can create complaints
    const canManageComplaints = isStaff;

    // Fetch complaints with current filters
    const fetchComplaints = useCallback(async (page = 1, showLoader = true) => {
        try {
            if (showLoader) setIsLoading(true);
            else setIsRefreshing(true);

            const token = getAuthToken();
            const params = new URLSearchParams();

            // Add filters to params
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            params.append('page', page.toString());

            const response = await fetch(`${baseUrl}complaints?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'Failed to fetch complaints');
            }

            setComplaints(data.data);

        } catch (error: any) {
            console.error('Error fetching complaints:', error);
            toast.error(error.message || 'Failed to load complaints');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [filters]);

    // Fetch categories and statuses
    const fetchMetadata = async () => {
        try {
            const token = getAuthToken();

            const [categoriesRes, statusesRes] = await Promise.all([
                fetch(`${baseUrl}categories`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${baseUrl}statuses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                if (categoriesData.status) {
                    setCategories(categoriesData.data || []);
                }
            }

            if (statusesRes.ok) {
                const statusesData = await statusesRes.json();
                if (statusesData.status) {
                    setStatuses(statusesData.data || []);
                }
            }

        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    // Update URL params when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'created_at' && value !== 'desc' && value !== '10') {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    }, [filters, setSearchParams]);

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            category_id: '',
            status_id: '',
            is_resolved: '',
            search: '',
            sort_field: 'created_at',
            sort_direction: 'desc',
            per_page: '10'
        });
    };

    const handleSort = (field: string) => {
        const direction = filters.sort_field === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';
        setFilters(prev => ({
            ...prev,
            sort_field: field,
            sort_direction: direction
        }));
    };

    const handlePageChange = (page: number) => {
        fetchComplaints(page, false);
    };

    const handleComplaintSelect = (complaintId: number) => {
        setSelectedComplaints(prev =>
            prev.includes(complaintId)
                ? prev.filter(id => id !== complaintId)
                : [...prev, complaintId]
        );
    };

    const handleSelectAll = () => {
        if (selectedComplaints.length === complaints?.data.length) {
            setSelectedComplaints([]);
        } else {
            setSelectedComplaints(complaints?.data.map(c => c.id) || []);
        }
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

    const getStatusColor = (status: Status) => {
        return {
            backgroundColor: `${status.color}20`,
            color: status.color,
            borderColor: `${status.color}40`
        };
    };

    const getPriorityIcon = (complaint: Complaint) => {
        if (complaint.is_resolved) return CheckCircle;
        if (complaint.status.name.toLowerCase().includes('urgent')) return AlertCircle;
        return Clock;
    };

    const renderComplaintCard = (complaint: Complaint) => {
        const PriorityIcon = getPriorityIcon(complaint);

        return (
            <div
                key={complaint.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
            >
                {/* Card Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            {canManageComplaints && (
                                <input
                                    type="checkbox"
                                    checked={selectedComplaints.includes(complaint.id)}
                                    onChange={() => handleComplaintSelect(complaint.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            )}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">
                                    #{complaint.id}
                                </span>
                                <PriorityIcon className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                style={getStatusColor(complaint.status)}
                            >
                                {complaint.status.name}
                            </span>
                            <div className="relative">
                                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <Link
                        to={`/complaints/${complaint.id}`}
                        className="block group-hover:text-blue-600 transition-colors"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {complaint.subject}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {complaint.description}
                        </p>
                    </Link>

                    <div className="flex items-center justify-between text-sm text-gray-500">
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
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {!complaint.is_anonymous && complaint.user && (
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
                            )}
                            {complaint.is_anonymous && (
                                <span className="text-sm text-gray-500 italic">
                                    Anonymous
                                </span>
                            )}
                        </div>
                        <Link
                            to={`/complaints/${complaint.id}`}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    const renderComplaintRow = (complaint: Complaint) => {
        const PriorityIcon = getPriorityIcon(complaint);

        return (
            <tr
                key={complaint.id}
                className="hover:bg-gray-50 transition-colors"
            >
                {canManageComplaints && (
                    <td className="px-6 py-4">
                        <input
                            type="checkbox"
                            checked={selectedComplaints.includes(complaint.id)}
                            onChange={() => handleComplaintSelect(complaint.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </td>
                )}
                <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                            #{complaint.id}
                        </span>
                        <PriorityIcon className="w-4 h-4 text-gray-400" />
                    </div>
                </td>
                <td className="px-6 py-4">
                    <Link
                        to={`/complaints/${complaint.id}`}
                        className="block hover:text-blue-600 transition-colors"
                    >
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {complaint.subject}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                            {complaint.description}
                        </div>
                    </Link>
                </td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {complaint.category.name}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={getStatusColor(complaint.status)}
                    >
                        {complaint.status.name}
                    </span>
                </td>
                <td className="px-6 py-4">
                    {!complaint.is_anonymous && complaint.user ? (
                        <div>
                            <div className="text-sm text-gray-900">
                                {complaint.user.name}
                            </div>
                            {complaint.user.department && (
                                <div className="text-xs text-gray-500">
                                    {complaint.user.department}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500 italic">
                            Anonymous
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(complaint.created_at)}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <Link
                            to={`/complaints/${complaint.id}`}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                        {canManageComplaints && (
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    const renderPagination = () => {
        if (!complaints || complaints.last_page <= 1) return null;

        return (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                    Showing {complaints.from} to {complaints.to} of {complaints.total} results
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(complaints.current_page - 1)}
                        disabled={!complaints.prev_page_url}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {complaints.links
                        .filter(link => link.label !== '« Previous' && link.label !== 'Next »')
                        .map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && handlePageChange(parseInt(link.label))}
                                className={`px-3 py-1 text-sm rounded ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {link.label}
                            </button>
                        ))}

                    <button
                        onClick={() => handlePageChange(complaints.current_page + 1)}
                        disabled={!complaints.next_page_url}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading complaints...</p>
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
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Complaints
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        {complaints ? `${complaints.total} total complaints` : 'Manage and track complaints'}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => fetchComplaints(complaints?.current_page || 1, false)}
                                        disabled={isRefreshing}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                    {canCreateComplaint && (
                                        <Link
                                            to="/complaints/create"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            New Complaint
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Filters and Controls */}
                        <div className="bg-white rounded-xl border border-gray-200 mb-6">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                    {/* Search */}
                                    <div className="flex-1 max-w-md">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search complaints..."
                                                value={filters.search}
                                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className={`inline-flex items-center px-3 py-2 border rounded-lg transition-colors ${
                                                showFilters
                                                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filters
                                        </button>

                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-2 ${
                                                    viewMode === 'list'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2 ${
                                                    viewMode === 'grid'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                <Grid className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Filters */}
                                {showFilters && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Category
                                                </label>
                                                <select
                                                    value={filters.category_id}
                                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">All Categories</option>
                                                    {categories.map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    value={filters.status_id}
                                                    onChange={(e) => handleFilterChange('status_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">All Statuses</option>
                                                    {statuses.map(status => (
                                                        <option key={status.id} value={status.id}>
                                                            {status.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Resolution
                                                </label>
                                                <select
                                                    value={filters.is_resolved}
                                                    onChange={(e) => handleFilterChange('is_resolved', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">All</option>
                                                    <option value="false">Open</option>
                                                    <option value="true">Resolved</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Per Page
                                                </label>
                                                <select
                                                    value={filters.per_page}
                                                    onChange={(e) => handleFilterChange('per_page', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="10">10</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Sort by:
                                                    </label>
                                                    <select
                                                        value={filters.sort_field}
                                                        onChange={(e) => handleFilterChange('sort_field', e.target.value)}
                                                        className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                                                    >
                                                        <option value="created_at">Date Created</option>
                                                        <option value="updated_at">Last Updated</option>
                                                        <option value="subject">Subject</option>
                                                        <option value="status_id">Status</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleSort(filters.sort_field)}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {filters.sort_direction === 'asc' ? (
                                                            <SortAsc className="w-4 h-4" />
                                                        ) : (
                                                            <SortDesc className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={clearFilters}
                                                className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bulk Actions */}
                            {canManageComplaints && selectedComplaints.length > 0 && (
                                <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-700">
                                            {selectedComplaints.length} complaint{selectedComplaints.length !== 1 ? 's' : ''} selected
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <button className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                                <Archive className="w-4 h-4 mr-1" />
                                                Archive
                                            </button>
                                            <button className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                                <Flag className="w-4 h-4 mr-1" />
                                                Flag
                                            </button>
                                            <button className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                                <Download className="w-4 h-4 mr-1" />
                                                Export
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        {complaints && complaints.data.length > 0 ? (
                            <>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {complaints.data.map(renderComplaintCard)}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    {canManageComplaints && (
                                                        <th className="px-6 py-3 text-left">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedComplaints.length === complaints.data.length}
                                                                onChange={handleSelectAll}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                        </th>
                                                    )}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <button
                                                            onClick={() => handleSort('id')}
                                                            className="flex items-center space-x-1 hover:text-gray-700"
                                                        >
                                                            <span>ID</span>
                                                            {filters.sort_field === 'id' && (
                                                                filters.sort_direction === 'asc' ? (
                                                                    <SortAsc className="w-3 h-3" />
                                                                ) : (
                                                                    <SortDesc className="w-3 h-3" />
                                                                )
                                                            )}
                                                        </button>
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <button
                                                            onClick={() => handleSort('subject')}
                                                            className="flex items-center space-x-1 hover:text-gray-700"
                                                        >
                                                            <span>Subject</span>
                                                            {filters.sort_field === 'subject' && (
                                                                filters.sort_direction === 'asc' ? (
                                                                    <SortAsc className="w-3 h-3" />
                                                                ) : (
                                                                    <SortDesc className="w-3 h-3" />
                                                                )
                                                            )}
                                                        </button>
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Category
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <button
                                                            onClick={() => handleSort('status_id')}
                                                            className="flex items-center space-x-1 hover:text-gray-700"
                                                        >
                                                            <span>Status</span>
                                                            {filters.sort_field === 'status_id' && (
                                                                filters.sort_direction === 'asc' ? (
                                                                    <SortAsc className="w-3 h-3" />
                                                                ) : (
                                                                    <SortDesc className="w-3 h-3" />
                                                                )
                                                            )}
                                                        </button>
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Submitted By
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <button
                                                            onClick={() => handleSort('created_at')}
                                                            className="flex items-center space-x-1 hover:text-gray-700"
                                                        >
                                                            <span>Created</span>
                                                            {filters.sort_field === 'created_at' && (
                                                                filters.sort_direction === 'asc' ? (
                                                                    <SortAsc className="w-3 h-3" />
                                                                ) : (
                                                                    <SortDesc className="w-3 h-3" />
                                                                )
                                                            )}
                                                        </button>
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {complaints.data.map(renderComplaintRow)}
                                                </tbody>
                                            </table>
                                        </div>
                                        {renderPagination()}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No complaints found
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {Object.values(filters).some(value => value && value !== 'created_at' && value !== 'desc' && value !== '10')
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by creating your first complaint.'
                                    }
                                </p>
                                <div className="flex items-center justify-center space-x-3">
                                    {Object.values(filters).some(value => value && value !== 'created_at' && value !== 'desc' && value !== '10') && (
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Clear Filters
                                        </button>
                                    )}
                                    {canCreateComplaint && (
                                        <Link
                                            to="/complaints/create"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Complaint
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        {complaints && complaints.data.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {complaints.total}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Pending</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {complaints.data.filter(c => !c.is_resolved).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Resolved</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {complaints.data.filter(c => c.is_resolved).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <User className="w-4 h-4 text-purple-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Anonymous</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {complaints.data.filter(c => c.is_anonymous).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ComplaintsListPage;


