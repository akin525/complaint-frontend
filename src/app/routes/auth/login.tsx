import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, GraduationCap, MessageSquare, Shield } from "lucide-react";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const getDeviceName = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const browser = (() => {
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edg")) return "Edge";
    return "Unknown";
  })();
  return `${platform} ${browser}`;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [siteName, setSiteName] = useState("UNIVERSITY");
  // const [loginEnabled, setLoginEnabled] = useState(true);

  const device_name = getDeviceName();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!loginEnabled) return toast.error("Login is currently disabled by admin.");
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, device_name }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      if (data.status) {
        const token = data.token;
        rememberMe
            ? localStorage.setItem("authToken", token)
            : sessionStorage.setItem("authToken", token);
        toast.success(data.message || "Login successful");
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section - Information Panel */}
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800 text-white px-12">
          <div className="max-w-md">
            {/* Header */}
            <div className="flex items-center mb-8">
              <div className="bg-white/10 p-3 rounded-full mr-4">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">UNIVERSITY</h1>
                <p className="text-blue-200">Student Portal</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Student Complaint System
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Your voice matters. Submit, track, and resolve complaints efficiently
                  through our secure student portal.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Easy Complaint Submission</h3>
                    <p className="text-blue-200 text-sm">Submit complaints with detailed descriptions and attachments</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Secure & Confidential</h3>
                    <p className="text-blue-200 text-sm">Your privacy is protected with end-to-end security</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-blue-300 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="text-blue-900 text-xs font-bold">24/7</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Real-time Tracking</h3>
                    <p className="text-blue-200 text-sm">Monitor your complaint status and receive updates instantly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="mt-12 opacity-20">
              <div className="flex space-x-2">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-2 w-2 bg-white rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex flex-col justify-center bg-gray-50 px-6 py-12 lg:px-12">
          <div className="w-full max-w-md mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2"/>
                Back to Home
              </Link>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">UNIVERSITY</h1>
              <p className="text-gray-600">Student Complaint System</p>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="mt-2 text-gray-600">Sign in to access your student portal</p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Email
                  </label>
                  <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="student@university.edu"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                        placeholder="Enter your password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                      Keep me signed in
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading }
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                        loading 
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                >
                  {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                  ) : (
                      "Sign In to Portal"
                  )}
                </button>
              </form>

              {/* Registration Link */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  New student?{" "}
                  <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                    Create your account
                  </Link>
                </p>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact{" "}
                <a href="mailto:support@university.edu" className="text-indigo-600 hover:underline">
                  IT Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
