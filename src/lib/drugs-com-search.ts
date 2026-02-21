import * as cheerio from 'cheerio';

export interface DrugSearchResult {
  drug_name: string;
  generic_name: string;
  strength: string;
  drug_class: string;
  uses: string;
  image_url: string | null;
  imprint: string;
  color: string;
  shape: string;
  confidence: number;
  detail_url?: string;
}

const CACHE = new Map<string, { results: DrugSearchResult[]; ts: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30;

function cacheKey(imprint: string, color?: string, shape?: string): string {
  return `${imprint.toLowerCase().replace(/\s+/g, '')}|${(color || '').toLowerCase()}|${(shape || '').toLowerCase()}`;
}

function normalize(t: string): string {
  return t.toLowerCase().trim();
}

function scoreResult(
  pill: { imprint: string; color: string; shape: string },
  searchImprint: string,
  searchColor?: string,
  searchShape?: string
): number {
  const impNorm = (s: string) => s.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
  const pillImp = impNorm(pill.imprint);
  const searchImp = impNorm(searchImprint);

  let imprintScore = 0.5;
  if (pillImp === searchImp) imprintScore = 1;
  else if (pillImp.includes(searchImp) && searchImp.length >= 2) imprintScore = 0.9;
  else if (searchImp.includes(pillImp) && pillImp.length >= 3) imprintScore = 0.75;

  let colorScore = 1;
  if (searchColor) {
    const pc = normalize(pill.color);
    const sc = normalize(searchColor);
    colorScore = pc.includes(sc) || sc.includes(pc) ? 1 : 0.35;
  }

  let shapeScore = 1;
  if (searchShape) {
    const aliases: Record<string, string[]> = {
      capsule: ['capsule', 'oblong'],
      oblong: ['oblong', 'capsule'],
      oval: ['oval'],
      round: ['round'],
    };
    const ps = normalize(pill.shape);
    const ss = normalize(searchShape);
    const terms = aliases[ss] || [ss];
    shapeScore = terms.some((t) => ps.includes(t)) ? 1 : 0.35;
  }

  return imprintScore * 0.6 + colorScore * 0.2 + shapeScore * 0.2;
}

// drugs.com returns 403 for minimal/bot-like headers; use full browser-like headers so they allow the request
const FETCH_OPTS: RequestInit = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.drugs.com/imprints.php',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
  },
};

async function searchByMainSearch(
  imprint: string,
  color?: string,
  shape?: string,
  limit = 10
): Promise<DrugSearchResult[]> {
  const query = [imprint.trim(), color, shape].filter(Boolean).join(' ');
  const url = `https://www.drugs.com/search.php?searchterm=${encodeURIComponent(query)}`;
  let html: string;
  try {
    const res = await fetch(url, FETCH_OPTS);
    if (!res.ok) return [];
    html = await res.text();
    if (html.includes('Access Denied') || html.includes('Blocked')) return [];
  } catch {
    return [];
  }

  const results: DrugSearchResult[] = [];
  const seen = new Set<string>();

  const $ = cheerio.load(html);

  $('a[href*="/imprints/"]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href');
    const linkText = $a.text().trim().replace(/\s+/g, ' ');
    if (!href || !linkText) return;

    const $result = $a.closest('div[class*="result"], li, article, .search-result, .ddc-search-result');
    const $block = $result.length ? $result.first() : $a.parent();
    const blockText = $block.text();

    const pillTitleMatch = blockText.match(/([A-Z0-9\s\-]+)\s+Pill\s+(\w+)\s+(Round|Oval|Capsule|Oblong|[^\s]+)\s+\d*mm?\s*-?\s*Pill Identifier/i)
      || linkText.match(/([A-Z0-9\s\-]+)\s+Pill/i);
    const imprintFromTitle = pillTitleMatch ? pillTitleMatch[1].trim().replace(/\s+/g, ' ') : linkText;

    const identifiedMatch = blockText.match(/has been identified as\s+([^.]+?)(?:\s+and is used|\.)/i);
    if (!identifiedMatch) return;

    const drugPart = identifiedMatch[1].trim();
    const strengthMatch = drugPart.match(/(.+?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|mEq|%)(?:\s*\/\s*[\d\.]+\s*(?:mg|mcg))?)\s*$/i);
    const drugName = strengthMatch ? strengthMatch[1].trim() : drugPart;
    const strength = strengthMatch ? strengthMatch[2].trim() : '';

    const usedMatch = blockText.match(/used for\s+([^.]+?)(?:\s*\.|It belongs)/i);
    const uses = usedMatch ? usedMatch[1].trim() : 'See drug details';

    const classMatch = blockText.match(/drug class\s+([^.]+?)(?:\s+and is not|\.)/i);
    const drugClass = classMatch ? classMatch[1].trim() : 'See drug details';

    const colorShapeMatch = blockText.match(/\((\w+),\s*(Round|Oval|Capsule\/Oblong|[^)]+)\)/i)
      || blockText.match(/Pill\s+(\w+)\s+(Round|Oval|Capsule)/i);
    const pillColor = colorShapeMatch ? colorShapeMatch[1].trim() : '';
    const pillShape = colorShapeMatch ? colorShapeMatch[2].trim() : '';

    const key = `${imprintFromTitle}|${drugName}|${strength}`;
    if (seen.has(key)) return;
    seen.add(key);

    const detailUrl = href.startsWith('http') ? href : `https://www.drugs.com${href.startsWith('/') ? '' : '/'}${href}`;
    const confidence = scoreResult(
      { imprint: imprintFromTitle, color: pillColor, shape: pillShape },
      imprint,
      color,
      shape
    );

    results.push({
      drug_name: drugName,
      generic_name: drugName,
      strength,
      drug_class: drugClass,
      uses,
      image_url: null,
      imprint: imprintFromTitle,
      color: pillColor || 'Unknown',
      shape: pillShape || 'Unknown',
      confidence,
      detail_url: detailUrl,
    });
  });

  const regexIdentified = /has been identified as\s+([^.]+?)(?:\s+and is used|\.)/gi;
  let m;
  while ((m = regexIdentified.exec(html)) !== null) {
    const context = html.slice(Math.max(0, m.index - 200), m.index + 600);
    const imprintLinkMatch = context.match(/href="(\/imprints\/[^"]+\.html)"/);
    const titleMatch = context.match(/>([A-Z0-9\s\-]+)\s+Pill\s+[\w\s]+\d*mm?/i);
    const imprintFromTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    if (!imprintLinkMatch) continue;

    const drugPart = m[1].trim();
    const strengthMatch = drugPart.match(/(.+?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|mEq|%)?)\s*$/i);
    const drugName = strengthMatch ? strengthMatch[1].trim() : drugPart;
    const strength = strengthMatch ? strengthMatch[2].trim() : '';

    const usedMatch = context.match(/used for\s+([^.]+?)(?:\s*\.|It belongs)/i);
    const classMatch = context.match(/drug class\s+([^.]+?)(?:\s+and is not|\.)/i);
    const colorMatch = context.match(/\((\w+),\s*(Round|Oval|Capsule[^)]*)\)/i);

    const key = `${imprintFromTitle || drugName}|${drugName}|${strength}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const detailUrl = `https://www.drugs.com${imprintLinkMatch[1]}`;
    const pillColor = colorMatch ? colorMatch[1].trim() : '';
    const pillShape = colorMatch ? colorMatch[2].trim() : '';

    results.push({
      drug_name: drugName,
      generic_name: drugName,
      strength,
      drug_class: classMatch ? classMatch[1].trim() : 'See drug details',
      uses: usedMatch ? usedMatch[1].trim() : 'See drug details',
      image_url: null,
      imprint: imprintFromTitle || imprint,
      color: pillColor || 'Unknown',
      shape: pillShape || 'Unknown',
      confidence: scoreResult(
        { imprint: imprintFromTitle || imprint, color: pillColor, shape: pillShape },
        imprint,
        color,
        shape
      ),
      detail_url: detailUrl,
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}

async function searchByImprintPage(
  imprint: string,
  color?: string,
  shape?: string,
  limit = 10
): Promise<DrugSearchResult[]> {
  const params = new URLSearchParams();
  params.set('imprint', imprint.trim());
  if (color) params.set('color', color);
  if (shape) params.set('shape', shape);

  const url = `https://www.drugs.com/imprints.php?${params.toString()}`;
  let html = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, FETCH_OPTS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
      if (html.includes('Access Denied') || html.includes('Blocked')) throw new Error('Blocked');
      break;
    } catch (e) {
      if (attempt === 1) throw e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  const $ = cheerio.load(html);
  const results: DrugSearchResult[] = [];
  const seen = new Set<string>();

  $('a[href*="/imprints/"]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href');
    const impText = $a.text().trim().replace(/\s+/g, ' ');
    if (!impText) return;

    const $block = $a.closest('div[class*="card"], div[class*="result"], li, article').length
      ? $a.closest('div[class*="card"], div[class*="result"], li, article').first()
      : $a.parent();
    const blockText = $block.text();

    let drugName = $block.find('a[href*="drugs.com"]').not('[href*="/imprints/"]').first().text().trim();
    if (!drugName) {
      const mx = blockText.match(/([A-Z][A-Za-z\s\-\.]+(?:Hydrochloride|Bitartrate|Sulfate|Sodium|ER)?)\s+Strength/i);
      drugName = mx ? mx[1].trim() : '';
    }
    if (!drugName || drugName.length < 3) return;

    const strengthMatch = blockText.match(/Strength\s*([^\s]+(?:\s+[^\s]+)?)/i);
    const colorMatch = blockText.match(/Color\s*([A-Za-z][^\n]+?)(?=Shape|$)/i);
    const shapeMatch = blockText.match(/Shape\s*([A-Za-z\/\-][^\n]+?)(?=\s|$)/i);

    const sk = `${impText}|${drugName}|${strengthMatch?.[1] || ''}`;
    if (seen.has(sk)) return;
    seen.add(sk);

    const img = $block.find('img').first().attr('src');
    const imageUrl = img && (img.startsWith('http') || img.startsWith('//')) ? (img.startsWith('//') ? 'https:' + img : img) : null;
    const detailUrl = href ? `https://www.drugs.com${href.startsWith('/') ? '' : '/'}${href}` : undefined;

    results.push({
      drug_name: drugName,
      generic_name: drugName,
      strength: strengthMatch ? strengthMatch[1].trim() : '',
      drug_class: 'See drug details',
      uses: 'See drug details',
      image_url: imageUrl,
      imprint: impText,
      color: colorMatch ? colorMatch[1].trim() : '',
      shape: shapeMatch ? shapeMatch[1].trim() : '',
      confidence: scoreResult(
        { imprint: impText, color: colorMatch ? colorMatch[1].trim() : '', shape: shapeMatch ? shapeMatch[1].trim() : '' },
        imprint,
        color,
        shape
      ),
      detail_url: detailUrl,
    });
  });

  return results.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}

export async function searchDrugsCom(
  imprint: string,
  color?: string,
  shape?: string,
  limit = 10
): Promise<DrugSearchResult[]> {
  const key = cacheKey(imprint, color, shape);
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.results.slice(0, limit);
  }

  let results: DrugSearchResult[] = [];

  results = await searchByMainSearch(imprint, color, shape, limit);

  if (results.length === 0) {
    try {
      results = await searchByImprintPage(imprint, color, shape, limit);
    } catch {
      /* leave results empty */
    }
  }

  CACHE.set(key, { results, ts: Date.now() });
  return results.slice(0, limit);
}
