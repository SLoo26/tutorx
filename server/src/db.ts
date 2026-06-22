import mysql from 'mysql2/promise';
import { config } from './config';

/** Shared connection pool used by all routes. */
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  dateStrings: true,
});

// Params may be a positional array or a named-placeholder object.
type Params = any;

/** Run a SELECT and get typed rows back. */
export async function query<T = any>(sql: string, params?: Params): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/** Run an INSERT/UPDATE/DELETE and get the result header (insertId, affectedRows). */
export async function execute(sql: string, params?: Params): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}
