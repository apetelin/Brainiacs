"use client";

import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { useAudioRecording } from './useAudioRecording';
import { circles, maxCircleSize, maxVolume } from './constants';
import { TranscriptionHistory } from './TranscriptionHistory';
import { VolumeBar } from './VolumeBar';
import { TTSComponent } from "@/components/TTSComponent";
import { useUser } from './UserContext'; // New import
import AdminDashboard from './AdminDashboard';
import { AuroraBackground } from "@/components/AuroraBackground"; // New import
import { EventSourceProvider } from './EventSourceContext';

interface Transcription {
    text: string;
    timestamp: Date;
}

const MAX_POSSIBLE_VOLUME = 200;

export const MainComponent: React.FC = () => {
    const { user } = useUser(); // New line

    const {
        isListening,
        isStarting,
        isStopping,
        volume,
        toggleListening,
        error: recordingError,
        transcribedText,
        isTranscribing,
        transcriptionError,
    } = useAudioRecording();

    const [transcriptionHistory, setTranscriptionHistory] = React.useState<Transcription[]>([]);
    const [maxVolume, setMaxVolume] = React.useState(0);

    React.useEffect(() => {
        if (transcribedText) {
            setTranscriptionHistory(prev => [
                { text: transcribedText, timestamp: new Date() },
                ...prev
            ]);
        }
    }, [transcribedText]);

    React.useEffect(() => {
        if (volume > maxVolume) {
            setMaxVolume(volume);
        }
    }, [volume]);

    React.useEffect(() => {
        if (!isListening) {
            setMaxVolume(0);
        }
    }, [isListening]);

    const normalizedVolume = volume / MAX_POSSIBLE_VOLUME;

    // Render function for circle components
    const renderCircles = () => {
        return circles.map((circle, index) => {
            const currentSize = circle.baseSize + circle.scaleFactor * normalizedVolume * (maxCircleSize - circle.baseSize);
            const size = Math.min(currentSize, maxCircleSize);
            return (
                <div
                    key={index}
                    className="absolute rounded-full transition-all duration-75 ease-in-out"
                    style={{
                        backgroundColor: circle.color,
                        width: `${size}px`,
                        height: `${size}px`,
                        top: `50%`,
                        left: `50%`,
                        marginLeft: `-${size / 2}px`,
                        marginTop: `-${size / 2}px`,
                        opacity: isListening ? 0.9 : 0,
                        transform: `scale(${isListening ? 1 : 0.8})`,
                        zIndex: circles.length - index,
                    }}
                />
            );
        });
    };

    const handleToggleListening = React.useCallback(() => {
        console.log('Toggle button clicked. Current isListening state:', isListening);
        toggleListening();
    }, [toggleListening, isListening]);

    // New conditional rendering based on user role
    if (user === 'Mary') {
        return <EventSourceProvider><AdminDashboard /></EventSourceProvider>;
    }

    return (
        <React.Fragment>
            <AuroraBackground />
            <div className="flex flex-col items-center justify-center min-h-screen py-12 relative z-10">
                <div className="flex items-center justify-center w-full mb-8">
                    <div className="relative w-[300px] h-[300px]">
                        <div className="absolute inset-0">
                            {renderCircles()}
                        </div>
                        <button
                            className="absolute inset-0 rounded-full border-none cursor-pointer bg-transparent z-10 flex flex-col items-center justify-center transition-all duration-300 ease-in-out"
                            onClick={handleToggleListening}
                            disabled={isStarting || isStopping}
                            style={{
                                backgroundColor: isListening ? 'rgba(75, 75, 75, 0.7)' : 'rgba(75, 75, 75, 0.8)',
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
                                {isTranscribing ? 'Transcribing...' :
                                    isStarting ? 'Starting...' :
                                        isStopping ? 'Stopping...' :
                                            isListening ? 'Listening...' : 'Click to start'}
                            </span>
                        </button>
                    </div>
                    <div className="ml-8">
                        <VolumeBar
                            volume={volume}
                            maxVolume={maxVolume}
                            maxPossibleVolume={MAX_POSSIBLE_VOLUME}
                        />
                    </div>
                </div>
                <div className="mt-4 text-white text-center">
                    {recordingError && <p className="text-red-500">{recordingError}</p>}
                    {transcriptionError && <p className="text-red-500">{transcriptionError}</p>}
                </div>
                <TranscriptionHistory transcriptions={transcriptionHistory} />
                <TTSComponent />
            </div>
        </React.Fragment>
    );
};