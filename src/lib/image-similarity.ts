import Jimp from 'jimp';

const HASH_SIZE = 8;

function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return 999;
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) d++;
  }
  return d;
}

export async function differenceHash(imageBuffer: Buffer): Promise<string> {
  const img = await Jimp.read(imageBuffer);
  img.resize(HASH_SIZE + 1, HASH_SIZE).grayscale();

  const hash: number[] = [];
  for (let y = 0; y < HASH_SIZE; y++) {
    for (let x = 0; x < HASH_SIZE; x++) {
      const left = img.getPixelColor(x, y);
      const right = img.getPixelColor(x + 1, y);
      const lGray = (left >> 16 & 0xff) * 0.299 + (left >> 8 & 0xff) * 0.587 + (left & 0xff) * 0.114;
      const rGray = (right >> 16 & 0xff) * 0.299 + (right >> 8 & 0xff) * 0.587 + (right & 0xff) * 0.114;
      hash.push(lGray <= rGray ? 1 : 0);
    }
  }
  return hash.join('');
}

export function hashSimilarity(hashA: string, hashB: string): number {
  const dist = hammingDistance(hashA, hashB);
  const maxBits = hashA.length;
  return 1 - dist / maxBits;
}

export async function compareImages(
  userBuffer: Buffer,
  referenceBuffer: Buffer
): Promise<number> {
  try {
    const hashUser = await differenceHash(userBuffer);
    const hashRef = await differenceHash(referenceBuffer);
    return hashSimilarity(hashUser, hashRef);
  } catch {
    return 0;
  }
}

export async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        Referer: 'https://www.drugs.com/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  } catch {
    return null;
  }
}

export function buildPillImageUrl(imprint: string): string {
  const slug = imprint.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '');
  if (!slug) return '';
  const upper = slug.toUpperCase();
  return `https://www.drugs.com/images/pills/mtm/${upper}.JPG`;
}
