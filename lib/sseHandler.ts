// app/lib/sseHandler.ts

const clients = new Set<ReadableStreamDefaultController>();

export function createSseStream() {
    return new ReadableStream({
        start(controller) {
            clients.add(controller);
            return () => {
                clients.delete(controller);
            };
        },
        cancel() {
            clients.clear();
        }
    });
}

export function sendEventToAll(data: any) {
    const encoder = new TextEncoder();
    clients.forEach(client => {
        try {
            client.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
            console.error('Failed to send event to client:', error);
        }
    });
}

// Make sendEventToAll available globally
(global as any).sendEventToAll = sendEventToAll;