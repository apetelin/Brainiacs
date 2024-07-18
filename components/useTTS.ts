import * as React from "react";


export function useTTS() {
    const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);

    function submitVoice(text: string) {
        return fetch('/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, voice: 'nova' }),
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }
            return response.blob();

        }).then((blob) => {
            const url = URL.createObjectURL(blob);
            const newAudio = new Audio(url);
            setAudio(newAudio);
            newAudio.play();
        }).catch(e => console.log('TTS error:', e));
    }

    return {submitVoice};
}