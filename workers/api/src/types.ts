export type Bindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  CACHE: KVNamespace;
  APP_ENV: string;
  JWT_ISSUER: string;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_BUSINESS_ACCOUNT_ID: string;
  WHATSAPP_DEFAULT_COUNTRY_CODE: string;
  WHATSAPP_REGISTRATION_PIN: string;
};

export type AuthUser = {
  user_id: string;
  email: string;
  full_name: string | null;
  phone?: string | null;
  role: "buyer" | "seller" | "admin";
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: {
    authUser: AuthUser;
  };
};
