import { describe, it, expect } from 'vitest';
import { updateRecentPassages, RecentPassage } from '@/src/shared/stores/useReaderStore';

describe('updateRecentPassages', () => {
  it('adds a new passage to the front of the list', () => {
    const initial: RecentPassage[] = [{ bookId: 1, chapter: 1, timestamp: 1000 }];
    const result = updateRecentPassages(initial, 43, 3); // John 3

    expect(result).toHaveLength(2);
    expect(result[0].bookId).toBe(43);
    expect(result[0].chapter).toBe(3);
    expect(result[1].bookId).toBe(1);
    expect(result[1].chapter).toBe(1);
  });

  it('moves existing passage to the front without duplicates', () => {
    const initial: RecentPassage[] = [
      { bookId: 19, chapter: 23, timestamp: 1000 },
      { bookId: 43, chapter: 3, timestamp: 900 },
      { bookId: 1, chapter: 1, timestamp: 800 },
    ];

    const result = updateRecentPassages(initial, 43, 3);

    expect(result).toHaveLength(3);
    expect(result[0].bookId).toBe(43);
    expect(result[0].chapter).toBe(3);
    expect(result[1].bookId).toBe(19);
    expect(result[2].bookId).toBe(1);
  });

  it('respects the max limit and discards older passages', () => {
    let list: RecentPassage[] = [];
    for (let i = 1; i <= 10; i++) {
      list = updateRecentPassages(list, i, 1, 5);
    }

    expect(list).toHaveLength(5);
    expect(list[0].bookId).toBe(10);
    expect(list[4].bookId).toBe(6);
  });
});
