import Tesseract from 'tesseract.js';
import Jimp from 'jimp';

const MIN_EDGE = 200;
const TARGET_EDGE = 800;

function cleanOcrRaw(raw: string): string {
  return raw
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^A-Za-z0-9\s\-\.]/g, '')
    .trim();
}

function looksLikeImprint(text: string): boolean {
  if (!text || text.length > 30) return false;
  return /^[A-Za-z0-9\s\-\.]+$/.test(text) && text.length >= 1;
}

/** Preprocess: crop, scale, grayscale, contrast. No binarization (keeps faint text like "lupin"). */
async function preprocessForOcr(imageBuffer: Buffer, binarize: boolean): Promise<Buffer> {
  try {
    const img = await Jimp.read(imageBuffer);
    const w = img.getWidth();
    const h = img.getHeight();
    const cropW = Math.floor(w * 0.65);
    const cropH = Math.floor(h * 0.65);
    const x = Math.floor((w - cropW) / 2);
    const y = Math.floor((h - cropH) / 2);
    img.crop(x, y, cropW, cropH);
    const minDim = Math.min(cropW, cropH);
    if (minDim < MIN_EDGE) {
      const scale = TARGET_EDGE / minDim;
      img.scale(scale);
    }
    img.grayscale();
    img.contrast(0.25);
    img.normalize();
    if (binarize) {
      const threshold = 160;
      img.scan(0, 0, img.getWidth(), img.getHeight(), function (_px, _py, idx) {
        const g = this.bitmap.data[idx];
        const v = g > threshold ? 255 : 0;
        this.bitmap.data[idx] = v;
        this.bitmap.data[idx + 1] = v;
        this.bitmap.data[idx + 2] = v;
      });
    }
    return await img.getBufferAsync('image/png');
  } catch {
    return imageBuffer;
  }
}

export async function extractImprintFromImage(imageBuffer: Buffer): Promise<string> {
  const { cleaned } = await extractImprintRaw(imageBuffer);
  return cleaned;
}

/** Run OCR on multiple images (e.g. front + back) and combine with a space. Use for "lupin" + "20" -> "lupin 20". */
export async function extractImprintFromImages(imageBuffers: Buffer[]): Promise<string> {
  const parts: string[] = [];
  for (const buf of imageBuffers) {
    const text = await extractImprintFromImage(buf);
    const t = text.trim();
    if (t.length > 0) parts.push(t);
  }
  return parts.join(' ').trim();
}

/** Returns raw and cleaned OCR text. Tries without binarization first (keeps "lupin"); if result is garbage, retries with binarization. */
export async function extractImprintRaw(imageBuffer: Buffer): Promise<{ raw: string; cleaned: string }> {
  try {
    const run = async (binarize: boolean) => {
      const processed = await preprocessForOcr(imageBuffer, binarize);
      const result = await Tesseract.recognize(processed, 'eng', { logger: () => {} });
      const raw = (result.data?.text || '').trim();
      return { raw, cleaned: cleanOcrRaw(raw) };
    };
    const noBin = await run(false);
    if (looksLikeImprint(noBin.cleaned)) return noBin;
    const withBin = await run(true);
    if (looksLikeImprint(withBin.cleaned)) return withBin;
    return noBin.cleaned.length > 0 ? noBin : withBin;
  } catch {
    return { raw: '', cleaned: '' };
  }
}
