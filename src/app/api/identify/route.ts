import { NextRequest, NextResponse } from 'next/server';
import { searchDrugsCom } from '@/lib/drugs-com-search';
import { searchPills } from '@/lib/matching';
import { getReferenceImageUrl, fetchImageFromDetailPage } from '@/lib/fetch-reference-images';

const DISCLAIMER =
  'This tool is for informational purposes only and does not replace medical advice. Always consult a pharmacist or physician.';

const MAX_EXACT = 3;
const MAX_POTENTIAL = 3;
const FETCH_LIMIT = 15;

function norm(s: string): string {
  return (s || '').toLowerCase().trim();
}

function colorMatches(searchColor: string, resultColor: string): boolean {
  if (!searchColor) return true;
  const a = norm(searchColor);
  const b = norm(resultColor || '');
  if (a === b) return true;
  return b.includes(a) || a.includes(b);
}

function shapeMatches(searchShape: string, resultShape: string): boolean {
  if (!searchShape) return true;
  const a = norm(searchShape);
  const b = norm(resultShape || '');
  if (a === b) return true;
  const bTerms = b.split(/[/\s-]+/);
  const aTerms = a.split(/[/\s-]+/);
  return aTerms.some((t) => b.includes(t)) || bTerms.some((t) => a.includes(t));
}

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Invalid form data. Please try again.' },
        { status: 400 }
      );
    }

    const imprint = (formData.get('imprint') as string)?.trim() || '';
    const color = (formData.get('color') as string)?.trim() || '';
    const shape = (formData.get('shape') as string)?.trim() || '';

    if (!imprint || imprint.length < 1) {
      return NextResponse.json(
        {
          error: 'NO_IMPRINT',
          message: 'Please enter the pill imprint (letters/numbers on the pill).',
        },
        { status: 400 }
      );
    }

    type ResultItem = {
      drug_name: string;
      generic_name: string;
      strength: string;
      drug_class: string;
      uses: string;
      image_url: string | null;
      confidence: number;
      imprint?: string;
      color?: string;
      shape?: string;
    };

    let results: ResultItem[] = [];

    try {
      const liveResults = await searchDrugsCom(imprint, undefined, undefined, FETCH_LIMIT);
      results = await Promise.all(
        liveResults.map(async (r) => {
          let imageUrl: string | null = r.image_url || null;
          if (!imageUrl && r.detail_url) {
            const fromDetail = await fetchImageFromDetailPage(r.detail_url);
            if (fromDetail) imageUrl = fromDetail;
          }
          if (!imageUrl) {
            imageUrl = getReferenceImageUrl({ imprint: r.imprint, image_url: r.image_url, detail_url: r.detail_url });
          }
          return {
            drug_name: r.drug_name,
            generic_name: r.generic_name,
            strength: r.strength,
            drug_class: r.drug_class,
            uses: r.uses,
            image_url: imageUrl || null,
            confidence: Math.round(r.confidence * 100),
            imprint: r.imprint,
            color: r.color,
            shape: r.shape,
          };
        })
      );
    } catch (liveError) {
      console.warn('Live search failed, falling back to local DB:', liveError);
      try {
        const localResults = searchPills(imprint, undefined, undefined, FETCH_LIMIT);
        results = localResults.map((r) => ({
          drug_name: r.drug_name,
          generic_name: r.generic_name,
          strength: r.strength,
          drug_class: r.drug_class,
          uses: r.uses,
          image_url: r.image_url || getReferenceImageUrl({ imprint: r.imprint }),
          confidence: Math.round(r.confidence * 100),
          imprint: r.imprint,
          color: r.color,
          shape: r.shape,
        }));
      } catch (dbError) {
        console.error('Local DB error:', dbError);
        results = [];
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          error: 'NO_MATCHES',
          message: 'No matching pills found. Try different imprint, color, or shape. Check spelling and try again.',
        },
        { status: 404 }
      );
    }

    const hasColorFilter = color.length > 0;
    const hasShapeFilter = shape.length > 0;
    const exactMatches: ResultItem[] = [];
    const potentialMatches: ResultItem[] = [];

    for (const r of results) {
      const colorOk = colorMatches(color, r.color ?? '');
      const shapeOk = shapeMatches(shape, r.shape ?? '');
      if (colorOk && shapeOk) {
        if (exactMatches.length < MAX_EXACT) exactMatches.push(r);
      } else {
        if (potentialMatches.length < MAX_POTENTIAL) potentialMatches.push(r);
      }
    }

    return NextResponse.json({
      imprint,
      searchColor: color || undefined,
      searchShape: shape || undefined,
      results: exactMatches,
      potentialMatches: potentialMatches,
      disclaimer: DISCLAIMER,
    });
  } catch (e) {
    console.error('Identify error:', e);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
