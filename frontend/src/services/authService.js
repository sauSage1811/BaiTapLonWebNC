import api from "./api";

export function loginApi(data) {
    return api.post("/auth/login", data);
}

export function registerApi(data) {
    return api.post("/auth/register", data);
}

export function forgotPasswordApi(data) {
    return api.post("/auth/forgot-password", data);
}

export function resetPasswordApi(data) {
    return api.post("/auth/reset-password", data);
}

export function getMeApi() {
    return api.get("/auth/me");
}

export function updateMeApi(data) {
    return api.put("/auth/me", data);
}

export function changePasswordApi(data) {
    return api.post("/auth/change-password", data);
}

export function logoutApi() {
    return api.post("/auth/logout");
}
