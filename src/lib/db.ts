import path from 'path';
import fs from 'fs';
import { SEED_PILLS } from './seed-data';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pills.json');

export interface PillRecord {
  id: number;
  imprint: string;
  color: string;
  shape: string;
  drug_name: string;
  generic_name: string;
  strength: string;
  drug_class: string;
  uses: string;
  image_url: string | null;
}

let cache: PillRecord[] | null = null;

function loadPills(): PillRecord[] {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8');
      const pills = JSON.parse(data) as PillRecord[];
      cache = pills;
      return pills;
    } catch {
      /* fall through to seed */
    }
  }
  const pills: PillRecord[] = SEED_PILLS.map((p, i) => ({
    id: i + 1,
    ...p,
    image_url: p.image_url || null,
  }));
  fs.writeFileSync(dbPath, JSON.stringify(pills, null, 2), 'utf-8');
  cache = pills;
  return pills;
}

export function getDb(): { pills: PillRecord[] } {
  return { pills: loadPills() };
}

export function insertPill(pills: PillRecord[], pill: Omit<PillRecord, 'id'>) {
  const id = pills.length > 0 ? Math.max(...pills.map((p) => p.id)) + 1 : 1;
  pills.push({ id, ...pill, image_url: pill.image_url || null });
}
