import { NextRequest, NextResponse } from 'next/server';
import { searchDrugsCom } from '@/lib/drugs-com-search';

export const dynamic = 'force-dynamic';

const MAX_SUGGESTIONS = 15;
const MIN_QUERY_LENGTH = 1;

export async function GET(request: NextRequest) {
  try {
    const q = (request.nextUrl.searchParams.get('q') || '').trim();
    if (q.length < MIN_QUERY_LENGTH) {
      return NextResponse.json({ suggestions: [] });
    }

    const results = await searchDrugsCom(q, undefined, undefined, MAX_SUGGESTIONS);
    const seen = new Set<string>();
    const suggestions: string[] = [];
    for (const r of results) {
      const imp = (r.imprint || '').trim();
      if (!imp || seen.has(imp)) continue;
      seen.add(imp);
      suggestions.push(imp);
    }

    return NextResponse.json({ suggestions });
  } catch (e) {
    console.warn('Suggest error:', e);
    return NextResponse.json({ suggestions: [] });
  }
}
