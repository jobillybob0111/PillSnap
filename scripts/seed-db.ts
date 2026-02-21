import * as path from 'path';
import * as fs from 'fs';
import { SEED_PILLS } from '../src/lib/seed-data';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pills.json');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const pills = SEED_PILLS.map((p, i) => ({
  id: i + 1,
  ...p,
  image_url: p.image_url || null,
}));

fs.writeFileSync(dbPath, JSON.stringify(pills, null, 2), 'utf-8');
console.log(`Seeded ${pills.length} pills into ${dbPath}`);
