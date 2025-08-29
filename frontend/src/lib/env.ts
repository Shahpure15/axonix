// src/lib/env.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:5000/auth';
// Add more exports as needed for other env variables
