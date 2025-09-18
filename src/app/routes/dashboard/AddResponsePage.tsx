import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Send,
    Upload,
    Image,
    FileIcon,
    Trash2,
    AlertCircle,
    Loader,
    MessageSquare,
    Shield,
    User,
    Clock,
    Lock,
    Globe
} from 'lucide-react';
import { getAuthToken } from '@/utils/auth';
import { useUser } from '@/context/UserContext';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface ComplaintData {
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
    category: {
        id: number;
        name: string;
        description: string;
    };
    status: {
        id: number;
        name: string;
        description: string;
        color: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface ResponseData {
    id: number;
    complaint_id: number;
    user_id: number;
    response: string;
    attachments: string[];
    is_private: boolean;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface FormData {
    response: string;
    is_private: boolean;
    attachments: File[];
}

const AddResponsePage: React.FC = () => {
    const { complaint_id } = useParams<{ complaint_id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();

    const [complaint, setComplaint] = useState<ComplaintData | null>(null);
    const [responses, setResponses] = useState<ResponseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        response: '',
        is_private: false,
        attachments: []
    });

    const isStaff = user?.role === 'staff' || user?.role === 'admin';
    const isOwner = user?.id === complaint?.user_id;
    const canRespond = isStaff || isOwner;

    useEffect(() => {
        if (complaint_id) {
            fetchComplaintData();
        }
    }, [complaint_id]);

    const fetchComplaintData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = getAuthToken();

            // Fetch complaint details
            const complaintResponse = await fetch(`${baseUrl}complaints/${complaint_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!complaintResponse.ok) {
                throw new Error('Failed to fetch complaint details');
            }

            const complaintData = await complaintResponse.json();

            if (!complaintData.status) {
                throw new Error(complaintData.message || 'Failed to fetch complaint');
            }

            setComplaint(complaintData.data);

            // Fetch existing responses
            const responsesResponse = await fetch(`${baseUrl}complaints/${complaint_id}/responses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (responsesResponse.ok) {
                const responsesData = await responsesResponse.json();
                if (responsesData.status) {
                    setResponses(responsesData.data || []);
                }
            }

        } catch (error: any) {
            console.error('Error fetching complaint data:', error);
            setError(error.message);
            toast.error(error.message || 'Failed to load complaint data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            if (!allowedTypes.includes(file.type)) {
                toast.error(`File ${file.name} has an unsupported format.`);
                return false;
            }
            return true;
        });

        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...validFiles]
        }));
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canRespond) {
            toast.error('You do not have permission to respond to this complaint');
            return;
        }

        if (!formData.response.trim()) {
            toast.error('Please enter a response message');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = getAuthToken();
            const submitData = new FormData();

            submitData.append('response', formData.response.trim());
            submitData.append('is_private', formData.is_private.toString());

            // Add attachments
            formData.attachments.forEach((file, index) => {
                submitData.append(`attachments[${index}]`, file);
            });

            const response = await fetch(`${baseUrl}complaints/${complaint_id}/responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: submitData,
            });

            const data = await response.json();

            if (response.ok && data.status) {
                toast.success('Response added successfully!');
                navigate(`/complaints/${complaint_id}`);
            } else {
                throw new Error(data.message || 'Failed to add response');
            }

        } catch (error: any) {
            console.error('Error adding response:', error);
            toast.error(error.message || 'Failed to add response');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
            return Image;
        }
        return FileIcon;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-red-600 bg-red-100';
            case 'staff': return 'text-blue-600 bg-blue-100';
            case 'student': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
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

    if (error || !complaint) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Failed to Load Complaint
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'The complaint you\'re trying to respond to could not be found.'}
                    </p>
                    <button
                        onClick={() => navigate('/complaints')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Back to Complaints
                    </button>
                </div>
            </div>
        );
    }

    if (!canRespond) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You do not have permission to respond to this complaint.
                    </p>
                    <button
                        onClick={() => navigate(`/complaints/${complaint_id}`)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        View Complaint
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/complaints/${complaint_id}`)}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Complaint Details
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Add Response
                            </h1>
                            <p className="text-gray-600">
                                Respond to complaint #{complaint.id}: {complaint.subject}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Complaint Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Complaint Summary
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-900">{complaint.subject}</h3>
                                    <p className="text-gray-600 mt-2 line-clamp-3">{complaint.description}</p>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {formatDate(complaint.created_at)}
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                        style={{
                                            backgroundColor: `${complaint.status.color}20`,
                                            color: complaint.status.color,
                                        }}
                                    >
                                        {complaint.status.name}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Response Form */}
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                Your Response
                            </h2>

                            <div className="space-y-6">
                                {/* Response Message */}
                                <div>
                                    <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                                        Response Message *
                                    </label>
                                    <textarea
                                        id="response"
                                        name="response"
                                        value={formData.response}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                                        placeholder="Enter your response to this complaint..."
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Provide a clear and helpful response to address the complaint.
                                    </p>
                                </div>

                                {/* Privacy Option - Only for staff */}
                                {isStaff && (
                                    <div className="flex items-start space-x-3">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                id="is_private"
                                                name="is_private"
                                                checked={formData.is_private}
                                                onChange={handleCheckboxChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="is_private" className="text-sm font-medium text-gray-700 flex items-center">
                                                <Lock className="w-4 h-4 mr-2" />
                                                Private response (staff only)
                                            </label>
                                            <p className="text-sm text-gray-500 mt-1">
                                                This response will only be visible to staff members and administrators.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Attachments */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Attachments (Optional)
                                    </label>

                                    {/* Current Attachments */}
                                    {formData.attachments.length > 0 && (
                                        <div className="mb-4">
                                            <div className="space-y-2">
                                                {formData.attachments.map((file, index) => {
                                                    const FileIconComponent = getFileIcon(file.name);

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                                                        >
                                                            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                                                <FileIconComponent className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAttachment(index)}
                                                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* File Upload */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <label htmlFor="attachments" className="cursor-pointer">
                                            <span className="text-blue-600 hover:text-blue-500 font-medium">
                                                Click to upload files
                                            </span>
                                            <span className="text-gray-500"> or drag and drop</span>
                                        </label>
                                        <input
                                            type="file"
                                            id="attachments"
                                            multiple
                                            accept="image/*,.pdf,.txt"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            PNG, JPG, PDF, TXT up to 10MB each
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Send Response
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`/complaints/${complaint_id}`)}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Response Guidelines */}
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                <h3 className="text-sm font-semibold text-blue-900">
                                    Response Guidelines
                                </h3>
                            </div>
                            <div className="text-sm text-blue-800 space-y-2">
                                <p>• Be professional and courteous</p>
                                <p>• Provide clear and actionable information</p>
                                <p>• Include relevant details or next steps</p>
                                <p>• Attach supporting documents if needed</p>
                                {isStaff && (
                                    <p>• Use private responses for internal notes</p>
                                )}
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                            <div className="flex items-center space-x-2 mb-3">
                                {formData.is_private ? (
                                    <Lock className="w-5 h-5 text-yellow-600" />
                                ) : (
                                    <Globe className="w-5 h-5 text-yellow-600" />
                                )}
                                <h3 className="text-sm font-semibold text-yellow-900">
                                    Visibility
                                </h3>
                            </div>
                            <p className="text-sm text-yellow-800">
                                {formData.is_private ? (
                                    "This response will only be visible to staff members and administrators."
                                ) : (
                                    "This response will be visible to the complaint author and all staff members."
                                )}
                            </p>
                        </div>

                        {/* Recent Responses */}
                        {responses.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Recent Responses ({responses.length})
                                </h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {responses.slice(0, 3).map((response) => (
                                        <div key={response.id} className="border-l-4 border-blue-200 pl-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(response.user.role)}`}>
                                                    {response.user.role}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {response.user.name}
                                                </span>
                                                {response.is_private && (
                                                    <Lock className="w-3 h-3 text-gray-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-3">
                                                {response.response}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {formatDate(response.created_at)}
                                            </p>
                                        </div>
                                    ))}
                                    {responses.length > 3 && (
                                        <button
                                            onClick={() => navigate(`/complaints/${complaint_id}`)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            View all {responses.length} responses →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* User Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Your Information
                            </h3>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddResponsePage;
