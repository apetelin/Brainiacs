import { RefObject } from 'react';

export type AudioContextRef = RefObject<AudioContext | null>;
export type AnalyserRef = RefObject<AnalyserNode | null>;
export type StreamRef = RefObject<MediaStream | null>;
export type MediaRecorderRef = RefObject<MediaRecorder | null>;

export const maxVolume = 200;
export const maxCircleSize = 600;

export const circles = [
    { baseSize: 300, scaleFactor: 0.25, color: '#0369a1' },
    { baseSize: 300, scaleFactor: 0.5, color: '#0ea5e9' },
    { baseSize: 300, scaleFactor: 0.75, color: '#7dd3fc' },
    { baseSize: 300, scaleFactor: 1.0, color: '#e0f2fe' },
];