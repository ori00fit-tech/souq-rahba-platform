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
