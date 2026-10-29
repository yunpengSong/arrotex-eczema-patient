import { mysqlDb } from "./mysql";
import { postgresDb } from "./postgres";

// Select database type from env; defaults to postgres
const dbType = process.env.DB_TYPE || "postgres";

export const db = dbType === "mysql" ? mysqlDb : postgresDb;
