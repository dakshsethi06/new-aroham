const rawUrl = (import.meta.env.VITE_API_BASE_URL as string) || (import.meta.env.VITE_API_BASE as string) || "http://localhost:5000";
// Clean trailing /api or trailing slash if user provided it in env
export const API_BASE_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
