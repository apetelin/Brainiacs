"use client";

import React from 'react';
import { useTranscription } from './useTranscription';

export const useAudioRecording = () => {
    const [isListening, setIsListening] = React.useState(false);
    const [volume, setVolume] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);

    const {
        sendAudioToServer,
        transcribedText,
        isTranscribing,
        transcriptionError
    } = useTranscription();

    const audioRef = React.useRef({
        audioContext: null as AudioContext | null,
        analyser: null as AnalyserNode | null,
        stream: null as MediaStream | null,
        mediaRecorder: null as MediaRecorder | null,
        chunks: [] as Blob[],
        animationFrame: null as number | null
    });

    // Function to stop listening and clean up resources
    const stopListening = React.useCallback(() => {
        if (audioRef.current.stream) {
            audioRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (audioRef.current.audioContext) {
            audioRef.current.audioContext.close();
        }
        if (audioRef.current.animationFrame) {
            cancelAnimationFrame(audioRef.current.animationFrame);
        }

        if (audioRef.current.mediaRecorder && audioRef.current.mediaRecorder.state !== 'inactive') {
            return new Promise<void>((resolve) => {
                audioRef.current.mediaRecorder!.onstop = () => {
                    console.log('MediaRecorder stopped, chunks:', audioRef.current.chunks.length);
                    const audioBlob = new Blob(audioRef.current.chunks, { type: 'audio/wav' });
                    sendAudioToServer(audioBlob);
                    audioRef.current.chunks = [];
                    resolve();
                };
                audioRef.current.mediaRecorder!.stop();
            });
        } else {
            console.log('MediaRecorder was not active');
            return Promise.resolve();
        }
    }, [sendAudioToServer]);

    // Function to start listening
    const startListening = async () => {
        setError(null);
        audioRef.current.chunks = []; // Reset chunks

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRef.current.stream = stream;

            audioRef.current.audioContext = new AudioContext();
            audioRef.current.analyser = audioRef.current.audioContext.createAnalyser();
            const source = audioRef.current.audioContext.createMediaStreamSource(stream);
            source.connect(audioRef.current.analyser);

            audioRef.current.analyser.fftSize = 256;
            const bufferLength = audioRef.current.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            audioRef.current.mediaRecorder = new MediaRecorder(stream);

            audioRef.current.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioRef.current.chunks.push(event.data);
                }
            };

            audioRef.current.mediaRecorder.start(100); // Collect data every 100ms

            const updateVolume = () => {
                if (audioRef.current.analyser) {
                    audioRef.current.analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                    const cappedVolume = Math.min(average, 200);
                    setVolume(cappedVolume);
                }
                audioRef.current.animationFrame = requestAnimationFrame(updateVolume);
            };

            updateVolume();
            setIsListening(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setError('Error accessing microphone. Please check your permissions and try again.');
        }
    };

    // Function to toggle listening state
    const toggleListening = async () => {
        if (isListening) {
            await stopListening();
            setIsListening(false);
            setVolume(0);
        } else {
            await startListening();
        }
    };

    // Cleanup effect
    React.useEffect(() => {
        return () => {
            if (audioRef.current.stream || audioRef.current.audioContext || audioRef.current.mediaRecorder) {
                stopListening();
            }
        };
    }, []);

    return {
        isListening,
        volume,
        toggleListening,
        error,
        transcribedText,
        isTranscribing,
        transcriptionError
    };
};