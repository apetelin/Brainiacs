"use client";
import React from 'react';

export const useTranscription = () => {
    const [transcribedText, setTranscribedText] = React.useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Function to send audio to server for transcription
    const sendAudioToServer = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        setError(null);
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
            console.log('Sending audio to server, blob size:', audioBlob.size);
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received transcription:', data.text);
            setTranscribedText(data.text);
        } catch (error) {
            console.error('Error transcribing audio:', error);
            setError('Error transcribing audio. Please try again.');
            setTranscribedText(null);
        } finally {
            setIsTranscribing(false);
        }
    };

    return { transcribedText, isTranscribing, transcriptionError:error, sendAudioToServer };
};