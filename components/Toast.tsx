// components/Toast.tsx

import React from 'react';

interface ToastProps {
    message: string;
    onAcknowledge: () => void;
    onApprove?: () => void;
    onReject?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onAcknowledge, onApprove, onReject }) => {
    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
            <p className="mb-2">{message}</p>
            <div className="flex justify-end space-x-2">
                {onApprove && (
                    <button
                        onClick={onApprove}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Approve
                    </button>
                )}
                {onReject && (
                    <button
                        onClick={onReject}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Reject
                    </button>
                )}
                <button
                    onClick={onAcknowledge}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                    {onApprove ? 'Dismiss' : 'Acknowledge'}
                </button>
            </div>
        </div>
    );
};