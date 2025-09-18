import {useState} from "react";
import { useNavigate } from "react-router";
import Sidebar from "@/components/Sidebar.tsx";
import DashboardHeader from "@/components/DashboardHeader.tsx";
interface MaintenancePageProps {
    countdown: any;
    page: string;
    tittle: string;
}
export default function MaintenancePage({ countdown, page, tittle }: MaintenancePageProps) {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex text-white bg-[#050B1E]">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader setSidebarOpen={setSidebarOpen} />
        <div className="min-h-screen bg-[#050B1E] text-white flex flex-col items-center justify-center p-6">
            <div className="bg-[#0A1128] p-10 rounded-2xl shadow-xl max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">⏳ {page}</h1>
                <p className="text-gray-300 mb-6">
                    You can place {tittle} between the allowed hours.<br />
                    Next bidding window opens in:
                </p>
                <div className="text-4xl font-mono mb-4">{countdown}</div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                    Go to Dashboard
                </button>
                <p className="text-sm text-gray-500 mt-4">
                    Thank you for your patience.
                </p>
            </div>
        </div>
            </div>
        </div>
    );
}
