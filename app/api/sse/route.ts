import { NextResponse } from 'next/server';

const clients = new Set<ReadableStreamDefaultController>();

export async function GET() {
    const stream = new ReadableStream({
        start(controller) {
            clients.add(controller);

            return () => {
                clients.delete(controller);
            };
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

export function sendEventToAll(data: any) {
    const encoder = new TextEncoder();
    clients.forEach(client => {
        client.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    });
}

// Make sendEventToAll available globally
(global as any).sendEventToAll = sendEventToAll;