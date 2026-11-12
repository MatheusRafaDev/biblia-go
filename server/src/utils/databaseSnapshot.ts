import fs from 'node:fs';
import path from 'node:path';

export interface SnapshotInfo {
  filename: string;
  filepath: string;
  sizeBytes: number;
  createdAt: Date;
}

export function generateSnapshotFilename(prefix = 'biblia_server_backup'): string {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-');
  return `${prefix}_${dateStr}.db`;
}

export async function createDatabaseSnapshot(
  sourceDbPath: string,
  targetDirectory: string
): Promise<SnapshotInfo> {
  if (!fs.existsSync(sourceDbPath)) {
    throw new Error(`Arquivo de banco de dados não encontrado em: ${sourceDbPath}`);
  }

  if (!fs.existsSync(targetDirectory)) {
    fs.mkdirSync(targetDirectory, { recursive: true });
  }

  const filename = generateSnapshotFilename();
  const destinationPath = path.join(targetDirectory, filename);

  // Copy file atomically
  fs.copyFileSync(sourceDbPath, destinationPath);
  const stats = fs.statSync(destinationPath);

  return {
    filename,
    filepath: destinationPath,
    sizeBytes: stats.size,
    createdAt: stats.birthtime,
  };
}

export function listDatabaseSnapshots(targetDirectory: string): SnapshotInfo[] {
  if (!fs.existsSync(targetDirectory)) {
    return [];
  }

  const files = fs.readdirSync(targetDirectory);
  return files
    .filter((f) => f.endsWith('.db'))
    .map((f) => {
      const fullPath = path.join(targetDirectory, f);
      const stat = fs.statSync(fullPath);
      return {
        filename: f,
        filepath: fullPath,
        sizeBytes: stat.size,
        createdAt: stat.birthtime,
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
