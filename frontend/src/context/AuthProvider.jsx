import { useState } from "react";
import { loginApi, logoutApi } from "../services/authService";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (username, password) => {
        const res = await loginApi({ username, password });

        const token = res.data.token;
        const user = res.data.user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);

        return user;
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

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
