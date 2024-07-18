"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Toast } from './Toast';
import { useEventSource } from './EventSourceContext';
import { AuroraBackground } from "@/components/AuroraBackground";

interface Payment {
    id: number;
    userId: number;
    date: string;
    recipient: string;
    phone: string;
    details: string;
    amount: number;
    status: string;
    isApproved: boolean | null;
}

interface Notification {
    id: number;
    message: string;
    type: 'notification' | 'request';
}

const AdminDashboard: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { eventSource } = useEventSource();

    const updateNotifications = useCallback((newPayments: Payment[]) => {
        const newNotifications = newPayments
            .filter(payment => payment.status === 'notified' || payment.status === 'pending')
            .map(payment => ({
                id: payment.id,
                message: payment.status === 'notified'
                    ? `New payment of $${payment.amount} to ${payment.recipient}`
                    : `Approval needed for $${payment.amount} payment to ${payment.recipient}`,
                type: payment.status === 'notified' ? 'notification' as const : 'request' as const
            }));

        setNotifications(prev => [...newNotifications, ...prev]);
    }, []);

    const fetchPayments = useCallback(async () => {
        try {
            const paymentsResponse = await fetch('/api/payments');

            if (!paymentsResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const paymentsData: Payment[] = await paymentsResponse.json();

            setPayments(paymentsData);
            updateNotifications(paymentsData);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to fetch data');
            setIsLoading(false);
        }
    }, [updateNotifications]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    useEffect(() => {
        if (!eventSource) return;

        const handleNewPayment = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'newPayment') {
                const newPayment = data.payment;
                setPayments(prevPayments => {
                    // Check if the payment already exists
                    if (prevPayments.some(p => p.id === newPayment.id)) {
                        return prevPayments;
                    }
                    // Add the new payment to the beginning of the array
                    return [newPayment, ...prevPayments];
                });
                updateNotifications([newPayment]);
            }
        };

        eventSource.addEventListener('message', handleNewPayment);

        return () => {
            eventSource.removeEventListener('message', handleNewPayment);
        };
    }, [eventSource, updateNotifications]);

    const handleAction = async (id: number, action: 'acknowledge' | 'approve' | 'reject') => {
        try {
            const response = await fetch('/api/admin/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            });

            if (!response.ok) {
                throw new Error('Failed to perform action');
            }

            // Remove the notification/request from the list
            setNotifications(prev => prev.filter(n => n.id !== id));

            // Update the payment in the table
            setPayments(prev => prev.map(p => p.id === id ? { ...p, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'acknowledged', isApproved: action === 'approve' ? true : action === 'reject' ? false : null } : p));
        } catch (error) {
            console.error('Error performing action:', error);
            // Handle error (e.g., show an error message to the user)
        }
    };

    if (isLoading) {
        return <div className="text-white flex justify-center items-center h-screen bg-gray-900">Loading data...</div>;
    }

    if (error) {
        return <div className="text-red-500 flex justify-center items-center h-screen bg-gray-900">{error}</div>;
    }

    return (
        <>
            <AuroraBackground warning={true} />
        <div className="text-white min-h-screen p-8" style={{opacity: '0.8'}}>
            <h1 className="text-3xl font-bold mb-6">Superviser Dashboard - Payments</h1>
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
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Approved</th>
                    </tr>
                    </thead>
                    <tbody>
                    {payments.map((payment, index) => (
                        <tr key={payment.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                            <td className="p-3 border-t border-gray-700">{payment.id}</td>
                            <td className="p-3 border-t border-gray-700">{payment.userId}</td>
                            <td className="p-3 border-t border-gray-700">{new Date(payment.date).toLocaleString()}</td>
                            <td className="p-3 border-t border-gray-700">{payment.recipient}</td>
                            <td className="p-3 border-t border-gray-700">{payment.phone}</td>
                            <td className="p-3 border-t border-gray-700">{payment.details}</td>
                            <td className="p-3 border-t border-gray-700">${payment.amount.toFixed(2)}</td>
                            <td className={`p-3 border-t border-gray-700 ${payment.status === 'approved' ? 'text-green-500' : payment.status === 'rejected' ? 'text-red-600' : 'text-blue-500'}`}>{payment.status}</td>
                            <td className="p-3 border-t border-gray-700">{payment.isApproved === null ? 'N/A' : payment.isApproved ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    message={notification.message}
                    onAcknowledge={() => handleAction(notification.id, 'acknowledge')}
                    onApprove={notification.type === 'request' ? () => handleAction(notification.id, 'approve') : undefined}
                    onReject={notification.type === 'request' ? () => handleAction(notification.id, 'reject') : undefined}
                />
            ))}
        </div>
            </>
    );
};

export default AdminDashboard;