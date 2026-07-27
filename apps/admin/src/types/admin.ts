export interface AdminUser {
  id: string;
  mobile: string;
  mobileNumber?: string;
  name: string;
  role?: "SUPER_ADMIN" | "ADMIN";
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  subtitle?: string;
  category: string;
  price: number; // in ₹
  originalPrice?: number; // in ₹
  img: string;
  description: string;
  weight: string;
  size: string;
  stock?: number;
}

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
}

export interface Astrologer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  title: string;
  experienceYears: number;
  specialties: string[];
  languages: string[];
  rating: number;
  status: "ACTIVE" | "BLOCKED";
  isOnline: boolean;
  createdAt: string;
}
