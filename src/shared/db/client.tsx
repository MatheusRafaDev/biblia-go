import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { ISqliteDb } from './types';
import { runMigrations } from './migrations';
import { BibleRepository, IBibleRepository } from './repositories/bibleRepository';
import { FavoritesRepository, IFavoritesRepository } from './repositories/favoritesRepository';

interface DatabaseContextValue {
  db: ISqliteDb | null;
  bibleRepository: IBibleRepository | null;
  favoritesRepository: IFavoritesRepository | null;
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  bibleRepository: null,
  favoritesRepository: null,
  isReady: false,
  error: null,
});

export const DB_NAME = 'biblia_go.db';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<ISqliteDb | null>(null);
  const [bibleRepository, setBibleRepository] = useState<IBibleRepository | null>(null);
  const [favoritesRepository, setFavoritesRepository] = useState<IFavoritesRepository | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const sqliteDb = await SQLite.openDatabaseAsync(DB_NAME);
        await runMigrations(sqliteDb);

        if (isMounted) {
          const bRepo = new BibleRepository(sqliteDb);
          const fRepo = new FavoritesRepository(sqliteDb);
          setDb(sqliteDb);
          setBibleRepository(bRepo);
          setFavoritesRepository(fRepo);
          setIsReady(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        db,
        bibleRepository,
        favoritesRepository,
        isReady,
        error,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

export function useBibleRepository(): IBibleRepository {
  const { bibleRepository, isReady } = useDatabase();
  if (!isReady || !bibleRepository) {
    throw new Error('BibleRepository not ready. Database is still initializing.');
  }
  return bibleRepository;
}

export function useFavoritesRepository(): IFavoritesRepository {
  const { favoritesRepository, isReady } = useDatabase();
  if (!isReady || !favoritesRepository) {
    throw new Error('FavoritesRepository not ready. Database is still initializing.');
  }
  return favoritesRepository;
}
