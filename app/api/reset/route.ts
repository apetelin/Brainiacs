import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(){
    try {
        const payments = await prisma.payment.deleteMany({
            where: {
                id: {
                    gt: 347,
                },
            },
        });
        return NextResponse.json({'status': 'OK'});
    }
    catch (error) {
        console.error('Failed to reset payments:', error);
        return NextResponse.json({ error: 'Failed to reset payments' }, { status: 500 });
    }
}
