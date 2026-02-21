import Jimp from 'jimp';

// Approximate RGB centroids for matching. No "Clear" here so light blue/white map to White or Blue.
const COLOR_RGB: { name: string; r: number; g: number; b: number }[] = [
  { name: 'White', r: 255, g: 255, b: 255 },
  { name: 'Light Blue', r: 170, g: 210, b: 255 }, // maps to Blue when returned
  { name: 'Beige', r: 245, g: 245, b: 220 },
  { name: 'Black', r: 30, g: 30, b: 30 },
  { name: 'Blue', r: 70, g: 130, b: 200 },
  { name: 'Brown', r: 140, g: 90, b: 60 },
  { name: 'Gold', r: 255, g: 215, b: 0 },
  { name: 'Gray', r: 128, g: 128, b: 128 },
  { name: 'Green', r: 80, g: 160, b: 90 },
  { name: 'Maroon', r: 128, g: 0, b: 0 },
  { name: 'Orange', r: 255, g: 165, b: 0 },
  { name: 'Peach', r: 255, g: 218, b: 185 },
  { name: 'Pink', r: 255, g: 192, b: 203 },
  { name: 'Purple', r: 160, g: 90, b: 160 },
  { name: 'Red', r: 200, g: 60, b: 60 },
  { name: 'Tan', r: 210, g: 180, b: 140 },
  { name: 'Yellow', r: 255, g: 255, b: 0 },
];

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Sample the center region, excluding near-white pixels (background/reflection), so the pill color wins.
 */
export async function suggestColorFromImage(imageBuffer: Buffer): Promise<string | null> {
  try {
    const img = await Jimp.read(imageBuffer);
    const w = img.getWidth();
    const h = img.getHeight();
    const x0 = Math.floor(w * 0.25);
    const y0 = Math.floor(h * 0.25);
    const x1 = Math.floor(w * 0.75);
    const y1 = Math.floor(h * 0.75);
    let r = 0, g = 0, b = 0, count = 0;
    for (let y = y0; y < y1; y += 2) {
      for (let x = x0; x < x1; x += 2) {
        const c = img.getPixelColor(x, y);
        const pr = (c >> 16) & 0xff;
        const pg = (c >> 8) & 0xff;
        const pb = c & 0xff;
        if (pr > 248 && pg > 248 && pb > 248) continue;
        r += pr;
        g += pg;
        b += pb;
        count++;
      }
    }
    if (count === 0) {
      r = 255; g = 255; b = 255;
      count = 1;
    } else {
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
    }
    let best = COLOR_RGB[0];
    let bestDist = colorDistance(r, g, b, best.r, best.g, best.b);
    for (let i = 1; i < COLOR_RGB.length; i++) {
      const d = colorDistance(r, g, b, COLOR_RGB[i].r, COLOR_RGB[i].g, COLOR_RGB[i].b);
      if (d < bestDist) {
        bestDist = d;
        best = COLOR_RGB[i];
      }
    }
    // Map "Light Blue" to "Blue" for drugs.com dropdown
    if (best.name === 'Light Blue') return 'Blue';
    return best.name;
  } catch {
    return null;
  }
}

/**
 * Suggest shape from image aspect ratio (pill often fills the frame). Heuristic only.
 */
export async function suggestShapeFromImage(imageBuffer: Buffer): Promise<string | null> {
  try {
    const img = await Jimp.read(imageBuffer);
    const w = img.getWidth();
    const h = img.getHeight();
    if (h === 0) return null;
    const ratio = w / h;
    if (ratio >= 0.9 && ratio <= 1.1) return 'Round';
    if (ratio >= 1.2 && ratio <= 2.2) return 'Capsule/Oblong';
    if (ratio >= 0.45 && ratio <= 0.55) return 'Capsule/Oblong';
    if (ratio > 1.1 && ratio < 1.2) return 'Oval';
    if (ratio > 0.83 && ratio < 0.9) return 'Oval';
    return 'Round'; // default
  } catch {
    return null;
  }
}
