import { ENV } from "./env.js";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.js";
import * as relations from "../drizzle/relations.js";
export const connection = mysql.createPool({
  host: ENV.HOST,
  port: ENV.DB_PORT,
  user: ENV.USERNAME,
  password: ENV.PASSWORD || "",
  database: ENV.DATABASE,
});

async function testConnection() {
  try {
    const conn = await connection.getConnection();
    console.log("Connected to the database!");
    conn.release();
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.error("BOGO! TURN ON THE MYSQL. The backend won't run");
    } else if (err.code === "ETIMEDOUT") {
      console.error("Database connection timeout. Check your MySQL server.");
    } else if (err.code === "ER_BAD_DB_ERROR") {
      console.error(
        "Database does not exist. Create 'derma_care' database first.",
      );
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("Access denied. Check MySQL username/password.");
    } else {
      console.error("DB connection failed:", err.message);
    }
    process.exit(1);
  }
}
testConnection();

export const db = drizzle(connection, {
  schema: { ...schema, ...relations },
  mode: "default",
});
