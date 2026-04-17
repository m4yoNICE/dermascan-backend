import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT,
  HOST: process.env.DB_HOST,
  DATABASE: process.env.DB_DATABASE,
  DB_PORT: process.env.DB_PORT,
  USERNAME: process.env.DB_USERNAME,
  PASSWORD: process.env.DB_PASSWORD || undefined,
  JWT_SECRET: process.env.JWT_SECRET,
  OTP_USER: process.env.OTP_USER,
  OTP_PASSWORD_OTP: process.env.OTP_PASSWORD_OTP,
  BASE_URL: process.env.BASE_URL,
  AI_API_URL: process.env.AI_API_URL || "http://127.0.0.1:7860",
  HF_TOKEN: process.env.HF_TOKEN,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
};
