import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
    const payments = await prisma.payment.findMany();
    return NextResponse.json(payments);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { userId, date, recipient, phone, details } = await request.json();
    const payment = await prisma.payment.create({
        data: { userId, date, recipient, phone, details },
    });
    return NextResponse.json(payment, { status: 201 });
}