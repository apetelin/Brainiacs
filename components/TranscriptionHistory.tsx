import * as React from 'react';

interface TranscriptionHistoryProps {
    transcriptions: { text: string; timestamp: Date }[];
}

export const TranscriptionHistory: React.FC<TranscriptionHistoryProps> = ({ transcriptions }) => {
    return (
        <React.Fragment>
            <div className="mt-8 w-full max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Our dialogue</h2>
                {transcriptions.length === 0 ? (
                    <p className="text-gray-400">...</p>
                ) : (
                    <ul className="space-y-2">
                        {transcriptions.map((item, index) => (
                            <li key={index} className="text-white">
                <span className="text-gray-400 mr-2">
                  {item.timestamp.toLocaleTimeString()}
                </span>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </React.Fragment>
    );
};