// Centralized API configuration
// Strips any trailing slash to ensure clean URL construction
const rawApiBase = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = rawApiBase.replace(/\/+$/, '');
