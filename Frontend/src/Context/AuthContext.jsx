import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../ApiClient/interceptor";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUser = async () => {
        try {
            const response = await apiClient.get("/auth/get-user");
            setUser(response.data.data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const login = async (loginData) => {
        const response = await apiClient.post("/auth/signin", loginData);
        const loggedInUser = response.data.data;

        setUser(loggedInUser);
        return loggedInUser;
    };

    const signout = async () => {
        try {
            await apiClient.post("/auth/signout");
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        setUser,
        login,
        signout,
        isAuthenticated: !!user,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};