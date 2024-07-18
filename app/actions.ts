'use server'
import { prisma } from '@/lib/prisma';
import type { Relative, Payment } from '@prisma/client';

export async function addRelative(formData: FormData) {
    const data = Object.fromEntries(formData);
    const relativeData: Omit<Relative, 'id'> = {
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
    const data = Object.fromEntries(formData);
    
    if (!data.amount) {
        throw new Error('Amount is required for creating a payment');
    }
    const amount = parseFloat(data.amount as string);
    const paymentData: Omit<Payment, 'id'> = {
        userId: parseInt(data.userId as string),
        date: data.date as string,
        recipient: data.recipient as string,
        phone: data.phone as string,
        details: data.details as string,
        amount: amount,
        status: amount < 100 ? "notified" : "pending",
        isApproved: amount < 100 ? null : false
    };
    return prisma.payment.create({
        data: paymentData,
    });
}

export async function getRelatives() {
    return prisma.relative.findMany();
}

export async function getPayments() {
    return prisma.payment.findMany();
}