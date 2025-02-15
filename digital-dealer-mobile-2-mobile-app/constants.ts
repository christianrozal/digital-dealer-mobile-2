import Constants from 'expo-constants';

// API Configuration
export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://172.16.20.0:3000';
export const WS_URL = Constants.expoConfig?.extra?.wsUrl || 'ws://172.16.20.0:3000';
// export const API_URL = 'http://localhost:3000';
// export const API_URL = 'https://digital-dealer-mobile-server.vercel.app';

export const INTEREST_STATUS_OPTIONS = ['Hot', 'Warm', 'Cold'];
export const INTEREST_IN_OPTIONS = ['Buying', 'Selling', 'Financing', 'Bought'];