'use server'

import { prisma } from '@/lib/prisma';

export async function addRelative(formData: FormData) {
    const data = Object.fromEntries(formData);
    const relativeData: Prisma.RelativeCreateInput = {
        userId: parseInt(data.userId as string),
        name: data.name as string,
        dob: data.dob as string,
        address: data.address as string,
        phone: data.phone as string,
        relationship: data.relationship as string
    };

    return prisma.relative.create({
        data: relativeData,
    });
}

export async function addPayment(formData: FormData) {
    const { userId, date, recipient, phone, details } = Object.fromEntries(formData) as any;
    return prisma.payment.create({
        data: { userId: parseInt(userId), date, recipient, phone, details },
    });
}

export async function getRelatives() {
    return prisma.relative.findMany();
}

export async function getPayments() {
    return prisma.payment.findMany();
}