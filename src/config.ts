import { MigrationConfig } from "drizzle-orm/migrator";
import { loadEnvFile } from "node:process";

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type APIConfig = {
  fileServerHits: number;
  port: number;
  platform: string;
};

type AuthConfig = {
  secret: string;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
  auth: AuthConfig;
};

loadEnvFile();

export function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) throw Error(`Missing environment variable ${key} is not set`);
  return value;
}

export const config: Config = {
  api: {
    fileServerHits: 0,
    port: Number(envOrThrow("PORT")),
    platform: envOrThrow("PLATFORM"),
  },
  db: { url: envOrThrow("DB_URL"), migrationConfig },
  auth: {
    secret: envOrThrow("SECRET"),
  },
};
