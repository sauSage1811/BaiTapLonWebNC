import api from "./api";

export function loginApi(data) {
    return api.post("/auth/login", data);
}

export function getMeApi() {
    return api.get("/auth/me");
}

export function logoutApi() {
    return api.post("/auth/logout");
}