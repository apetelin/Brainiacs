"use client";

import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons';

const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
type Voice = typeof voices[number];

export const TTSComponent: React.FC = () => {
    const [text, setText] = React.useState('');
    const [voice, setVoice] = React.useState<Voice>('alloy');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setVoice(e.target.value as Voice);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, voice }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate speech');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const newAudio = new Audio(url);
            setAudio(newAudio);
            newAudio.play();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStop = () => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Text-to-Speech</h2>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    className="w-full p-2 text-gray-900 bg-gray-100 rounded-md"
                    rows={4}
                    placeholder="Enter text to convert to speech..."
                />
                <div className="flex justify-between items-center">
                    <select
                        value={voice}
                        onChange={handleVoiceChange}
                        className="p-2 text-gray-900 bg-gray-100 rounded-md"
                    >
                        {voices.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                    <div className="space-x-2">
                        <button
                            type="submit"
                            disabled={isLoading || !text}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faPlay} className="mr-2" />
                            {isLoading ? 'Generating...' : 'Generate Speech'}
                        </button>
                        <button
                            type="button"
                            onClick={handleStop}
                            disabled={!audio}
                            className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faStop} className="mr-2" />
                            Stop
                        </button>
                    </div>
                </div>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};