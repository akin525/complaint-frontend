import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Calendar,
    User,
    Tag,
    Download,
    Eye,
    Clock,
    CheckCircle,
    MessageSquare,
    Paperclip,
    Shield,
    Mail,
    GraduationCap,
    Building,
    Hash,
    Send,
    Loader2,
    X,
    Upload
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

const ComplaintDetailsEnhanced: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser,  isStaff, isAdmin, isSuperAdmin } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [complaint, setComplaint] = useState<ComplaintDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [statuses, setStatuses] = useState<Status[]>([]);
    
    // Reply form state
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isPrivateReply, setIsPrivateReply] = useState(false);
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [submittingReply, setSubmittingReply] = useState(false);
    
    // Status update state
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchComplaintDetails();
        fetchStatuses();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
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
                toast.error(data.message || 'Failed to load complaint details');
                navigate('/complaints');
            }
        } catch (error) {
            console.error('Error fetching complaint:', error);
            toast.error('Failed to load complaint details');
            navigate('/complaints');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatuses = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}statuses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.status) {
                setStatuses(data.data);
            }
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const handleStatusChange = async (newStatusId: number) => {
        if (!complaint) return;

        setUpdatingStatus(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}complaints/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status_id: newStatusId
                }),
            });

            const data = await response.json();

            if (response.ok && data.status) {
                toast.success('Status updated successfully');
                fetchComplaintDetails();
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!replyText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setSubmittingReply(true);
        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('response', replyText);
            formData.append('is_private', isPrivateReply ? '1' : '0');
            
            replyFiles.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await fetch(`${baseUrl}complaints/${id}/responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.status) {
                toast.success('Response added successfully');
                setReplyText('');
                setIsPrivateReply(false);
                setReplyFiles([]);
                setShowReplyForm(false);
                fetchComplaintDetails();
            } else {
                toast.error(data.message || 'Failed to add response');
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
            toast.error('Failed to add response');
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setReplyFiles([...replyFiles, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setReplyFiles(replyFiles.filter((_, i) => i !== index));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: Status) => {
        return (
            <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                    backgroundColor: `${status.color}20`,
                    color: status.color
                }}
            >
                {status.name}
            </span>
        );
    };

    const canReply = isStaff() || isAdmin() || isSuperAdmin();
    const canUpdateStatus = isStaff() || isAdmin() || isSuperAdmin();
    const isOwner = currentUser?.id === complaint?.user_id;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Complaint not found</p>
                    <button
                        onClick={() => navigate('/complaints')}
                        className="mt-4 text-indigo-600 hover:text-indigo-700"
                    >
                        Back to Complaints
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
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/complaints')}
                                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Complaints
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Complaint Details</h1>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Complaint Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                {complaint.subject}
                                            </h2>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Hash className="w-4 h-4 mr-1" />
                                                    {complaint.id}
                                                </span>
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(complaint.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        {getStatusBadge(complaint.status)}
                                    </div>

                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {complaint.description}
                                        </p>
                                    </div>

                                    {complaint.attachments && complaint.attachments.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                                Attachments
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {complaint.attachments.map((attachment, index) => (
                                                    <a
                                                        key={index}
                                                        href={`${baseUrl.replace('/api/', '')}/storage/${attachment}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                                                    >
                                                        <Paperclip className="w-4 h-4 mr-2" />
                                                        {attachment.split('/').pop()}
                                                        <Download className="w-4 h-4 ml-2" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Responses Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <MessageSquare className="w-5 h-5 mr-2" />
                                            Responses ({complaint.responses.length})
                                        </h3>
                                        {canReply && !showReplyForm && (
                                            <button
                                                onClick={() => setShowReplyForm(true)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                Add Response
                                            </button>
                                        )}
                                    </div>

                                    {/* Reply Form */}
                                    {showReplyForm && canReply && (
                                        <form onSubmit={handleSubmitReply} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your response here..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                                rows={4}
                                                required
                                            />

                                            {/* File Upload */}
                                            <div className="mt-3">
                                                <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                                                    <Upload className="w-5 h-5 mr-2 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Attach files (optional)</span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                    />
                                                </label>
                                                {replyFiles.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        {replyFiles.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(index)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Private Response Toggle */}
                                            {(isAdmin() || isSuperAdmin()) && (
                                                <div className="mt-3 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="private-reply"
                                                        checked={isPrivateReply}
                                                        onChange={(e) => setIsPrivateReply(e.target.checked)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor="private-reply" className="ml-2 text-sm text-gray-700">
                                                        Private response (only visible to staff and admins)
                                                    </label>
                                                </div>
                                            )}

                                            <div className="mt-4 flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowReplyForm(false);
                                                        setReplyText('');
                                                        setReplyFiles([]);
                                                        setIsPrivateReply(false);
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                    disabled={submittingReply}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submittingReply}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                                                >
                                                    {submittingReply ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Submitting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4 mr-2" />
                                                            Submit Response
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Responses List */}
                                    {complaint.responses.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">No responses yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {complaint.responses.map((response) => (
                                                <div
                                                    key={response.id}
                                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                <Shield className="w-5 h-5 text-indigo-600" />
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
                                                    <div className="ml-13">
                                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {response.response}
                                                        </p>
                                                        {response.attachments && response.attachments.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                                    Attachments:
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {response.attachments.map((attachment, index) => (
                                                                        <a
                                                                            key={index}
                                                                            href={`${baseUrl.replace('/api/', '')}/storage/${attachment}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center px-3 py-1 bg-white hover:bg-gray-100 rounded-full text-sm text-gray-700 transition-colors border border-gray-200"
                                                                        >
                                                                            <Paperclip className="w-3 h-3 mr-1" />
                                                                            {attachment.split('/').pop()}
                                                                        </a>
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
                                        {canUpdateStatus ? (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                    Update Status
                                                </label>
                                                <select
                                                    value={complaint.status_id}
                                                    onChange={(e) => handleStatusChange(Number(e.target.value))}
                                                    disabled={updatingStatus}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    {statuses.map((status) => (
                                                        <option key={status.id} value={status.id}>
                                                            {status.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Current Status</label>
                                                <div className="mt-1">
                                                    {getStatusBadge(complaint.status)}
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            {complaint.status.description}
                                        </p>

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

                                {/* Submitter Info */}
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
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ComplaintDetailsEnhanced;