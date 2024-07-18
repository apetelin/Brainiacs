import { NextResponse } from 'next/server';
import { createSseStream } from '@/lib/sseHandler';

export const dynamic = 'force-dynamic';

export async function GET() {
    const stream = createSseStream();
    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}