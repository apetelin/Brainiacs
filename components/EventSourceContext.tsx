"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface EventSourceContextType {
    eventSource: EventSource | null;
}

const EventSourceContext = createContext<EventSourceContextType>({ eventSource: null });

export const useEventSource = () => useContext(EventSourceContext);

export const EventSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    useEffect(() => {
        const es = new EventSource('/api/sse');
        setEventSource(es);

        return () => {
            es.close();
        };
    }, []);

    return (
        <EventSourceContext.Provider value={{ eventSource }}>
            {children}
        </EventSourceContext.Provider>
    );
};