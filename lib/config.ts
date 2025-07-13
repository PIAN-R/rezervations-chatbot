// Configuration file for API settings and environment variables

export const config = {
  // Amadeus API Configuration
  amadeus: {
    clientId: process.env.AMADEUS_CLIENT_ID || '',
    clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
    production: process.env.AMADEUS_PRODUCTION === 'true',
    baseUrl: process.env.AMADEUS_PRODUCTION === 'true' 
      ? 'https://api.amadeus.com' 
      : 'https://test.api.amadeus.com',
    retryAttempts: 5,
    retryDelay: 1000, // milliseconds
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
    urlUnpooled: process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || '',
  },

  // Authentication Configuration
  auth: {
    secret: process.env.AUTH_SECRET || '',
  },

  // Application Configuration
  app: {
    name: 'Avion Chatbot',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // API Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Flight Search Configuration
  flights: {
    defaultCurrency: 'USD',
    defaultPassengers: 1,
    maxResults: 10,
    searchDaysAhead: 1, // Search for flights starting tomorrow
  },

  // Error Messages
  errors: {
    amadeusConnection: 'Unable to connect to flight search service. Please try again later.',
    amadeusAuthentication: 'Flight search service authentication failed.',
    amadeusNoResults: 'No flights found for the specified criteria.',
    generalError: 'An unexpected error occurred. Please try again.',
    invalidInput: 'Please provide valid flight search criteria.',
  },

  // Success Messages
  success: {
    flightFound: 'Flights found successfully!',
    reservationCreated: 'Reservation created successfully!',
    paymentProcessed: 'Payment processed successfully!',
  },
};

// Validation functions
export const validateConfig = () => {
  const requiredEnvVars = [
    'AMADEUS_CLIENT_ID',
    'AMADEUS_CLIENT_SECRET',
    'OPENAI_API_KEY',
    'DATABASE_URL',
    'AUTH_SECRET',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    return false;
  }

  return true;
};

// Helper functions
export const isProduction = () => config.app.environment === 'production';
export const isDevelopment = () => config.app.environment === 'development';
export const isTest = () => config.app.environment === 'test';

export default config; 