import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Save,
    X,
    Upload,
    FileText,
    Image,
    FileIcon,
    Trash2,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    Loader,
    Tag,
    Activity,
    Shield,
    User
} from 'lucide-react';
import { getAuthToken } from '@/utils/auth';
import { useUser } from '@/context/UserContext';

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
    category: Category;
    status: Status;
}

interface FormData {
    subject: string;
    description: string;
    category_id: number;
    status_id: number;
    is_anonymous: boolean;
    is_resolved: boolean;
    attachments: File[];
    existing_attachments: string[];
}

const UpdateComplaintPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();

    const [complaint, setComplaint] = useState<ComplaintData | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        subject: '',
        description: '',
        category_id: 0,
        status_id: 0,
        is_anonymous: false,
        is_resolved: false,
        attachments: [],
        existing_attachments: []
    });

    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff' || user?.role === 'admin';
    const isOwner = user?.id === complaint?.user_id;
    const canEdit = isOwner || isStaff;

    useEffect(() => {
        if (id) {
            fetchComplaintData();
        }
    }, [id]);

    const fetchComplaintData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = getAuthToken();

            // Fetch complaint details
            const complaintResponse = await fetch(`${baseUrl}complaints/${id}`, {
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

            const complaint = complaintData.data;
            setComplaint(complaint);

            // Set form data
            setFormData({
                subject: complaint.subject,
                description: complaint.description,
                category_id: complaint.category_id,
                status_id: complaint.status_id,
                is_anonymous: complaint.is_anonymous,
                is_resolved: complaint.is_resolved,
                attachments: [],
                existing_attachments: complaint.attachments || []
            });

            // Fetch categories and statuses if user is staff/admin
            if (isStaff) {
                await Promise.all([
                    fetchCategories(),
                    fetchStatuses()
                ]);
            }

        } catch (error: any) {
            console.error('Error fetching complaint data:', error);
            setError(error.message);
            toast.error(error.message || 'Failed to load complaint data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    setCategories(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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

            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    setStatuses(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value) : value
            }));
        }
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

    const removeNewAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const removeExistingAttachment = (attachment: string) => {
        setFormData(prev => ({
            ...prev,
            existing_attachments: prev.existing_attachments.filter(att => att !== attachment)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canEdit) {
            toast.error('You do not have permission to edit this complaint');
            return;
        }

        if (!formData.subject.trim() || !formData.description.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = getAuthToken();
            const submitData = new FormData();

            // Add basic fields
            submitData.append('subject', formData.subject.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('is_anonymous', formData.is_anonymous.toString());

            // Add admin/staff specific fields
            if (isStaff) {
                submitData.append('category_id', formData.category_id.toString());
                submitData.append('status_id', formData.status_id.toString());
                submitData.append('is_resolved', formData.is_resolved.toString());
            }

            // Add new attachments
            formData.attachments.forEach((file, index) => {
                submitData.append(`attachments[${index}]`, file);
            });

            // Add existing attachments to keep
            formData.existing_attachments.forEach((attachment, index) => {
                submitData.append(`keep_attachments[${index}]`, attachment);
            });

            const response = await fetch(`${baseUrl}complaints/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: submitData,
            });

            const data = await response.json();

            if (response.ok && data.status) {
                toast.success('Complaint updated successfully!');
                navigate(`/complaints/${id}`);
            } else {
                throw new Error(data.message || 'Failed to update complaint');
            }

        } catch (error: any) {
            console.error('Error updating complaint:', error);
            toast.error(error.message || 'Failed to update complaint');
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
                        {error || 'The complaint you\'re trying to edit could not be found.'}
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

    if (!canEdit) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You do not have permission to edit this complaint.
                    </p>
                    <button
                        onClick={() => navigate(`/complaints/${id}`)}
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/complaints/${id}`)}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Complaint Details
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Edit Complaint #{complaint.id}
                            </h1>
                            <p className="text-gray-600">
                                Update complaint details and attachments
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                    Basic Information
                                </h2>

                                <div className="space-y-6">
                                    {/* Subject */}
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="Brief description of your complaint"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                                            placeholder="Provide detailed information about your complaint..."
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Minimum 10 characters. Be as specific as possible.
                                        </p>
                                    </div>

                                    {/* Anonymous Option */}
                                    <div className="flex items-start space-x-3">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                id="is_anonymous"
                                                name="is_anonymous"
                                                checked={formData.is_anonymous}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="is_anonymous" className="text-sm font-medium text-gray-700 flex items-center">
                                                <EyeOff className="w-4 h-4 mr-2" />
                                                Submit anonymously
                                            </label>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Your identity will be hidden from other users, but administrators can still see it.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin/Staff Fields */}
                            {isStaff && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-2 mb-6">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Administrative Controls
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Category */}
                                        <div>
                                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                                                <Tag className="w-4 h-4 inline mr-1" />
                                                Category
                                            </label>
                                            <select
                                                id="category_id"
                                                name="category_id"
                                                value={formData.category_id}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label htmlFor="status_id" className="block text-sm font-medium text-gray-700 mb-2">
                                                <Activity className="w-4 h-4 inline mr-1" />
                                                Status
                                            </label>
                                            <select
                                                id="status_id"
                                                name="status_id"
                                                value={formData.status_id}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            >
                                                <option value="">Select Status</option>
                                                {statuses.map((status) => (
                                                    <option key={status.id} value={status.id}>
                                                        {status.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Resolution Status */}
                                    <div className="mt-6">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    id="is_resolved"
                                                    name="is_resolved"
                                                    checked={formData.is_resolved}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor="is_resolved" className="text-sm font-medium text-gray-700 flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                    Mark as resolved
                                                </label>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Check this box if the complaint has been fully resolved.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                    Attachments
                                </h2>

                                {/* Existing Attachments */}
                                {formData.existing_attachments.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                                            Current Attachments
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {formData.existing_attachments.map((attachment, index) => {
                                                const fileName = attachment.split('/').pop() || 'attachment';
                                                const FileIconComponent = getFileIcon(fileName);

                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
                                                    >
                                                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                                            <FileIconComponent className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {fileName}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingAttachment(attachment)}
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

                                {/* New Attachments */}
                                {formData.attachments.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                                            New Attachments
                                        </h3>
                                        <div className="space-y-2">
                                            {formData.attachments.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                                                >
                                                    <Upload className="w-5 h-5 text-blue-600" />
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
                                                        onClick={() => removeNewAttachment(index)}
                                                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add New Attachments
                                    </label>
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
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Current Status */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Current Status
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <span
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                            style={{
                                                backgroundColor: `${complaint.status.color}20`,
                                                color: complaint.status.color,
                                                border: `1px solid ${complaint.status.color}40`
                                            }}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full mr-2"
                                                style={{ backgroundColor: complaint.status.color }}
                                            />
                                            {complaint.status.name}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {complaint.status.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            <strong>Category:</strong> {complaint.category.name}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {complaint.category.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Info */}
                            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                                <div className="flex items-center space-x-2 mb-3">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-blue-900">
                                        Edit Permissions
                                    </h3>
                                </div>
                                <div className="text-sm text-blue-800 space-y-2">
                                    {isOwner && (
                                        <p>✓ You can edit basic information and attachments</p>
                                    )}
                                    {isStaff && (
                                        <p>✓ You can modify category, status, and resolution</p>
                                    )}
                                    <p className="text-xs text-blue-600 mt-3">
                                        Changes will be logged and visible to all parties.
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            Update Complaint
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate(`/complaints/${id}`)}
                                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateComplaintPage;
