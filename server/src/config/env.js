// Environment variables with defaults

export const env = {
  PORT: process.env.PORT || 3001,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',

  get isDev() {
    return this.NODE_ENV === 'development';
  },

  get isProd() {
    return this.NODE_ENV === 'production';
  },
};
