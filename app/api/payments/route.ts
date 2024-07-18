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
    const { userId, date, recipient, phone, details, amount } = await request.json();

    const payment = await prisma.payment.create({
        data: {
            userId,
            date,
            recipient,
            phone,
            details,
            amount,
            status: amount < 100 ? "notified" : "pending",
            isApproved: amount < 100 ? null : false
        },
    });

    // Send event for new payment
    const sendEventToAll = (global as any).sendEventToAll;
    if (sendEventToAll) {
        sendEventToAll({ type: 'newPayment', payment });
    }

    return NextResponse.json(payment, { status: 201 });
}