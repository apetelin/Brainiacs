import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(){
    try {
        const payments = await prisma.payment.deleteMany({
            where: {
                userId: {
                    gt: 347,
                },
            },
        });
    }
    catch (error) {
        console.error('Failed to reset payments:', error);
        return NextResponse.json({ error: 'Failed to reset payments' }, { status: 500 });
    }
}