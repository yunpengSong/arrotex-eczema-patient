import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import type {
  CreateUserData,
  Db,
  DbAutoLoginTokenRow,
  DbUserRow,
} from "./db-types";

// Create the SQL client
let sql: ReturnType<typeof neon> | undefined;
let initialized = false;

export function getSql() {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL || "");
  }
  return sql;
}

// Initialize database tables
export async function initDatabase() {
  if (initialized) return;
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set, skipping database init");
    return;
  }

  const sql = getSql();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        title VARCHAR(50),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auto_login_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        used BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    // Add test user
    const testEmail = "test@test.com";
    const testPassword = "123456";
    const result = (await sql`SELECT id FROM users WHERE email = ${testEmail}`) as { id: number }[];

    if (result.length === 0) {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await sql`
        INSERT INTO users (email, password, title, first_name, last_name)
        VALUES (${testEmail}, ${hashedPassword}, ${"Dr"}, ${"Test"}, ${"User"})
      `;
      console.log(`Test user created: ${testEmail} / ${testPassword}`);
    }

    console.log("Database initialized.");
    initialized = true;
  } catch (error) {
    console.error("Database init error:", error);
  }
}

// PostgreSQL implementation of db
export const postgresDb: Db = {
  users: {
    create: async (data: CreateUserData) => {
      await initDatabase();
      const sql = getSql();
      const result = (await sql`
        INSERT INTO users (title, first_name, last_name, email, password)
        VALUES (${data.title}, ${data.firstName}, ${data.lastName}, ${data.email}, ${data.password})
        RETURNING id
      `) as { id: number }[];
      return { id: result[0].id, email: data.email };
    },
    findUnique: async ({ where }) => {
      await initDatabase();
      const sql = getSql();
      if (where.email) {
        const result = (await sql`SELECT * FROM users WHERE email = ${where.email}`) as DbUserRow[];
        return result[0] || null;
      }
      if (where.id) {
        const result = (await sql`SELECT * FROM users WHERE id = ${where.id}`) as DbUserRow[];
        return result[0] || null;
      }
      return null;
    },
  },
  autoLoginTokens: {
    create: async (data) => {
      await initDatabase();
      const sql = getSql();
      const result = (await sql`
        INSERT INTO auto_login_tokens (user_id, token, expires_at)
        VALUES (${data.userId}, ${data.token}, ${data.expiresAt})
        RETURNING id
      `) as { id: number }[];
      return { id: result[0].id, token: data.token };
    },
    findUnique: async ({ where }) => {
      await initDatabase();
      const sql = getSql();
      if (where.token) {
        const result = (await sql`
          SELECT * FROM auto_login_tokens WHERE token = ${where.token}
        `) as DbAutoLoginTokenRow[];
        return result[0] || null;
      }
      return null;
    },
    markAsUsed: async (id) => {
      await initDatabase();
      const sql = getSql();
      await sql`
        UPDATE auto_login_tokens SET used = true WHERE id = ${id}
      `;
    },
  },
};
