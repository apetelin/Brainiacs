import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(): Promise<NextResponse> {
    const relatives = await prisma.relative.findMany();
    return NextResponse.json(relatives);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = await request.json();
    const relativeData: Prisma.RelativeCreateInput = {
        userId: body.userId,
        name: body.name,
        dob: body.dob,
        address: body.address,
        phone: body.phone,
        relationship: body.relationship
    };

    const relative = await prisma.relative.create({
        data: relativeData,
    });

    return NextResponse.json(relative, { status: 201 });
}