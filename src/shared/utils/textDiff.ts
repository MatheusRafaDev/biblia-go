export type DiffType = 'equal' | 'added' | 'removed';

export interface DiffToken {
  value: string;
  type: DiffType;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

/**
 * Computes word-by-word diff between baseText and compareText using LCS (Longest Common Subsequence).
 */
export function computeWordDiff(
  baseText: string,
  compareText: string
): {
  baseTokens: DiffToken[];
  compareTokens: DiffToken[];
} {
  const baseWords = baseText.trim().split(/\s+/).filter(Boolean);
  const compareWords = compareText.trim().split(/\s+/).filter(Boolean);

  const m = baseWords.length;
  const n = compareWords.length;

  if (m === 0 && n === 0) {
    return { baseTokens: [], compareTokens: [] };
  }

  // Build LCS matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    const normBase = normalizeWord(baseWords[i - 1]);
    for (let j = 1; j <= n; j++) {
      const normCompare = normalizeWord(compareWords[j - 1]);
      if (normBase && normCompare && normBase === normCompare) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find aligned tokens
  let i = m;
  let j = n;

  const revBase: DiffToken[] = [];
  const revCompare: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      normalizeWord(baseWords[i - 1]) === normalizeWord(compareWords[j - 1])
    ) {
      revBase.push({ value: baseWords[i - 1], type: 'equal' });
      revCompare.push({ value: compareWords[j - 1], type: 'equal' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      revCompare.push({ value: compareWords[j - 1], type: 'added' });
      j--;
    } else if (i > 0) {
      revBase.push({ value: baseWords[i - 1], type: 'removed' });
      i--;
    }
  }

  return {
    baseTokens: revBase.reverse(),
    compareTokens: revCompare.reverse(),
  };
}

