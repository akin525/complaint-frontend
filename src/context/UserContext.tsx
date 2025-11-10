import React, { createContext, useContext, useState } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    systemConfig?: string; // Made optional since it's not always provided
    student_id?: string | null;
    department?: string | null;
    created_at?: string;
    updated_at?: string;
    lastLoginAt?: string; // Added this field
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void; // Changed to match the actual setter
    isStudent: () => boolean;
    isStaff: () => boolean;
    isAdmin: () => boolean;
    isSuperAdmin: () => boolean;
    hasAdminPrivileges: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const isStudent = () => user?.role === 'student';
    const isStaff = () => user?.role === 'staff';
    const isAdmin = () => user?.role === 'admin';
    const isSuperAdmin = () => user?.role === 'superadmin';
    const hasAdminPrivileges = () => user?.role === 'admin' || user?.role === 'superadmin';

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            isStudent,
            isStaff,
            isAdmin,
            isSuperAdmin,
            hasAdminPrivileges
        }}>
            {children}
        </UserContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
