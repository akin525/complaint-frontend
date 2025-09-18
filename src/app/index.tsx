import { AppRouter } from "./app-router";
import { AppProvider } from "./provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "@/context/UserContext";

export function App() {
    return (
        <UserProvider>
            <AppProvider>
                <AppRouter />
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    closeOnClick
                    pauseOnHover
                    draggable
                    theme="light" // or "dark"
                />
            </AppProvider>
        </UserProvider>
    );
}
