import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";
import { NotFound } from "./not-found";
import RegisterPage from "./routes/auth/register";
import LoginPage from "./routes/auth/login";
import Dashboard from "./routes/dashboard/dashboard";
import { ProtectedRoute } from "./../components/ProtectedRoute";
import Maintenance from "@/app/routes/dashboard/Maintenance.tsx";
import ResetPasswordRequest from "@/app/routes/auth/ResetPasswordRequest.tsx";
import SetNewPassword from "@/app/routes/auth/SetNewPassword.tsx";
import ComplaintsListPage from "@/app/routes/dashboard/complaints";
import PendingComplaintsPage from "@/app/routes/dashboard/PendingComplaintsPage.tsx";
import InProgressComplaintsPage from "@/app/routes/dashboard/InProgressComplaintsPage.tsx";
import ResolvedComplaintsPage from "@/app/routes/dashboard/ResolvedComplaintsPage.tsx";
import CreateComplaint from "@/app/routes/dashboard/createcomplaint.tsx";
import ComplaintDetailsPage from "@/app/routes/dashboard/complaintdetails.tsx";
import ComplaintResponsePage from "@/app/routes/dashboard/ComplaintResponsePage.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component:LoginPage,
  },
    {
    path: "/forgot-password",
    Component: ResetPasswordRequest,
  },
    {
    path: "/set-password",
    Component: SetNewPassword,
  },
    {
    path: "/maintenance",
    Component: Maintenance,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
    {
        path: "/dashboard",
        Component: () => (
            <ProtectedRoute>
                <Dashboard/>
            </ProtectedRoute>
        ),
    },
  {
        path: "/complaints",
        Component: () => (
            <ProtectedRoute>
                <ComplaintsListPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/complaints/:id",
        Component: () => (
            <ProtectedRoute>
                <ComplaintDetailsPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/complaints?status=pending",
        Component: () => (
            <ProtectedRoute>
                <PendingComplaintsPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/complaints?status=pending",
        Component: () => (
            <ProtectedRoute>
                <PendingComplaintsPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/complaints?status=in-progress",
        Component: () => (
            <ProtectedRoute>
                <InProgressComplaintsPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/complaints?status=resolved",
        Component: () => (
            <ProtectedRoute>
                <ResolvedComplaintsPage/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/complaints/create",
        Component: () => (
            <ProtectedRoute>
                <CreateComplaint/>
            </ProtectedRoute>
        ),
    },
    {
        path: "/complaints/create",
        Component: () => (
            <ProtectedRoute>
                <ComplaintResponsePage/>
            </ProtectedRoute>
        ),
    },
]);
export function AppRouter() {
  return <RouterProvider router={router} />;
}
