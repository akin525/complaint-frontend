import React, {  useState } from "react";
import { Link } from "react-router";
import { Eye, EyeOff, ArrowLeft, GraduationCap, Users, BookOpen, Building } from "lucide-react";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type RegisterFormFields = {
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  level: string;
  faculty: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

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

// Academic data
const faculties = [
  "Faculty of Engineering",
  "Faculty of Science",
  "Faculty of Arts",
  "Faculty of Social Sciences",
  "Faculty of Medicine",
  "Faculty of Law",
  "Faculty of Education",
  "Faculty of Business Administration",
  "Faculty of Agriculture",
  "Faculty of Environmental Sciences"
];

const departmentsByFaculty = {
  "Faculty of Engineering": [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Software Engineering"
  ],
  "Faculty of Science": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Statistics",
    "Geology"
  ],
  "Faculty of Arts": [
    "English Language",
    "History",
    "Philosophy",
    "Fine Arts",
    "Music",
    "Theatre Arts"
  ],
  "Faculty of Social Sciences": [
    "Psychology",
    "Sociology",
    "Political Science",
    "Economics",
    "International Relations",
    "Mass Communication"
  ],
  "Faculty of Medicine": [
    "Medicine and Surgery",
    "Nursing",
    "Pharmacy",
    "Medical Laboratory Science",
    "Physiotherapy",
    "Dentistry"
  ],
  "Faculty of Law": [
    "Common Law",
    "Civil Law",
    "International Law"
  ],
  "Faculty of Education": [
    "Educational Administration",
    "Curriculum Studies",
    "Educational Psychology",
    "Adult Education",
    "Special Education"
  ],
  "Faculty of Business Administration": [
    "Accounting",
    "Business Administration",
    "Marketing",
    "Finance",
    "Human Resource Management",
    "Banking and Finance"
  ],
  "Faculty of Agriculture": [
    "Crop Production",
    "Animal Science",
    "Agricultural Economics",
    "Soil Science",
    "Agricultural Extension"
  ],
  "Faculty of Environmental Sciences": [
    "Environmental Management",
    "Geography",
    "Urban Planning",
    "Environmental Biology"
  ]
};

const academicLevels = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "600 Level"
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [loginEnabled, setLoginEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [formData, setFormData] = useState<RegisterFormFields>({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    level: "",
    faculty: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Update available departments when faculty changes
    if (name === "faculty") {
      setAvailableDepartments(departmentsByFaculty[value as keyof typeof departmentsByFaculty] || []);
      setFormData(prev => ({ ...prev, department: "" })); // Reset department
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const payload = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      student_id: formData.studentId,
      phone: formData.phone,
      password: formData.password,
      department: formData.department,
      faculty: formData.faculty,
      level: formData.level,
      device_name: getDeviceName(),
    };

    try {
      const res = await fetch(`${baseUrl}register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        sessionStorage.setItem("authToken", data.token);
        toast.success(data.message || "Account created successfully");
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch {
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50">
        {/* Left: Information Panel */}
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800 text-white px-12">
          <div className="max-w-md">
            {/* Header */}
            <div className="flex items-center mb-8">
              <div className="bg-white/10 p-3 rounded-full mr-4">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">UNIVERSITY PORTAL</h1>
                <p className="text-blue-200">Student Registration</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Join Our Academic Community
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Register with your department to access the student complaint system
                  and connect with your academic community.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Department-Based Registration</h3>
                    <p className="text-blue-200 text-sm">Register based on your faculty and department</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Connect with Peers</h3>
                    <p className="text-blue-200 text-sm">Join your departmental community</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Academic Support</h3>
                    <p className="text-blue-200 text-sm">Access department-specific resources and support</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">10+</div>
                  <div className="text-sm text-blue-200">Faculties</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-blue-200">Departments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
          <Link to="/" className="inline-flex items-center text-gray-700 hover:text-indigo-600 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">UNIVERSITY PORTAL</h1>
            <p className="text-gray-600">Student Registration System</p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Create Student Account</h2>
              <p className="text-gray-600 mt-2">Register with your department information</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-indigo-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID *
                      </label>
                      <input
                          id="studentId"
                          name="studentId"
                          type="text"
                          value={formData.studentId}
                          onChange={handleChange}
                          placeholder="e.g., 2024/CS/001"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                      />
                    </div>
                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Level *
                      </label>
                      <select
                          id="level"
                          name="level"
                          value={formData.level}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                      >
                        <option value="">Select your level</option>
                        {academicLevels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-2">
                        Faculty *
                      </label>
                      <select
                          id="faculty"
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                      >
                        <option value="">Select your faculty</option>
                        {faculties.map((faculty) => (
                            <option key={faculty} value={faculty}>{faculty}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                          disabled={!formData.faculty}
                      >
                        <option value="">
                          {formData.faculty ? "Select your department" : "Select faculty first"}
                        </option>
                        {availableDepartments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-indigo-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        University Email *
                      </label>
                      <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="student@university.edu"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+234 xxx xxx xxxx"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                            required
                            placeholder="Enter password"
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                            required
                            placeholder="Confirm password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                  <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="h-4 w-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      required
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 font-medium">
                      Privacy Policy
                    </Link>
                    . I confirm that all information provided is accurate and belongs to me.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading }
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                        loading 
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                >
                  {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                  ) : (
                      "Create Student Account"
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Need help with registration? Contact{" "}
                <a href="mailto:registrar@university.edu" className="text-indigo-600 hover:underline">
                  Student Affairs
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
