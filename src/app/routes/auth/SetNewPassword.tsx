import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router";
import {
    FiMail,
    FiLock,
    FiKey,
    FiEye,
    FiEyeOff,
    FiArrowLeft,
    FiShield,
    FiCheckCircle
} from "react-icons/fi";
import { GraduationCap } from "lucide-react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function SetNewPassword() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength validation
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        strength = Object.values(checks).filter(Boolean).length;
        return { strength, checks };
    };

    const passwordAnalysis = getPasswordStrength(password);

    const getStrengthColor = (strength: number) => {
        if (strength < 2) return "bg-red-500";
        if (strength < 4) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = (strength: number) => {
        if (strength < 2) return "Weak";
        if (strength < 4) return "Medium";
        return "Strong";
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (passwordAnalysis.strength < 3) {
            toast.error("Please choose a stronger password.");
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${baseUrl}reset_password_code_submit`, {
                email,
                code,
                password,
                confirm_password: confirmPassword,
            });

            toast.success("✅ Password reset successful! Redirecting to login...");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (err) {
            toast.error("❌ Failed to reset password. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            <Toaster position="top-center" />

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
                            <p className="text-blue-200">Student Security</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">
                                Secure Your Account
                            </h2>
                            <p className="text-lg text-blue-100 leading-relaxed">
                                Create a strong password to protect your student account and
                                ensure secure access to the complaint system.
                            </p>
                        </div>

                        {/* Security Features */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <FiShield className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Enhanced Security</h3>
                                    <p className="text-blue-200 text-sm">Your password is encrypted and stored securely</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <FiCheckCircle className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Account Protection</h3>
                                    <p className="text-blue-200 text-sm">Strong passwords prevent unauthorized access</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <FiLock className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Privacy Assured</h3>
                                    <p className="text-blue-200 text-sm">Your personal information remains confidential</p>
                                </div>
                            </div>
                        </div>

                        {/* Password Tips */}
                        <div className="bg-white/10 rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Password Tips:</h4>
                            <ul className="text-sm text-blue-200 space-y-1">
                                <li>• Use at least 8 characters</li>
                                <li>• Include uppercase and lowercase letters</li>
                                <li>• Add numbers and special characters</li>
                                <li>• Avoid personal information</li>
                            </ul>
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
                        <p className="text-gray-600">Password Reset</p>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-indigo-100 p-4 rounded-full">
                                <FiShield className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
                        <p className="mt-2 text-gray-600">Create a secure password for your student account</p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Student Email
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="student@university.edu"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Reset Code Field */}
                            <div>
                                <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <FiKey className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        id="code"
                                        type="text"
                                        placeholder="Enter the 6-digit code"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Check your email for the verification code
                                </p>
                            </div>

                            {/* New Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-600">Password Strength:</span>
                                            <span className={`text-xs font-medium ${
                                                passwordAnalysis.strength < 2 ? 'text-red-600' :
                                                    passwordAnalysis.strength < 4 ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                                {getStrengthText(passwordAnalysis.strength)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordAnalysis.strength)}`}
                                                style={{ width: `${(passwordAnalysis.strength / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                            <div className={`flex items-center ${passwordAnalysis.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                                                <FiCheckCircle className="h-3 w-3 mr-1" />
                                                8+ characters
                                            </div>
                                            <div className={`flex items-center ${passwordAnalysis.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                <FiCheckCircle className="h-3 w-3 mr-1" />
                                                Uppercase
                                            </div>
                                            <div className={`flex items-center ${passwordAnalysis.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                                                <FiCheckCircle className="h-3 w-3 mr-1" />
                                                Number
                                            </div>
                                            <div className={`flex items-center ${passwordAnalysis.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                                                <FiCheckCircle className="h-3 w-3 mr-1" />
                                                Special char
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter your password"
                                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                            confirmPassword && password !== confirmPassword
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-gray-300 focus:border-indigo-500'
                                        }`}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                                )}
                                {confirmPassword && password === confirmPassword && (
                                    <p className="text-green-500 text-xs mt-1 flex items-center">
                                        <FiCheckCircle className="h-3 w-3 mr-1" />
                                        Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || password !== confirmPassword || passwordAnalysis.strength < 3}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                                    loading || password !== confirmPassword || passwordAnalysis.strength < 3
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
                                        Updating Password...
                                    </div>
                                ) : (
                                    "Update Password"
                                )}
                            </button>
                        </form>

                        {/* Help Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-600">
                                Need help?{" "}
                                <a href="mailto:support@university.edu" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                    Contact IT Support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
