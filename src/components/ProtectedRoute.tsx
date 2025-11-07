import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAuthToken } from "../utils/auth";
import { toast } from "react-toastify";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader.tsx";
import { useUser } from "@/context/UserContext.tsx";
import {
    Shield,
    User,
    Settings,
    AlertCircle,
    CheckCircle,
    University,
    Loader2,
    Wifi,
    WifiOff
} from "lucide-react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface ProtectedRouteProps {
    children: React.ReactNode;
}

interface AuthState {
    isValid: boolean | null;
    isLoading: boolean;
    error: string | null;
    step: 'token-check' | 'user-validation' | 'system-check' | 'complete';
    progress: number;
}

interface UserResponse {
    status: boolean;
    message: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        student_id: string;
        department: string;
        created_at: string;
        updated_at: string;
    };
}

// interface SystemConfig {
//     maintenance_mode?: boolean;
//     complaint_system_enabled?: boolean;
//     system_announcement?: string;
//     office_hours?: {
//         start: string;
//         end: string;
//     };
// }

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [authState, setAuthState] = useState<AuthState>({
        isValid: null,
        isLoading: true,
        error: null,
        step: 'token-check',
        progress: 0
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'maintenance'>('online');
    const navigate = useNavigate();
    const { setUser } = useUser();

    const updateAuthState = (updates: Partial<AuthState>) => {
        setAuthState(prev => ({ ...prev, ...updates }));
    };

    const handleAuthError = (error: string, shouldRedirect: boolean = true) => {
        if (shouldRedirect) {
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
            toast.error(error);
            navigate("/login");
        }
        updateAuthState({
            error,
            isLoading: false,
            isValid: false
        });
    };

    const validateUserSession = async (token: string): Promise<UserResponse> => {
        updateAuthState({ step: 'user-validation', progress: 25 });

        const response = await fetch(`${baseUrl}user`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to validate user session");
        }

        if (!data.status) {
            throw new Error(data.message || "Invalid user session");
        }

        // Validate required fields for student complaint system
        // if (!data.user.student_id || !data.user.department) {
        //     throw new Error("Incomplete student profile. Please contact administration.");
        // }

        return data;
    };

    // const fetchSystemConfig = async (token: string): Promise<SystemConfig> => {
    //     updateAuthState({ step: 'system-check', progress: 75 });
    //
    //     try {
    //         const response = await fetch(`${baseUrl}system/config`, {
    //             method: "GET",
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 "Content-Type": "application/json",
    //             },
    //         });
    //
    //         if (!response.ok) {
    //             console.warn("System config fetch failed, using defaults");
    //             return {};
    //         }
    //
    //         const data = await response.json();
    //         return data.data || {};
    //     } catch (error) {
    //         console.warn("System config error:", error);
    //         return {};
    //     }
    // };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                updateAuthState({
                    step: 'token-check',
                    progress: 0,
                    isLoading: true,
                    error: null
                });

                // Step 1: Check for authentication token
                const token = getAuthToken();
                if (!token) {
                    navigate("/login");
                    return;
                }

                updateAuthState({ progress: 10 });

                // Step 2: Validate user session
                const userResponse = await validateUserSession(token);
                updateAuthState({ progress: 50 });

                // Step 3: Check system configuration
                // const systemConfig = await fetchSystemConfig(token);
                // updateAuthState({ progress: 90 });

                // Step 4: Handle system states
                // if (systemConfig.maintenance_mode) {
                //     setSystemStatus('maintenance');
                //     navigate("/maintenance");
                //     return;
                // }

                // if (systemConfig.complaint_system_enabled === false) {
                //     toast.warning("Complaint system is temporarily unavailable");
                //     setSystemStatus('offline');
                // }

                // Step 5: Set user data
                setUser({
                    ...userResponse.user,
                    lastLoginAt: new Date().toISOString(),
                });

                setSystemStatus('online');
                updateAuthState({
                    step: 'complete',
                    progress: 100,
                    isValid: true,
                    isLoading: false
                });

            } catch (error: any) {
                console.error("Auth initialization failed:", error);
                handleAuthError(
                    error.message || "Authentication failed. Please login again."
                );
            }
        };

        initializeAuth();
    }, [navigate, setUser]);

    // Enhanced Loading Component
    const LoadingScreen = () => {
        const getStepInfo = () => {
            switch (authState.step) {
                case 'token-check':
                    return {
                        icon: Shield,
                        title: "Checking Authentication",
                        description: "Verifying your login credentials...",
                        color: "text-blue-600"
                    };
                case 'user-validation':
                    return {
                        icon: User,
                        title: "Loading Student Profile",
                        description: "Retrieving your student information...",
                        color: "text-indigo-600"
                    };
                case 'system-check':
                    return {
                        icon: Settings,
                        title: "Checking System Status",
                        description: "Verifying complaint system availability...",
                        color: "text-purple-600"
                    };
                case 'complete':
                    return {
                        icon: CheckCircle,
                        title: "Ready!",
                        description: "Loading your dashboard...",
                        color: "text-green-600"
                    };
                default:
                    return {
                        icon: Loader2,
                        title: "Loading",
                        description: "Please wait...",
                        color: "text-gray-600"
                    };
            }
        };

        const stepInfo = getStepInfo();
        const StepIcon = stepInfo.icon;

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

                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center max-w-lg">
                            {/* Header Section */}
                            <div className="mb-12">
                                <div className="relative mx-auto w-20 h-20 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
                                    <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-20 h-20 flex items-center justify-center shadow-xl">
                                        <University className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                    Student Portal
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Complaint Management System
                                </p>
                            </div>

                            {/* Loading Animation */}
                            <div className="mb-10">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    {/* Outer ring */}
                                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                                    {/* Progress ring */}
                                    <div
                                        className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent transition-all duration-500 ease-out"
                                        style={{
                                            transform: `rotate(${(authState.progress / 100) * 360}deg)`
                                        }}
                                    ></div>
                                    {/* Center icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`p-3 rounded-full bg-white shadow-lg ${stepInfo.color}`}>
                                            <StepIcon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {stepInfo.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {stepInfo.description}
                                    </p>

                                    {/* Progress percentage */}
                                    <div className="text-sm font-medium text-blue-600">
                                        {authState.progress}% Complete
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${authState.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {systemStatus === 'online' ? (
                                            <Wifi className="w-5 h-5 text-green-500" />
                                        ) : systemStatus === 'offline' ? (
                                            <WifiOff className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <Settings className="w-5 h-5 text-yellow-500" />
                                        )}
                                        <span className="font-medium text-gray-900">System Status</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            systemStatus === 'online' ? 'bg-green-400 animate-pulse' :
                                                systemStatus === 'offline' ? 'bg-red-400' :
                                                    'bg-yellow-400 animate-pulse'
                                        }`}></div>
                                        <span className={`text-sm font-medium capitalize ${
                                            systemStatus === 'online' ? 'text-green-600' :
                                                systemStatus === 'offline' ? 'text-red-600' :
                                                    'text-yellow-600'
                                        }`}>
                                            {systemStatus === 'maintenance' ? 'Under Maintenance' : systemStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Error Display */}
                            {authState.error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                        <h4 className="font-semibold text-red-900">Authentication Error</h4>
                                    </div>
                                    <p className="text-red-700 text-sm leading-relaxed">
                                        {authState.error}
                                    </p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Loading Steps Indicator */}
                            <div className="flex justify-center space-x-2">
                                {['token-check', 'user-validation', 'system-check', 'complete'].map((step, index) => {
                                    const isActive = authState.step === step;
                                    const isCompleted = ['token-check', 'user-validation', 'system-check', 'complete'].indexOf(authState.step) > index;

                                    return (
                                        <div
                                            key={step}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                isActive
                                                    ? 'bg-blue-500 scale-125'
                                                    : isCompleted
                                                        ? 'bg-green-400'
                                                        : 'bg-gray-300'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Show loading screen while validating
    if (authState.isLoading || authState.isValid === null) {
        return <LoadingScreen />;
    }

    // Render protected content
    return <>{children}</>;
}

// Additional utility hooks for the complaint system
export const useAuthStatus = () => {
    const { user } = useUser();

    return {
        isAuthenticated: !!user,
        user,
        isStudent: user?.role === 'student',
        hasCompleteProfile: !!(user?.student_id && user?.department),
        systemConfig: user?.systemConfig || {},
    };
};

// export const useSystemStatus = () => {
//     const { user } = useUser();
//     const config = user?.systemConfig || {};
//
//     return {
//         isOnline: !config.maintenance_mode && config.complaint_system_enabled !== false,
//         isMaintenanceMode: config.maintenance_mode || false,
//         isComplaintSystemEnabled: config.complaint_system_enabled !== false,
//         systemAnnouncement: config.system_announcement || null,
//         officeHours: config.office_hours || { start: "09:00", end: "17:00" },
//     };
// };
