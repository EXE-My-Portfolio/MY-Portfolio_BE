export interface ENV {
  HOST: string | undefined;
  PORT: number | undefined;
  NODE_ENV: string | undefined;
  CONTEXT_PATH: string | undefined;
  JWT_KEY: string | undefined;
  MONGO_URL: string | undefined;
  DB_HOST: string | undefined;
  DB_PORT: string | undefined;
  DB_USERNAME: string | undefined;
  DB_PASSWORD: string | undefined;
  JWT_SECRET_KEY: string | undefined;
}
