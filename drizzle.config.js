import { ENV } from "./src/config/env.js";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.js",
  dbCredentials: {
    host: ENV.HOST,
    port: ENV.DB_PORT,
    user: ENV.USERNAME,
    password: ENV.PASSWORD,
    database: ENV.DATABASE,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
});
