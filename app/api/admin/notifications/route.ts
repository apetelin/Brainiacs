import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const notifications = await prisma.payment.findMany({
        where: { status: "notified" },
        orderBy: { date: 'desc' }
    });

    const requests = await prisma.payment.findMany({
        where: { status: "pending", isApproved: false },
        orderBy: { date: 'desc' }
    });

    return NextResponse.json({ notifications, requests });
}