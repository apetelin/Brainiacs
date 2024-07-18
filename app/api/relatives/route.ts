import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
    const relatives = await prisma.relative.findMany();
    return NextResponse.json(relatives);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { userId, name, dob, address, phone } = await request.json();
    const relative = await prisma.relative.create({
        data: { userId, name, dob, address, phone },
    });
    return NextResponse.json(relative, { status: 201 });
}