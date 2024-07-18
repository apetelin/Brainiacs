'use client';

import { useEffect, useState } from 'react';

let eventSource: EventSource | undefined;

export function EventSourceInitializer() {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const initializeEventSource = () => {
            if (!eventSource) {
                eventSource = new EventSource('/api/sse');

                eventSource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    setEvents((prevEvents) => [...prevEvents, data]);
                    if (data.type === 'newPayment') {
                        console.log('New payment received:', data.payment);
                        // Handle the new payment here (e.g., update state, show notification)
                    }
                };

                eventSource.onerror = (error) => {
                    console.error('EventSource failed:', error);
                    eventSource?.close();
                    eventSource = undefined;
                    setTimeout(initializeEventSource, 3000); // Retry connection after 3 seconds
                };
            }
        };

        initializeEventSource();

        return () => {
            if (eventSource) {
                eventSource.close();
                eventSource = undefined;
            }
        };
    }, []);

    return null;
}