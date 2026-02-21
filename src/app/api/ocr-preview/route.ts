import { NextRequest, NextResponse } from 'next/server';
import { extractImprintRaw, extractImprintFromImages } from '@/lib/ocr';
import { suggestColorFromImage, suggestShapeFromImage } from '@/lib/pill-image-analyzer';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const front = formData.get('front') as File | null;
    const back = formData.get('back') as File | null;
    const image = formData.get('image') as File | null;
    const buffers: Buffer[] = [];
    if (front?.size && front.size <= MAX_SIZE) buffers.push(Buffer.from(await front.arrayBuffer()));
    if (back?.size && back.size <= MAX_SIZE) buffers.push(Buffer.from(await back.arrayBuffer()));
    if (buffers.length === 0 && image?.size && image.size <= MAX_SIZE) {
      buffers.push(Buffer.from(await image.arrayBuffer()));
    }
    if (buffers.length === 0) {
      return NextResponse.json(
        { error: 'Send at least one image (front, back, or image).' },
        { status: 400 }
      );
    }
    const firstBuffer = buffers[0];
    const combinedText = await extractImprintFromImages(buffers);
    const [ocrFirst, suggestedColor, suggestedShape] = await Promise.all([
      extractImprintRaw(firstBuffer),
      suggestColorFromImage(firstBuffer),
      suggestShapeFromImage(firstBuffer),
    ]);
    const raw = buffers.length > 1
      ? buffers.map((_, i) => `[image ${i + 1}]`).join(' ') + '\n' + (await Promise.all(buffers.map((b) => extractImprintRaw(b)))).map((r, i) => `[${i + 1}] ${r.raw}`).join('\n')
      : ocrFirst.raw;

    return NextResponse.json({
      raw,
      text: combinedText || ocrFirst.cleaned,
      suggestedColor: suggestedColor ?? undefined,
      suggestedShape: suggestedShape ?? undefined,
    });
  } catch (e) {
    console.warn('OCR preview error:', e);
    return NextResponse.json(
      { error: 'Failed to read image.' },
      { status: 500 }
    );
  }
}
