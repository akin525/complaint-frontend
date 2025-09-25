// src/pages/complaints/ComplaintResponsePage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Send,
    Paperclip,
    X,
    Eye,
    EyeOff,
    MessageSquare,
    Clock,
    User,
    Shield,
    FileText,
    Download,
    Image as ImageIcon,
    File,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Plus,
    Trash2
} from 'lucide-react';
import { getAuthToken } from '@/utils/auth';
import { useUser } from '@/context/UserContext';
import Sidebar from "@/components/Sidebar.tsx";
import DashboardHeader from "@/components/DashboardHeader.tsx";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: string;
}

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Attachment {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: string;
}

interface Response {
    id: number;
    complaint_id: number;
    user_id: number;
    response: string;
    attachments: string[] | Attachment[];
    is_private: boolean;
    created_at: string;
    updated_at: string;
    user: User;
}

interface Complaint {
    id: number;
    subject: string;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category_id: number;
    user_id: number;
    assigned_to?: number;
    is_anonymous: boolean;
    created_at: string;
    updated_at: string;
    resolved_at?: string;
    category: Category;
    user?: User;
    assigned_user?: User;
    attachments?: Attachment[];
    responses?: Response[];
}

const ComplaintResponsePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [responses, setResponses] = useState<Response[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Form state
    const [responseText, setResponseText] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const isStaff = user?.role === 'staff' || user?.role === 'admin';
    const canRespond = isStaff || (complaint && complaint.user_id === user?.id);

    // Fetch complaint details and responses
    const fetchComplaintDetails = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setIsLoading(true);
            else setIsRefreshing(true);

            const token = getAuthToken();
            const response = await fetch(`${baseUrl}complaints/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaint details');
            }

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'Failed to fetch complaint details');
            }

            setComplaint(data.data);
            setResponses(data.data.responses || []);

        } catch (error: any) {
            console.error('Error fetching complaint details:', error);
            toast.error(error.message || 'Failed to load complaint details');
            navigate('/complaints');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            fetchComplaintDetails();
        }
    }, [fetchComplaintDetails, id]);

    // Handle file selection
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files).filter(file => {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        setAttachments(prev => [...prev, ...newFiles]);
    };

    // Handle drag and drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileSelect(e.dataTransfer.files);
    };

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Submit response
    const handleSubmitResponse = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!responseText.trim()) {
            toast.error('Please enter a response message');
            return;
        }

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('response', responseText.trim());
            formData.append('is_private', isPrivate.toString());

            attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const token = getAuthToken();
            const response = await fetch(`${baseUrl}complaints/${id}/responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to submit response');
            }

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'Failed to submit response');
            }

            toast.success('Response submitted successfully');

            // Reset form
            setResponseText('');
            setIsPrivate(false);
            setAttachments([]);

            // Refresh responses
            fetchComplaintDetails(false);

        } catch (error: any) {
            console.error('Error submitting response:', error);
            toast.error(error.message || 'Failed to submit response');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get file icon
    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return <ImageIcon className="w-4 h-4" />;
        }
        return <File className="w-4 h-4" />;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'closed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading complaint details...</p>
                </div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Complaint Not Found</h2>
                    <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist or you don't have permission to view it.</p>
                    <Link
                        to="/complaints"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Complaints
                    </Link>
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
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/complaints"
                                    className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Complaints
                                </Link>
                                <div className="h-6 border-l border-gray-300" />
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Complaint #{complaint.id}
                                </h1>
                            </div>
                            <button
                                onClick={() => fetchComplaintDetails(false)}
                                disabled={isRefreshing}
                                className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {/* Complaint Details */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                            {complaint.subject}
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            {complaint.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                                            {complaint.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                                            {complaint.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <span className="font-medium text-gray-500 w-24">Category:</span>
                                            <span className="text-gray-900">{complaint.category.name}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <span className="font-medium text-gray-500 w-24">Created:</span>
                                            <span className="text-gray-900">{formatDate(complaint.created_at)}</span>
                                        </div>
                                        {complaint.resolved_at && (
                                            <div className="flex items-center text-sm">
                                                <span className="font-medium text-gray-500 w-24">Resolved:</span>
                                                <span className="text-gray-900">{formatDate(complaint.resolved_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <span className="font-medium text-gray-500 w-24">Submitted by:</span>
                                            <span className="text-gray-900">
                                                {complaint.is_anonymous ? 'Anonymous' : complaint.user?.name || 'Unknown'}
                                            </span>
                                        </div>
                                        {complaint.assigned_user && (
                                            <div className="flex items-center text-sm">
                                                <span className="font-medium text-gray-500 w-24">Assigned to:</span>
                                                <span className="text-gray-900">{complaint.assigned_user.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Complaint Attachments */}
                                {complaint.attachments && complaint.attachments.length > 0 && (
                                    <div className="pt-4 border-t border-gray-200 mt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {complaint.attachments.map((attachment, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex-shrink-0 mr-3">
                                                        {getFileIcon(attachment.mime_type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {attachment.original_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={`${baseUrl}storage/${attachment.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Responses Section */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2" />
                                        Responses ({responses.length})
                                    </h3>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {responses.length > 0 ? (
                                    responses.map((response) => (
                                        <div key={response.id} className="p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {response.user.name}
                                                            </p>
                                                            <span className="text-xs text-gray-500">
                                                                {response.user.role}
                                                            </span>
                                                            {response.is_private && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                                                    <Shield className="w-3 h-3 mr-1" />
                                                                    Private
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {formatDate(response.created_at)}
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-700 leading-relaxed mb-3">
                                                        {response.response}
                                                    </div>

                                                    {/* Response Attachments */}
                                                    {response.attachments && response.attachments.length > 0 && (
                                                        <div className="mt-3">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {response.attachments.map((attachment, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="flex items-center p-2 bg-gray-50 rounded border border-gray-200"
                                                                    >
                                                                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                                                        <span className="text-sm text-gray-700 flex-1 truncate">
                                                                            {typeof attachment === 'string'
                                                                                ? attachment.split('/').pop()
                                                                                : attachment.original_name
                                                                            }
                                                                        </span>
                                                                        <a
                                                                            href={typeof attachment === 'string'
                                                                                ? `${baseUrl}storage/${attachment}`
                                                                                : `${baseUrl}storage/${attachment.file_path}`
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                                        >
                                                                            <Download className="w-3 h-3" />
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h4>
                                        <p className="text-gray-500">
                                            Be the first to respond to this complaint.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Response Form */}
                        {canRespond && complaint.status !== 'closed' && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add Response
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmitResponse} className="p-6">
                                    <div className="space-y-6">
                                        {/* Response Text */}
                                        <div>
                                            <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                                                Response Message *
                                            </label>
                                            <textarea
                                                id="response"
                                                rows={4}
                                                value={responseText}
                                                onChange={(e) => setResponseText(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                placeholder="Enter your response..."
                                                required
                                            />
                                        </div>

                                        {/* Privacy Toggle */}
                                        {isStaff && (
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="is_private"
                                                    checked={isPrivate}
                                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
                                                    <div className="flex items-center">
                                                        <Shield className="w-4 h-4 mr-1" />
                                                        Private response (only visible to staff)
                                                    </div>
                                                </label>
                                            </div>
                                        )}

                                        {/* File Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Attachments
                                            </label>
                                            <div
                                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                                    dragActive
                                                        ? 'border-blue-400 bg-blue-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                            >
                                                <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Drag and drop files here, or{' '}
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        browse
                                                    </button>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Maximum file size: 10MB
                                                </p>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => handleFileSelect(e.target.files)}
                                                    className="hidden"
                                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                                />
                                            </div>

                                            {/* Selected Files */}
                                            {attachments.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {attachments.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                {getFileIcon(file.type)}
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAttachment(index)}
                                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setResponseText('');
                                                    setIsPrivate(false);
                                                    setAttachments([]);
                                                }}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Clear
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !responseText.trim()}
                                                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Closed Complaint Notice */}
                        {complaint.status === 'closed' && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    This complaint has been closed
                                </h3>
                                <p className="text-gray-600">
                                    No new responses can be added to closed complaints.
                                </p>
                            </div>
                        )}

                        {/* No Permission Notice */}
                        {!canRespond && complaint.status !== 'closed' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                                <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Access Restricted
                                </h3>
                                <p className="text-gray-600">
                                    You don't have permission to respond to this complaint.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ComplaintResponsePage;

