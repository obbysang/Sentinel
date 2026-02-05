import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

interface User {
    username: string;
    id: number;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (u: string, p: string) => Promise<void>;
    register: (u: string, p: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.getProfile()
                .then(setUser)
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (u: string, p: string) => {
        const data = await api.login(u, p);
        localStorage.setItem('token', data.access_token);
        const user = await api.getProfile();
        setUser(user);
    };

    const register = async (u: string, p: string) => {
        await api.register(u, p);
        await login(u, p);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
