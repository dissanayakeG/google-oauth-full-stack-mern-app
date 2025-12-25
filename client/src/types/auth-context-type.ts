import type { User } from "./user-type";

export interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    logout: () => Promise<boolean>;
}