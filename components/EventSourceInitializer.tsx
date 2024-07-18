'use client';

import { useEffect } from 'react';

let eventSource: EventSource | undefined;

export function EventSourceInitializer() {
    useEffect(() => {
        if (!eventSource) {
            eventSource = new EventSource('/api/sse');

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'newPayment') {
                    console.log('New payment received:', data.payment);
                    // Handle the new payment here (e.g., update state, show notification)
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource failed:', error);
                eventSource?.close();
                eventSource = undefined;
            };
        }

        return () => {
            if (eventSource) {
                eventSource.close();
                eventSource = undefined;
            }
        };
    }, []);

    return null;
}