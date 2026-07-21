import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
});

let isRedirecting = false;

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || "";
        const isAuthRoute = /\/auth\/(login|register|forgot-password|reset-password|change-password|me|logout)/.test(requestUrl);

        if (status === 401 && !isRedirecting && !isAuthRoute && window.location.pathname !== "/login") {
            isRedirecting = true;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.assign("/login");
        }

        return Promise.reject(error);
    }
);

export default api;
