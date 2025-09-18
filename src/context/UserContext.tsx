import React, { createContext, useContext, useState } from "react";



interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role:string;
  profile_photo_path: string | null;
  online?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  siteBot: string | null;
  setSiteBot: (bot: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [siteBot, setSiteBot] = useState<string | null>(null);

  return (
      <UserContext.Provider value={{ user, setUser, siteBot, setSiteBot }}>
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
