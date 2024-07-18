import * as React from 'react';

interface Transcription {
    system: boolean;
    text: string;
    timestamp: Date;
}

interface TranscriptionHistoryProps {
    transcriptions: Transcription[];
}

export const TranscriptionHistory: React.FC<TranscriptionHistoryProps> = ({ transcriptions }) => {
    return (
        <React.Fragment>
            <div className="mt-8 w-full max-w-2xl mx-auto w-90 bg-gray-800 rounded-lg shadow-lg p-6">
                {transcriptions.length === 0 ? (
                    <p className="text-gray-400">...</p>
                ) : (
                    <ul className="space-y-2">
                        {transcriptions.map((transcription, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg shadow-md ${transcription.system ? 'text-right bg-blue-800' : 'text-left bg-gray-600'}`}
                                style={{
                                    maxWidth: '90%',
                                    marginLeft: transcription.system ? 'auto' : '0',
                                    marginRight: transcription.system ? '0' : 'auto'
                                }}
                            >
                                <span className="text-xs text-gray-500" style={{ marginRight: '10px' }}>{new Date(transcription.timestamp).toLocaleTimeString()}</span>
                                <span className="text-sm">{transcription.text}</span>

                            </div>

                        ))}
                    </ul>
                )}
            </div>
        </React.Fragment>
    );
};