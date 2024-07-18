"use client";

import * as React from 'react';
import { useTranscription } from './useTranscription';
import _ from 'lodash';

const SILENCE_THRESHOLD = 40;
const SILENCE_DURATION = 2000; // 3 seconds in milliseconds
const SPEECH_THRESHOLD = 60;

type AudioState = 'inactive' | 'starting' | 'active' | 'stopping';

export const useAudioRecording = () => {
    const [audioState, setAudioState] = React.useState<AudioState>('inactive');
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
        animationFrame: null as number | null,
        silenceStart: null as number | null,
        speechDetected: false,
        dataInterval: null as NodeJS.Timeout | null,
    });

    const stopListening = React.useCallback(async () => {
        console.log('Stopping listening');
        setAudioState('stopping');

        if (audioRef.current.stream) {
            audioRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (audioRef.current.audioContext && audioRef.current.audioContext.state !== 'closed') {
            await audioRef.current.audioContext.close();
            audioRef.current.audioContext = null;
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
                    setAudioState('inactive');
                    setVolume(0);
                    resolve();
                };
                audioRef.current.mediaRecorder!.stop();
            });
        } else {
            console.log('MediaRecorder was not active');
            setAudioState('inactive');
            setVolume(0);
            return Promise.resolve();
        }
    }, [sendAudioToServer]);

    const startListening = React.useCallback(async () => {
        console.log('Starting listening');
        setError(null);
        setAudioState('starting');
        audioRef.current.chunks = []; // Reset chunks
        audioRef.current.silenceStart = null;
        audioRef.current.speechDetected = false;

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

            audioRef.current.mediaRecorder.start(200); // Collect data every 100ms

            const updateVolume = _.throttle(() => {
                if (audioRef.current.analyser) {
                    audioRef.current.analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                    const cappedVolume = Math.min(average, 200);
                    setVolume(cappedVolume);

                    // Check for speech
                    if (average > SPEECH_THRESHOLD) {
                        audioRef.current.speechDetected = true;
                    }

                    // Check for silence only if speech was detected before
                    if (audioRef.current.speechDetected) {
                        if (average < SILENCE_THRESHOLD) {
                            if (audioRef.current.silenceStart === null) {
                                audioRef.current.silenceStart = Date.now();
                            } else if (Date.now() - audioRef.current.silenceStart > SILENCE_DURATION) {
                                console.log('Silence detected for 3 seconds after speech, stopping recording');
                                stopListening();
                                return; // Stop the animation loop
                            }
                        } else {
                            audioRef.current.silenceStart = null;
                        }
                    }
                }
                audioRef.current.animationFrame = requestAnimationFrame(updateVolume);
            }, 75);

            updateVolume();
            setAudioState('active');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setError('Error accessing microphone. Please check your permissions and try again.');
            setAudioState('inactive');
        }
    }, [stopListening]);

    const toggleListening = React.useCallback(async () => {
        console.log('Toggle listening called. Current state:', audioState);
        if (audioState === 'inactive') {
            await startListening();
        } else if (audioState === 'active') {
            await stopListening();
        }
        // If state is 'starting' or 'stopping', do nothing
    }, [audioState, startListening, stopListening]);

    React.useEffect(() => {
        return () => {
            if (audioRef.current.stream || audioRef.current.audioContext || audioRef.current.mediaRecorder) {
                stopListening();
            }
        };
    }, []);

    return {
        isListening: audioState === 'active',
        isStarting: audioState === 'starting',
        isStopping: audioState === 'stopping',
        volume,
        toggleListening,
        error,
        transcribedText,
        isTranscribing,
        transcriptionError
    };
};