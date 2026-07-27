import { API_BASE_URL } from "../config/apiConfig";

const API_BASE = `${API_BASE_URL}/api/admin`;

export async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("aroham_admin_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = res.headers.get("content-type") || "";
  let data: any = {};

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    if (res.status === 413) {
      throw new Error("Product image or payload is too large (413). Please use an image URL or smaller image file.");
    }
    throw new Error(`Server error (${res.status}). Please check backend logs or restart backend server.`);
  }

  if (!res.ok) {
    throw new Error(data.error || "An error occurred during request execution");
  }

  return data;
}
