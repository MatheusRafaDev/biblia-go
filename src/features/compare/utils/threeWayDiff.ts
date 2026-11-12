export interface ThreeWayDiffResult {
  baseTranslation: string;
  comparedTranslations: string[];
  commonTokens: string[];
  uniqueTokensPerTranslation: Record<string, string[]>;
  similarityScore: {
    firstToSecond: number;
    firstToThird: number;
    secondToThird: number;
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 1.0 : Math.round((intersectionCount / unionSize) * 100) / 100;
}

export function computeThreeWayDiff(
  transA: { id: string; text: string },
  transB: { id: string; text: string },
  transC: { id: string; text: string }
): ThreeWayDiffResult {
  const tokensA = tokenize(transA.text);
  const tokensB = tokenize(transB.text);
  const tokensC = tokenize(transC.text);

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const setC = new Set(tokensC);

  // Common tokens present in all 3
  const common = Array.from(setA).filter((t) => setB.has(t) && setC.has(t));

  // Unique tokens strictly in one translation
  const uniqueA = Array.from(setA).filter((t) => !setB.has(t) && !setC.has(t));
  const uniqueB = Array.from(setB).filter((t) => !setA.has(t) && !setC.has(t));
  const uniqueC = Array.from(setC).filter((t) => !setA.has(t) && !setB.has(t));

  return {
    baseTranslation: transA.id,
    comparedTranslations: [transB.id, transC.id],
    commonTokens: common,
    uniqueTokensPerTranslation: {
      [transA.id]: uniqueA,
      [transB.id]: uniqueB,
      [transC.id]: uniqueC,
    },
    similarityScore: {
      firstToSecond: calculateJaccardSimilarity(setA, setB),
      firstToThird: calculateJaccardSimilarity(setA, setC),
      secondToThird: calculateJaccardSimilarity(setB, setC),
    },
  };
}
