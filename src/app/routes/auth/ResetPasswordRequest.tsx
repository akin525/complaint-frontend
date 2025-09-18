import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import {
    FiMail,
    FiArrowLeft,
    FiSend,
    FiShield,
    FiClock,
    FiHelpCircle,
    FiCheckCircle
} from "react-icons/fi";
import { GraduationCap } from "lucide-react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function ResetPasswordRequest() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleRequest = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${baseUrl}reset_password_code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success === true) {
                toast.success(data.message);
                setIsEmailSent(true);
                // Auto redirect after 3 seconds
                setTimeout(() => {
                    window.location.href = "/set-password";
                }, 3000);
            } else {
                toast.error(data.message);
            }
        } catch (err: any) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Panel - Information */}
            <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800 text-white px-12">
                <div className="max-w-md">
                    {/* Header */}
                    <div className="flex items-center mb-8">
                        <div className="bg-white/10 p-3 rounded-full mr-4">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">UNIVERSITY PORTAL</h1>
                            <p className="text-blue-200">Account Recovery</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">
                                Forgot Your Password?
                            </h2>
                            <p className="text-lg text-blue-100 leading-relaxed">
                                Don't worry! It happens to everyone. We'll help you reset your
                                password and get back to your student account quickly and securely.
                            </p>
                        </div>

                        {/* Process Steps */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold">Enter Your Email</h3>
                                    <p className="text-blue-200 text-sm">Provide your registered university email address</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold">Check Your Email</h3>
                                    <p className="text-blue-200 text-sm">We'll send a verification code to your inbox</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold">Create New Password</h3>
                                    <p className="text-blue-200 text-sm">Use the code to set a new secure password</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <FiShield className="h-5 w-5 mr-2" />
                                <h4 className="font-semibold">Security Notice</h4>
                            </div>
                            <p className="text-sm text-blue-200">
                                For your security, the reset code will expire in 15 minutes.
                                If you don't receive the email, check your spam folder.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-col justify-center bg-gray-50 px-6 py-12 lg:px-12">
                <div className="w-full max-w-md mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                            <FiArrowLeft className="h-4 w-4 mr-2"/>
                            Back to Login
                        </Link>
                    </div>

                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <GraduationCap className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">UNIVERSITY PORTAL</h1>
                        <p className="text-gray-600">Password Recovery</p>
                    </div>

                    {!isEmailSent ? (
                        <>
                            {/* Form Header */}
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-indigo-100 p-4 rounded-full">
                                        <FiMail className="h-8 w-8 text-indigo-600" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                                <p className="mt-2 text-gray-600">
                                    Enter your university email to receive a reset code
                                </p>
                            </div>

                            {/* Form */}
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <form onSubmit={handleRequest} className="space-y-6">
                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            University Email Address
                                        </label>
                                        <div className="relative">
                                            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="student@university.edu"
                                                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Use the email address you registered with
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                                            loading
                                                ? "bg-gray-300 cursor-not-allowed"
                                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        }`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <svg
                                                    className="w-5 h-5 animate-spin mr-2"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                                    ></path>
                                                </svg>
                                                Sending Reset Code...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <FiSend className="h-5 w-5 mr-2" />
                                                Send Reset Code
                                            </div>
                                        )}
                                    </button>
                                </form>

                                {/* Help Section */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-3">
                                            Having trouble accessing your account?
                                        </p>
                                        <a
                                            href="mailto:support@university.edu"
                                            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                                        >
                                            <FiHelpCircle className="h-4 w-4 mr-1" />
                                            Contact IT Support
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="bg-green-100 p-4 rounded-full">
                                    <FiCheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Check Your Email!
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    We've sent a verification code to:
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="font-semibold text-indigo-600">{email}</p>
                                </div>

                                <div className="space-y-4 text-sm text-gray-600">
                                    <div className="flex items-center justify-center">
                                        <FiClock className="h-4 w-4 mr-2 text-orange-500" />
                                        <span>Code expires in 15 minutes</span>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-blue-800 font-medium mb-2">Next Steps:</p>
                                        <ol className="text-blue-700 text-sm space-y-1">
                                            <li>1. Check your email inbox</li>
                                            <li>2. Look for the 6-digit verification code</li>
                                            <li>3. Enter the code on the next page</li>
                                        </ol>
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        Didn't receive the email? Check your spam folder or{" "}
                                        <button
                                            onClick={() => setIsEmailSent(false)}
                                            className="text-indigo-600 hover:text-indigo-500 font-medium"
                                        >
                                            try again
                                        </button>
                                    </p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <Link
                                        to="/set-password"
                                        className="inline-flex items-center justify-center w-full py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                                    >
                                        Continue to Password Reset
                                        <FiArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Help */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            Remember your password?{" "}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
