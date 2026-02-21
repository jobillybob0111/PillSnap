import { getDb } from './db';
import type { PillRecord } from './db';

const IMPRINT_WEIGHT = 0.6;
const COLOR_WEIGHT = 0.2;
const SHAPE_WEIGHT = 0.2;

export function normalizeImprint(text: string): string {
  return text
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

export function normalizeFilterValue(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ');
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export function fuzzyImprintScore(search: string, target: string): number {
  const s = normalizeImprint(search);
  const t = normalizeImprint(target);
  if (s === t) return 1;
  if (s.length === 0 || t.length === 0) return 0;
  if (t.includes(s) || s.includes(t)) return 0.9;
  const maxLen = Math.max(s.length, t.length);
  const dist = levenshteinDistance(s, t);
  return 1 - dist / maxLen;
}

export interface MatchResult extends PillRecord {
  confidence: number;
}

export function searchPills(
  imprint: string,
  color?: string,
  shape?: string,
  limit = 3
): MatchResult[] {
  const { pills: all } = getDb();
  const normImprint = normalizeImprint(imprint);
  if (!normImprint) return [];

  const scored = all.map((pill) => {
    let imprintScore = 0;
    const pillNorm = normalizeImprint(pill.imprint);
    if (pillNorm === normImprint) {
      imprintScore = 1;
    } else if (pillNorm.includes(normImprint)) {
      imprintScore = 0.85;
    } else if (normImprint.includes(pillNorm) && pillNorm.length >= 3) {
      imprintScore = 0.7;
    } else {
      imprintScore = Math.max(0, fuzzyImprintScore(imprint, pill.imprint));
      if (normImprint.includes(pillNorm) && pillNorm.length <= 2) {
        imprintScore = Math.min(imprintScore, 0.4);
      }
    }

    const normColor = color ? normalizeFilterValue(color) : '';
    const normShape = shape ? normalizeFilterValue(shape) : '';
    const pillColor = normalizeFilterValue(pill.color);
    const pillShape = normalizeFilterValue(pill.shape);

    let colorScore = 1;
    if (normColor) {
      colorScore = pillColor.includes(normColor) || normColor.includes(pillColor) ? 1 : 0.3;
    }

    let shapeScore = 1;
    if (normShape) {
      const shapeAliases: Record<string, string[]> = {
        'capsule': ['capsule', 'oblong', 'capsule/oblong'],
        'oblong': ['oblong', 'capsule', 'capsule/oblong'],
        'round': ['round', 'circle'],
        'oval': ['oval'],
        'ellipse': ['oval', 'ellipse'],
      };
      const searchTerms = shapeAliases[normShape] || [normShape];
      const pillTerms = pillShape.split(/[\s\/]+/);
      const match = searchTerms.some((s) =>
        pillTerms.some((p) => p.includes(s) || s.includes(p))
      );
      shapeScore = match ? 1 : 0.3;
    }

    const confidence =
      imprintScore * IMPRINT_WEIGHT + colorScore * COLOR_WEIGHT + shapeScore * SHAPE_WEIGHT;

    return { ...pill, confidence };
  });

  return scored
    .filter((r) => r.confidence >= 0.3)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
