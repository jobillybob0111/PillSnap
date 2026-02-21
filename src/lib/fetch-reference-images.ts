import * as cheerio from 'cheerio';
import { buildPillImageUrl } from './image-similarity';

const fetchOpts: RequestInit = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.drugs.com/imprints.php',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
  },
};

export async function fetchImageFromDetailPage(detailUrl: string): Promise<string | null> {
  try {
    const res = await fetch(detailUrl, fetchOpts);
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    const img =
      $('img[src*="pills"], img[src*="pill"], img[src*="images/"]').first().attr('src') ||
      $('img[src*="drugs.com"]').first().attr('src') ||
      $('main img, article img, .content img').first().attr('src');
    if (!img) return null;
    return img.startsWith('http') ? img : img.startsWith('//') ? 'https:' + img : `https://www.drugs.com${img.startsWith('/') ? '' : '/'}${img}`;
  } catch {
    return null;
  }
}

export function getReferenceImageUrl(result: { imprint: string; image_url?: string | null; detail_url?: string }): string | null {
  if (result.image_url) return result.image_url;
  const built = buildPillImageUrl(result.imprint);
  return built || null;
}
