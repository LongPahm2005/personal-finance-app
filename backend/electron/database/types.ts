import type {
  RowDataPacket as MySqlRowDataPacket,
  ResultSetHeader as MySqlResultSetHeader,
  PoolConnection as MySqlPoolConnection,
  Pool as MySqlPool,
} from 'mysql2/promise';

export type RowValue = string | number | bigint | Uint8Array | null;

export type RowDataPacket = MySqlRowDataPacket;
export type ResultSetHeader = MySqlResultSetHeader;
export type PoolConnection = MySqlPoolConnection;
export type Pool = MySqlPool;
