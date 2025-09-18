import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import axios from "axios";


const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        axios
            .get(`${baseUrl}ystem-config`)
            .then((res) => {
                const isMaintenance = res?.data?.data?.maintain === 1;
                if (isMaintenance && location.pathname !== "/maintenance") {
                    navigate("/maintenance");
                }
            })
            .catch((err) => {
                console.error("Error fetching system config:", err);
            })
            .finally(() => setLoading(false));
    }, [navigate, location.pathname]);

    if (loading) return <div className="p-8 text-center">Checking system status...</div>;

    return <>{children}</>;
}
