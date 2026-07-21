import { useCallback, useEffect, useState } from "react";
import { getMeApi, loginApi, logoutApi } from "../services/authService";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            try {
                const res = await getMeApi();
                const currentUser = res.data?.data || null;

                if (isMounted) {
                    setUser(currentUser);
                    if (currentUser) {
                        localStorage.setItem("user", JSON.stringify(currentUser));
                    } else {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                    }
                }
            } catch {
                if (isMounted) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        restoreSession();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (username, password) => {
        const res = await loginApi({ username, password });
        const nextUser = res.data.user || null;
        const token = res.data.token;

        localStorage.setItem("token", token);
        if (nextUser) {
            localStorage.setItem("user", JSON.stringify(nextUser));
        }

        setUser(nextUser);

        return nextUser;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.log(error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const setCurrentUser = useCallback((nextUser) => {
        setUser(nextUser);

        if (nextUser) {
            localStorage.setItem("user", JSON.stringify(nextUser));
        } else {
            localStorage.removeItem("user");
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const res = await getMeApi();
        const currentUser = res.data?.data || null;
        setCurrentUser(currentUser);
        return currentUser;
    }, [setCurrentUser]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setCurrentUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}
