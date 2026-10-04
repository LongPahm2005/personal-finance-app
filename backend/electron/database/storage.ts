import { app } from 'electron';
import path from 'path';

export function getDatabasePath(): string {
  return path.join(app.getPath('userData'), 'personal_finance.sqlite');
}
