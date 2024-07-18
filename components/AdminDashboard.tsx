"use client";

import React, { useEffect, useState } from 'react';

interface Payment {
    id: number;
    userId: number;
    date: string;
    recipient: string;
    phone: string;
    details: string;
}

const AdminDashboard: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch('/api/payments');
                if (!response.ok) {
                    throw new Error('Failed to fetch payments');
                }
                const data = await response.json();
                setPayments(data);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to fetch payments');
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (isLoading) {
        return <div className="text-white flex justify-center items-center h-screen bg-gray-900">Loading payments...</div>;
    }

    if (error) {
        return <div className="text-red-500 flex justify-center items-center h-screen bg-gray-900">{error}</div>;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard - Payments</h1>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-gray-800 rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gray-700">
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">User ID</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Recipient</th>
                        <th className="p-3 text-left">Phone</th>
                        <th className="p-3 text-left">Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {payments.map((payment, index) => (
                        <tr key={payment.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                            <td className="p-3 border-t border-gray-700">{payment.id}</td>
                            <td className="p-3 border-t border-gray-700">{payment.userId}</td>
                            <td className="p-3 border-t border-gray-700">{payment.date}</td>
                            <td className="p-3 border-t border-gray-700">{payment.recipient}</td>
                            <td className="p-3 border-t border-gray-700">{payment.phone}</td>
                            <td className="p-3 border-t border-gray-700">{payment.details}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;