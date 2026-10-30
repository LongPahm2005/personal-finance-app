import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';
import type { RowDataPacket, Pool, PoolConnection } from './types';

// Tải cấu hình từ file .env ở thư mục gốc của project
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '123456';
    const database = process.env.DB_NAME || 'personal_finance';

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      decimalNumbers: true, // Tự động convert DECIMAL sang number
      dateStrings: true,    // Trả về ngày tháng dạng string để giữ nguyên định dạng
    });
  }
  return pool;
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const currentPool = getPool();
    const [rows] = await currentPool.query<RowDataPacket[]>('SELECT 1 AS connected');
    if (rows && rows.length > 0) {
      const host = process.env.DB_HOST || 'localhost';
      const port = process.env.DB_PORT || 3306;
      const db = process.env.DB_NAME || 'personal_finance';
      return {
        success: true,
        message: `Kết nối MySQL thành công tới database [${db}] tại ${host}:${port}`,
      };
    }
    throw new Error('Không nhận được phản hồi từ máy chủ MySQL.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Lỗi kết nối MySQL:', message);
    return { success: false, message: `Lỗi kết nối MySQL: ${message}` };
  }
}

export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const currentPool = getPool();
  const connection = await currentPool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Đã đóng kết nối MySQL Pool.');
  }
}
