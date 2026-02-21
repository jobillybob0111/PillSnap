import * as path from 'path';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { insertPill } from '../src/lib/db';

const BASE_URL = 'https://www.drugs.com';
const DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          Accept: 'text/html',
        },
      });
      if (res.ok) return await res.text();
    } catch (e) {
      console.error(`Attempt ${i + 1} failed:`, (e as Error).message);
    }
    await delay(2000);
  }
  return '';
}

function extractPillFromDetailPage(html: string, imprint: string): Record<string, string> | null {
  const $ = cheerio.load(html);
  const text = $('body').text();

  const colorMatch = text.match(/(?:Color|colour)\s*[:\s]+(\w+(?:\s*&\s*\w+)?)/i);
  const shapeMatch = text.match(/(?:Shape|shape)\s*[:\s]+([\w\/\-]+)/i);
  const strengthMatch = text.match(/(?:Strength|Dosage)\s*[:\s]+([\d\s\.\/\-]+(?:mg|mcg|g|IU)?(?:\s*\/\s*[\d\s\.\-]+(?:mg|mcg)?)?)/i);
  const drugMatch = text.match(/has been identified as\s+([^.]+?)(?:\s+and is used|\.)/i)
    || text.match(/identified as\s+([^.]+?)(?:\s+and is used|\.)/i);
  const drugClassMatch = text.match(/drug class\s+\[([^\]]+)\]/i);

  const drugName = drugMatch ? drugMatch[1].trim() : '';
  const strength = strengthMatch ? strengthMatch[1].trim() : '';
  const color = colorMatch ? colorMatch[1].trim() : 'Unknown';
  const shape = shapeMatch ? shapeMatch[1].trim() : 'Unknown';
  const drugClass = drugClassMatch ? drugClassMatch[1] : 'Unknown';

  let uses = 'Unknown';
  const usedMatch = text.match(/used for\s+\[([^\]]+)\]/);
  if (usedMatch) {
    const parts = text.match(/\[([^\]]+)\]/g);
    uses = parts ? parts.slice(0, 6).map((p) => p.replace(/[\[\]]/g, '')).join(', ') : uses;
  }

  const img = $('img[src*="pill"]').first().attr('src');
  const imageUrl = img && (img.startsWith('http') || img.startsWith('//'))
    ? (img.startsWith('//') ? 'https:' + img : img)
    : '';

  if (!drugName) return null;

  return {
    imprint,
    color,
    shape,
    drug_name: drugName,
    generic_name: drugName,
    strength: strength || 'Unknown',
    drug_class: drugClass,
    uses,
    image_url: imageUrl,
  };
}

const POPULAR_IMPRINT_LINKS = [
  { imprint: 'L484', url: '/imprints/l484-10944.html' },
  { imprint: 'M367', url: '/imprints/m367-3762.html' },
  { imprint: 'L612', url: '/imprints/l612-22302.html' },
  { imprint: 'K56', url: '/imprints/k-56-15462.html' },
  { imprint: 'AN627', url: '/imprints/an-627-14580.html' },
];

async function main() {
  const { getDb } = await import('../src/lib/db');
  const { pills } = getDb();

  console.log('Scraping drugs.com imprint pages...');
  let count = 0;

  for (const { imprint, url } of POPULAR_IMPRINT_LINKS) {
    const fullUrl = BASE_URL + url;
    process.stdout.write(`  ${imprint}... `);
    const html = await fetchWithRetry(fullUrl);
    await delay(DELAY_MS);

    if (!html) {
      console.log('FAILED');
      continue;
    }

    const pill = extractPillFromDetailPage(html, imprint);
    if (pill) {
      const exists = pills.some((p) => p.imprint === imprint);
      if (!exists) {
        insertPill(pills, pill as any);
        count++;
        console.log('OK');
      } else {
        console.log('SKIP (exists)');
      }
    } else {
      console.log('NO DATA');
    }
  }

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pills.json');
  fs.writeFileSync(dbPath, JSON.stringify(pills, null, 2), 'utf-8');
  console.log(`\nDone. Added ${count} pills. Total: ${pills.length}`);
}

main().catch(console.error);
