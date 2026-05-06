import { getStoreByIdentifier } from '@/lib/tenant/get-store';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const data = await getStoreByIdentifier(slug);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }
}
