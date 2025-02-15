// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Note: We prefix with NEXT_PUBLIC_ to make it available on the client side
// The fallback value is used if the environment variable is not set