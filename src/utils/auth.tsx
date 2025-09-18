export function getAuthToken(): string | null {
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
}
