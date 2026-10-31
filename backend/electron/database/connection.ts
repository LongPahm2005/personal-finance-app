import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';
import type { RowDataPacket, Pool, PoolConnection } from './types';
import { initializeSchema } from './init_schema';

// Tải cấu hình từ file .env ở thư mục gốc của project
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

let pool: Pool | null = null;

/**
 * Tự động kiểm tra và khởi tạo Database + 17 bảng nếu mang sang máy mới chưa có DB
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '123456';
  const database = process.env.DB_NAME || 'personal_finance';

  let serverConn: mysql.Connection | null = null;
  try {
    // 1. Kết nối cấp server không chỉ định DB để tránh lỗi Unknown Database
    serverConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    // 2. Tự động tạo Database nếu máy mới chưa có
    await serverConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    // 3. Chuyển ngữ cảnh vào database
    await serverConn.query(`USE \`${database}\`;`);

    // 4. Kiểm tra xem đã có bảng chưa
    const [tables] = await serverConn.query<RowDataPacket[]>("SHOW TABLES LIKE 'categories'");
    if (!tables || tables.length === 0) {
      console.log(`[Auto-Init] Phát hiện máy mới chưa có bảng trong database [${database}]. Đang tự động nạp 17 bảng...`);
      await initializeSchema(serverConn);
    } else {
      console.log(`[Auto-Init] Database [${database}] đã có bảng nghiệp vụ. Giữ nguyên schema hiện có.`);
    }
  } catch (err) {
    console.error('[Auto-Init Error] Không thể tự động kiểm tra/tạo database:', err);
  } finally {
    if (serverConn) {
      await serverConn.end().catch(() => {});
    }
  }
}

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
