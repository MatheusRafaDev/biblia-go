import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  createDatabaseSnapshot,
  listDatabaseSnapshots,
  generateSnapshotFilename,
} from '../src/utils/databaseSnapshot';

describe('databaseSnapshot', () => {
  let tempDir: string;
  let sourceDbPath: string;
  let backupDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'biblia-test-backup-'));
    sourceDbPath = path.join(tempDir, 'source.db');
    backupDir = path.join(tempDir, 'backups');
    fs.writeFileSync(sourceDbPath, 'FAKE_SQLITE_HEADER_CONTENT');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('generates filename with custom prefix and timestamp', () => {
    const filename = generateSnapshotFilename('test_db');
    expect(filename).toMatch(/^test_db_.*\.db$/);
  });

  it('creates database snapshot file in designated directory', async () => {
    const snapshot = await createDatabaseSnapshot(sourceDbPath, backupDir);

    expect(fs.existsSync(snapshot.filepath)).toBe(true);
    expect(snapshot.sizeBytes).toBeGreaterThan(0);
    expect(snapshot.filename.endsWith('.db')).toBe(true);
  });

  it('lists existing snapshot backups in descending order', async () => {
    await createDatabaseSnapshot(sourceDbPath, backupDir);
    const snapshots = listDatabaseSnapshots(backupDir);

    expect(snapshots.length).toBe(1);
    expect(snapshots[0].filename).toMatch(/\.db$/);
  });

  it('throws error when source database file does not exist', async () => {
    await expect(
      createDatabaseSnapshot(path.join(tempDir, 'non_existent.db'), backupDir)
    ).rejects.toThrow('não encontrado');
  });
});
