import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
    FileText,
    Upload,
    AlertCircle,
    Eye,
    EyeOff,
    Paperclip,
    Image,
    FileIcon,
    Trash2,
    Send,
    ArrowLeft,
    Info
} from 'lucide-react';
import { getAuthToken } from '@/utils/auth';
import Sidebar from "@/components/Sidebar.tsx";
import DashboardHeader from "@/components/DashboardHeader.tsx";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface Category {
    id: number;
    name: string;
    description: string;
}

interface AttachmentFile {
    file: File;
    preview?: string;
    id: string;
}

interface ComplaintFormData {
    category_id: string;
    subject: string;
    description: string;
    is_anonymous: boolean;
    attachments: File[];
}

const CreateComplaint: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

    const [formData, setFormData] = useState<ComplaintFormData>({
        category_id: '',
        subject: '',
        description: '',
        is_anonymous: false,
        attachments: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dragActive, setDragActive] = useState(false);

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const token = getAuthToken();
            const response = await fetch(`${baseUrl}categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.status) {
                setCategories(data.data || []);
            } else {
                toast.error('Failed to load categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.category_id) {
            newErrors.category_id = 'Please select a category';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (formData.subject.trim().length < 5) {
            newErrors.subject = 'Subject must be at least 5 characters long';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 20) {
            newErrors.description = 'Description must be at least 20 characters long';
        }

        if (attachments.length > 5) {
            newErrors.attachments = 'Maximum 5 files allowed';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newAttachments: AttachmentFile[] = [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        Array.from(files).forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`File type ${file.type} is not allowed`);
                return;
            }

            if (file.size > maxSize) {
                toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
                return;
            }

            const attachment: AttachmentFile = {
                file,
                id: Math.random().toString(36).substr(2, 9)
            };

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    attachment.preview = e.target?.result as string;
                    setAttachments(prev => [...prev, attachment]);
                };
                reader.readAsDataURL(file);
            } else {
                newAttachments.push(attachment);
            }
        });

        if (newAttachments.length > 0) {
            setAttachments(prev => [...prev, ...newAttachments]);
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

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

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = getAuthToken();
            const submitFormData = new FormData();

            submitFormData.append('category_id', formData.category_id);
            submitFormData.append('subject', formData.subject.trim());
            submitFormData.append('description', formData.description.trim());
            submitFormData.append('is_anonymous', formData.is_anonymous.toString());

            // Append attachments
            attachments.forEach((attachment, index) => {
                submitFormData.append(`attachments[]`, attachment.file);
            });

            const response = await fetch(`${baseUrl}complaints`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: submitFormData,
            });

            const data = await response.json();

            if (response.ok && data.status) {
                toast.success('Complaint submitted successfully!');
                navigate('/complaints');
            } else {
                throw new Error(data.message || 'Failed to submit complaint');
            }
        } catch (error: any) {
            console.error('Error submitting complaint:', error);
            toast.error(error.message || 'Failed to submit complaint');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return Image;
        return FileIcon;
    };

    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category_id);

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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/complaints')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Complaints
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Submit New Complaint</h1>
                            <p className="text-gray-600 mt-1">
                                Describe your issue and we'll help resolve it as quickly as possible
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Category Selection */}
                        <div className="mb-6">
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.category_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                disabled={isLoading}
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {errors.category_id}
                                </p>
                            )}
                            {selectedCategory && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start space-x-2">
                                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">{selectedCategory.name}</p>
                                            <p className="text-sm text-blue-700">{selectedCategory.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Subject */}
                        <div className="mb-6">
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Brief summary of your complaint"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                maxLength={200}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.subject ? (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.subject}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">Minimum 5 characters</p>
                                )}
                                <span className="text-sm text-gray-400">
                                    {formData.subject.length}/200
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Provide detailed information about your complaint. Include when it happened, where it occurred, and any other relevant details."
                                rows={6}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                maxLength={1000}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.description ? (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">Minimum 20 characters</p>
                                )}
                                <span className="text-sm text-gray-400">
                                    {formData.description.length}/1000
                                </span>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attachments (Optional)
                            </label>
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                                    dragActive
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                                        >
                                            <Paperclip className="w-4 h-4 mr-2" />
                                            Choose Files
                                        </button>
                                        <p className="mt-2 text-sm text-gray-600">
                                            or drag and drop files here
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PNG, JPG, GIF, PDF, DOC up to 5MB each (max 5 files)
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    className="hidden"
                                />
                            </div>

                            {/* Attachment Preview */}
                            {attachments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Attached Files ({attachments.length}/5)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {attachments.map((attachment) => {
                                            const FileIconComponent = getFileIcon(attachment.file.type);
                                            return (
                                                <div
                                                    key={attachment.id}
                                                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
                                                >
                                                    {attachment.preview ? (
                                                        <img
                                                            src={attachment.preview}
                                                            alt={attachment.file.name}
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                            <FileIconComponent className="w-5 h-5 text-gray-600" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {attachment.file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(attachment.id)}
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

                            {errors.attachments && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {errors.attachments}
                                </p>
                            )}
                        </div>

                        {/* Anonymous Option */}
                        <div className="mb-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex items-center h-5">
                                    <input
                                        id="is_anonymous"
                                        name="is_anonymous"
                                        type="checkbox"
                                        checked={formData.is_anonymous}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="is_anonymous" className="text-sm font-medium text-gray-700">
                                        Submit anonymously
                                    </label>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your identity will be hidden from other users, but administrators can still see your information for follow-up purposes.
                                    </p>
                                </div>
                                {formData.is_anonymous ? (
                                    <EyeOff className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/complaints')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Submit Complaint</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-900 mb-2">
                                Tips for submitting effective complaints:
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Be specific about the issue and when it occurred</li>
                                <li>• Include relevant details like location, time, and people involved</li>
                                <li>• Attach supporting documents or images if available</li>
                                <li>• Choose the most appropriate category for faster resolution</li>
                            </ul>
                        </div>
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

export default CreateComplaint;
