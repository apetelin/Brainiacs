import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const payments = await prisma.payment.findMany({
            orderBy: {
                date: 'desc'
            }
        });
        return NextResponse.json(payments);
    } catch (error) {
        console.error('Failed to fetch payments:', error);
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { userId, date, recipient, phone, details } = await request.json();
    const payment = await prisma.payment.create({
        data: { userId, date, recipient, phone, details },
    });
    return NextResponse.json(payment, { status: 201 });
}