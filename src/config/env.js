const requiredEnvVars = [
  'VITE_API_URL',
];

const missing = requiredEnvVars.filter((key) => !import.meta.env[key]);

if (import.meta.env.PROD && missing.length > 0) {
  console.error(
    `[UniCRM] Missing required environment variables: ${missing.join(', ')}. ` +
    'The application may not function correctly.'
  );
}

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};
