import * as React from 'react';

interface Transcription {
    system: boolean;
    text: string;
    timestamp: Date;
    completed: boolean;
}

interface TranscriptionHistoryProps {
    transcriptions: Transcription[];
}

export const TranscriptionHistory: React.FC<TranscriptionHistoryProps> = ({ transcriptions }) => {
    return (
        <React.Fragment>
            <div className="mt-8 w-full max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
                {transcriptions.length === 0 ? (
                    <p className="text-gray-400">...</p>
                ) : (
                    <ul className="space-y-2">
                        {transcriptions.map((transcription, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg shadow-md ${transcription.system ? 'text-right bg-blue-800' : 'text-left bg-gray-600'}`}
                                style={{
                                    position: 'relative',
                                    maxWidth: '90%',
                                    marginLeft: transcription.system ? 'auto' : '0',
                                    marginRight: transcription.system ? '0' : 'auto'
                                }}
                            >
                                {transcription.completed && (
                                    <div className="line-above"></div> // Red dotted line above the text
                                )}
                                <span className="text-xs text-gray-500" style={{ marginRight: '10px' }}>{new Date(transcription.timestamp).toLocaleTimeString()}</span>
                                <span className="text-sm">{transcription.text}</span>

                                <style jsx>{`
                                    .line-above {
                                        position: absolute;
                                        top: -4px;
                                        left: 50%; // Start from the center of the container
                                        transform: translateX(-50%);
                                        width: 100%; // Take 90% of the parent container width
                                        height: 0;
                                        border-top: 1px dotted #ff6666;
                                        content: '';
                                    }

                                    .p-2 {
                                        padding: 0.5rem;
                                    }

                                    .rounded-lg {
                                        border-radius: 0.5rem;
                                    }

                                    .shadow-md {
                                        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
                                    }

                                    .text-right {
                                        text-align: right;
                                    }

                                    .text-left {
                                        text-align: left;
                                    }

                                    .bg-blue-800 {
                                        background-color: #1a365d;
                                        color: white;
                                    }

                                    .bg-gray-600 {
                                        background-color: #ccc;
                                        color: black;
                                    }
                                `}</style>
                            </div>
                        ))}
                    </ul>
                )}
            </div>
        </React.Fragment>
    );
};
