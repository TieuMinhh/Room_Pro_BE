import 'dotenv/config'

interface Env {
  MONGODB_URI: string;
  DATABASE_NAME: string;
  APP_HOST: string;
  APP_POST: number;
  BUILD_MODE: string;
  AUTHOR: string;
  MAIL_ACCOUNT: string;
  MAIL_PASSWORD: string;
  WEBSITE_DOMAIN_DEVELOPMENT: string;
  WEBSITE_DOMAIN_PRODUCTION: string;
  ACCESS_TOKEN_SECRET_SIGNATURE: string;
  ACCESS_TOKEN_LIFE: string;
  REFRESH_TOKEN_SECRET_SIGNATURE: string;
  REFRESH_TOKEN_LIFE: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  VNPAY_TMN_CODE: string;
  SECURE_SECRET: string;
  VNPAY_HOST: string;
  ADMIN_USER_ID: string;
}

export const env: Env = {
  MONGODB_URI: process.env.MONGODB_URI as string,
  DATABASE_NAME: process.env.DATABASE_NAME as string,
  APP_HOST: process.env.APP_HOST as string,
  APP_POST: Number(process.env.APP_POST) || 8081,
  BUILD_MODE: process.env.BUILD_MODE as string,
  AUTHOR: process.env.AUTHOR as string,
  MAIL_ACCOUNT: process.env.MAIL_ACCOUNT as string,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD as string,
  WEBSITE_DOMAIN_DEVELOPMENT: process.env.WEBSITE_DOMAIN_DEVELOPMENT as string,
  WEBSITE_DOMAIN_PRODUCTION: process.env.WEBSITE_DOMAIN_PRODUCTION as string,
  ACCESS_TOKEN_SECRET_SIGNATURE: process.env.ACCESS_TOKEN_SECRET_SIGNATURE as string,
  ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE as string,
  REFRESH_TOKEN_SECRET_SIGNATURE: process.env.REFRESH_TOKEN_SECRET_SIGNATURE as string,
  REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE as string,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE as string,
  SECURE_SECRET: process.env.SECURE_SECRET as string,
  VNPAY_HOST: process.env.VNPAY_HOST as string,
  ADMIN_USER_ID: process.env.ADMIN_USER_ID as string
}
