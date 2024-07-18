import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EventSourceProvider } from '@/components/EventSourceContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Debby.AI",
    description: "A financial AI assistant for people with dementia",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <EventSourceProvider>
                    {children}
                </EventSourceProvider>
            </body>
        </html>
    );
}