import { env } from "~/config/environment";

export const WHITELIST_DOMAINS: string[] = [
  "http://localhost:4173",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8000",
];

export const USER_ROLES = {
  ADMIN: "admin",
  OWNER: "owner",
  TENANT: "tenant",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === "production"
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT;
