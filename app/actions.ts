'use server'

import { prisma } from '@/lib/prisma';

export async function addRelative(formData: FormData) {
    const { userId, name, dob, address, phone } = Object.fromEntries(formData) as any;
    return prisma.relative.create({
        data: { userId: parseInt(userId), name, dob, address, phone },
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