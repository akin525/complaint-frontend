import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Calendar,
    User,
    Tag,
    FileText,
    Download,
    Eye,
    EyeOff,
    Clock,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Paperclip,
    Image,
    FileIcon,
    Shield,
    Mail,
    GraduationCap,
    Building,
    Hash,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { getAuthToken } from '@/utils/auth';
import { useUser } from '@/context/UserContext';
import Sidebar from "@/components/Sidebar.tsx";
import DashboardHeader from "@/components/DashboardHeader.tsx";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface ComplaintUser {
    id: number;
    name: string;
    email: string;
    student_id: string;
    department: string;
}

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

interface ResponseUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface ComplaintResponse {
    id: number;
    complaint_id: number;
    user_id: number;
    response: string;
    attachments: string[] | null;
    is_private: boolean;
    created_at: string;
    updated_at: string;
    user: ResponseUser;
}

interface ComplaintDetails {
    id: number;
    user_id: number;
    category_id: number;
    status_id: number;
    subject: string;
    description: string;
    attachments: string[];
    is_anonymous: boolean;
    is_resolved: boolean;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    category: Category;
    status: Status;
    user: ComplaintUser;
    responses: ComplaintResponse[];
}

const ComplaintDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [complaint, setComplaint] = useState<ComplaintDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchComplaintDetails();
        }
    }, [id]);

    const fetchComplaintDetails = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const token = getAuthToken();
            const response = await fetch(`${baseUrl}complaints/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.status) {
                setComplaint(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch complaint details');
            }
        } catch (error: any) {
            console.error('Error fetching complaint details:', error);
            setError(error.message);
            toast.error(error.message || 'Failed to load complaint details');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchComplaintDetails(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
            return Image;
        }
        return FileIcon;
    };

    const downloadAttachment = async (attachmentPath: string) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}complaints/attachments/${attachmentPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = attachmentPath.split('/').pop() || 'attachment';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                throw new Error('Failed to download attachment');
            }
        } catch (error) {
            toast.error('Failed to download attachment');
        }
    };

    const getStatusBadge = (status: Status) => {
        return (
            <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                    backgroundColor: `${status.color}20`,
                    color: status.color,
                    border: `1px solid ${status.color}40`
                }}
            >
                <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                />
                {status.name}
            </span>
        );
    };

    if (isLoading) {
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading complaint details...</p>
                </div>
            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Failed to Load Complaint
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'The complaint you\'re looking for could not be found.'}
                    </p>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate('/complaints')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Back to Complaints
                        </button>
                        <button
                            onClick={() => fetchComplaintDetails()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const isOwner = currentUser?.id === complaint.user_id;

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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/complaints')}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Complaints
                        </button>

                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Complaint #{complaint.id}
                                </h1>
                                {complaint.is_anonymous && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        <EyeOff className="w-3 h-3 mr-1" />
                                        Anonymous
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl text-gray-700 mb-4">{complaint.subject}</h2>
                            <div className="flex items-center space-x-4">
                                {getStatusBadge(complaint.status)}
                                <span className="text-sm text-gray-500">
                                    Created {getRelativeTime(complaint.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Complaint Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <FileText className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                            </div>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {complaint.description}
                                </p>
                            </div>
                        </div>

                        {/* Attachments */}
                        {complaint.attachments && complaint.attachments.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Paperclip className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Attachments ({complaint.attachments.length})
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {complaint.attachments.map((attachment, index) => {
                                        const fileName = attachment.split('/').pop() || 'attachment';
                                        const FileIconComponent = getFileIcon(fileName);

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                                    <FileIconComponent className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Click to download
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => downloadAttachment(attachment)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Responses */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <MessageSquare className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Responses ({complaint.responses.length})
                                </h3>
                            </div>

                            {complaint.responses.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No responses yet</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Staff will respond to your complaint soon
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {complaint.responses.map((response) => (
                                        <div
                                            key={response.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Shield className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {response.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {response.user.role}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(response.created_at)}
                                                    </p>
                                                    {response.is_private && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Private
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-11">
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {response.response}
                                                </p>
                                                {response.attachments && response.attachments.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                                            Attachments:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {response.attachments.map((attachment, index) => (
                                                                <button
                                                                    key={index}
                                                                    onClick={() => downloadAttachment(attachment)}
                                                                    className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                                                                >
                                                                    <Paperclip className="w-3 h-3 mr-1" />
                                                                    {attachment.split('/').pop()}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Current Status</label>
                                    <div className="mt-1">
                                        {getStatusBadge(complaint.status)}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {complaint.status.description}
                                    </p>
                                </div>

                                {complaint.is_resolved && complaint.resolved_at && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2 text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Resolved</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatDate(complaint.resolved_at)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Complaint Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">ID</p>
                                        <p className="text-sm text-gray-900">#{complaint.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Tag className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Category</p>
                                        <p className="text-sm text-gray-900">{complaint.category.name}</p>
                                        <p className="text-xs text-gray-500">{complaint.category.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Created</p>
                                        <p className="text-sm text-gray-900">{formatDate(complaint.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Last Updated</p>
                                        <p className="text-sm text-gray-900">{formatDate(complaint.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submitter Info (only show if not anonymous or if user is owner) */}
                        {(!complaint.is_anonymous || isOwner) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {complaint.is_anonymous ? 'Your Information' : 'Submitted By'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Name</p>
                                            <p className="text-sm text-gray-900">{complaint.user.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Email</p>
                                            <p className="text-sm text-gray-900">{complaint.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <GraduationCap className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Student ID</p>
                                            <p className="text-sm text-gray-900">{complaint.user.student_id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Building className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Department</p>
                                            <p className="text-sm text-gray-900">{complaint.user.department}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {isOwner && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate(`/complaints/${complaint.id}/edit`)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Edit Complaint</span>
                                    </button>

                                    <button
                                        onClick={() => window.print()}
                                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Print Details</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ComplaintDetailsPage;
