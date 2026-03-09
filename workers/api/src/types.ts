export type Bindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  CACHE: KVNamespace;
  APP_ENV: string;
  JWT_ISSUER: string;
  JWT_SECRET: string;
};
