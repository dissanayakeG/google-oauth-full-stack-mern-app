import { createContext, useContext, useState } from "react";
import type { AuthContextType } from "../types/auth.context";
import type { User } from "../types/user";
import api, { setApiToken } from "../api";

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        } finally {
            setApiToken(null);
            setUser(null);
            window.location.href = "/login";
        }
    };

    const value: AuthContextType = {
        user,
        setUser,
        loading,
        setLoading,
        logout,
    };

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};