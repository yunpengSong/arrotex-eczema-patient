import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";
import type {
  CreateUserData,
  Db,
  DbAutoLoginTokenRow,
  DbUserRow,
} from "./db-types";

// MySQL connection config
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "storyblok",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // PlanetScale requires SSL
  ssl:
    process.env.MYSQL_HOST && process.env.MYSQL_HOST !== "localhost"
      ? { rejectUnauthorized: true }
      : undefined,
};

// Create connection pool
let pool: Pool | undefined;
let initialized = false;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Initialize database tables
export async function initDatabase() {
  if (initialized) return;

  const connection = await getPool().getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(50),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS auto_login_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        used BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Migration: add new columns (if missing)
    const [columns] = await connection.query<RowDataPacket[]>(
      "SHOW COLUMNS FROM users LIKE 'title'",
    );
    if (columns.length === 0) {
      await connection.query("ALTER TABLE users ADD COLUMN title VARCHAR(50) AFTER id");
      await connection.query("ALTER TABLE users ADD COLUMN first_name VARCHAR(255) AFTER title");
      await connection.query("ALTER TABLE users ADD COLUMN last_name VARCHAR(255) AFTER first_name");
      console.log("Added new columns to users table");
    }

    // Add test user
    const testEmail = "test@test.com";
    const testPassword = "123456";
    const [existing] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [testEmail],
    );

    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await connection.query(
        "INSERT INTO users (email, password, title, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
        [testEmail, hashedPassword, "Dr", "Test", "User"],
      );
      console.log(`Test user created: ${testEmail} / ${testPassword}`);
    }

    console.log("Database initialized.");
    initialized = true;
  } finally {
    connection.release();
  }
}

// MySQL implementation of db
export const mysqlDb: Db = {
  users: {
    create: async (data: CreateUserData) => {
      await initDatabase();
      const pool = getPool();
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO users (title, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)",
        [data.title, data.firstName, data.lastName, data.email, data.password],
      );
      return { id: result.insertId, email: data.email };
    },
    findUnique: async ({ where }) => {
      await initDatabase();
      const pool = getPool();
      if (where.email) {
        const [rows] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM users WHERE email = ?",
          [where.email],
        );
        return (rows[0] as DbUserRow) || null;
      }
      if (where.id) {
        const [rows] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM users WHERE id = ?",
          [where.id],
        );
        return (rows[0] as DbUserRow) || null;
      }
      return null;
    },
  },
  autoLoginTokens: {
    create: async (data) => {
      await initDatabase();
      const pool = getPool();
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO auto_login_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
        [data.userId, data.token, data.expiresAt],
      );
      return { id: result.insertId, token: data.token };
    },
    findUnique: async ({ where }) => {
      await initDatabase();
      const pool = getPool();
      if (where.token) {
        const [rows] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM auto_login_tokens WHERE token = ?",
          [where.token],
        );
        return (rows[0] as DbAutoLoginTokenRow) || null;
      }
      return null;
    },
    markAsUsed: async (id) => {
      await initDatabase();
      const pool = getPool();
      await pool.query("UPDATE auto_login_tokens SET used = true WHERE id = ?", [id]);
    },
  },
};
