export type RowValue = string | number | bigint | Uint8Array | null;

export type RowDataPacket = Record<string, RowValue>;

export interface ResultSetHeader {
  affectedRows: number;
  changedRows: number;
  insertId: number;
  warningStatus: number;
}
