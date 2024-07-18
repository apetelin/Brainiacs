import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { id, action } = await request.json();

    if (!['acknowledge', 'approve', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    try {
        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
                status: action === 'acknowledge' ? 'acknowledged' : action === 'approve' ? 'approved' : 'rejected',
                isApproved: action === 'approve' ? true : action === 'reject' ? false : null
            }
        });

        return NextResponse.json(updatedPayment);
    } catch (error) {
        console.error('Failed to update payment:', error);
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }
}