"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

const VoiceCircle: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const [transcribedText, setTranscribedText] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const animationFrameRef = useRef<number | null>(null);

    const maxVolume = 200;
    const maxCircleSize = 600;

    const circles = [
        { baseSize: 300, scaleFactor: 0.25, color: '#0369a1' },
        { baseSize: 300, scaleFactor: 0.5, color: '#0ea5e9' },
        { baseSize: 300, scaleFactor: 0.75, color: '#7dd3fc' },
        { baseSize: 300, scaleFactor: 1.0, color: '#e0f2fe' },
    ];

    const stopListening = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            return new Promise<void>((resolve) => {
                mediaRecorderRef.current!.onstop = () => {
                    console.log('MediaRecorder stopped, chunks:', chunksRef.current.length);
                    const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                    sendAudioToServer(audioBlob);
                    chunksRef.current = [];
                    resolve();
                };
                mediaRecorderRef.current!.stop();
            });
        } else {
            console.log('MediaRecorder was not active');
            return Promise.resolve();
        }
    }, []);

    useEffect(() => {
        return () => {
            const stopListeningPromise = stopListening();
            if (stopListeningPromise) {
                stopListeningPromise.catch(error => {
                    console.error('Error during cleanup:', error);
                });
            }
        };
    }, [stopListening]);

    const startListening = async () => {
        setTranscribedText(null);
        setError(null);
        chunksRef.current = []; // Reset chunks

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start(100); // Collect data every 100ms

            const updateVolume = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                    const cappedVolume = Math.min(average, maxVolume);
                    setVolume(cappedVolume);
                }
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();
            setIsListening(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setError('Error accessing microphone. Please check your permissions and try again.');
        }
    };

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

    const toggleListening = async () => {
        if (isListening) {
            await stopListening();
            setIsListening(false);
            setVolume(0);
        } else {
            startListening();
        }
    };

    const normalizedVolume = volume / maxVolume;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
            <div className="relative w-[300px] h-[300px]">
                {circles.map((circle, index) => {
                    const currentSize = circle.baseSize + normalizedVolume * circle.baseSize * circle.scaleFactor;
                    const size = Math.min(currentSize, maxCircleSize);
                    return (
                        <div
                            key={index}
                            className="absolute rounded-full transition-transform duration-100"
                            style={{
                                backgroundColor: circle.color,
                                width: `${size}px`,
                                height: `${size}px`,
                                top: `calc(50% - ${size / 2}px)`,
                                left: `calc(50% - ${size / 2}px)`,
                                opacity: 0.9,
                                zIndex: circles.length - index,
                            }}
                        />
                    );
                })}
                <button
                    className="absolute inset-0 rounded-full border-none cursor-pointer bg-transparent z-10 flex flex-col items-center justify-center"
                    onClick={toggleListening}
                >
                    <FontAwesomeIcon
                        icon={isListening ? faMicrophoneSlash : faMicrophone}
                        className="text-white text-6xl"
                    />
                    <span className="mt-2 text-xl font-semibold text-white">
                        {isListening ? 'Listening...' : 'Click to start'}
                    </span>
                </button>
            </div>
            <div className="mt-4 text-white text-center">
                {isTranscribing && <p>Transcribing...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {transcribedText && (
                    <>
                        <h3>Transcribed Text:</h3>
                        <p>{transcribedText}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default VoiceCircle;