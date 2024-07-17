"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { useAudioRecording } from './useAudioRecording';
import { circles, maxCircleSize } from './constants';

export const VoiceCircle: React.FC = () => {
    const {
        isListening,
        volume,
        toggleListening,
        error: recordingError,
        transcribedText,
        isTranscribing,
        transcriptionError,
    } = useAudioRecording();

    const normalizedVolume = volume / 200; // maxVolume is 200

    // Render function for circle components
    const renderCircles = () => {
        return circles.map((circle, index) => {
            const currentSize = circle.baseSize + normalizedVolume * circle.baseSize * circle.scaleFactor;
            const size = Math.min(currentSize, maxCircleSize);
            return (
                <div
                    key={index}
                    className="absolute rounded-full transition-all duration-75 ease-in-out"
                    style={{
                        backgroundColor: circle.color,
                        width: `${size}px`,
                        height: `${size}px`,
                        top: `calc(50% - ${size / 2}px)`,
                        left: `calc(50% - ${size / 2}px)`,
                        opacity: isListening ? 0.9 : 0,
                        transform: `scale(${isListening ? 1 : 0.8})`,
                        zIndex: circles.length - index,
                    }}
                />
            );
        });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
            <div className="relative w-[300px] h-[300px]">
                {renderCircles()}
                <button
                    className="absolute inset-0 rounded-full border-none cursor-pointer bg-transparent z-10 flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
                    onClick={toggleListening}
                    style={{
                        backgroundColor: isListening ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                        transform: `scale(${isListening ? 1.1 : 1})`,
                    }}
                >
                    <FontAwesomeIcon
                        icon={isListening ? faMicrophoneSlash : faMicrophone}
                        className="text-white text-6xl transition-all duration-300 ease-in-out"
                        style={{
                            transform: `scale(${isListening ? 1.2 : 1})`,
                        }}
                    />
                    <span className="mt-2 text-xl font-semibold text-white">
                        {isListening ? 'Listening...' : 'Click to start'}
                    </span>
                </button>
            </div>
            <div className="mt-4 text-white text-center">
                {isTranscribing && <p>Listening...</p>}
                {recordingError && <p className="text-red-500">{recordingError}</p>}
                {transcriptionError && <p className="text-red-500">{transcriptionError}</p>}
                {transcribedText && (
                    <>
                        <h3>You said:</h3>
                        <p>{transcribedText}</p>
                    </>
                )}
            </div>
        </div>
    );
};