import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define types for the request body
type TTSRequestBody = {
    text: string;
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
};

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Validate the voice option
const isValidVoice = (voice: string | undefined): voice is TTSRequestBody['voice'] =>
    voice === undefined || ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(voice);

export async function POST(request: Request) {
    try {
        const { text, voice } = await request.json() as TTSRequestBody;

        // Input validation
        if (!text || text.length > 1000) {
            return NextResponse.json({ error: 'Invalid text input. Must be a string with 1-1000 characters.' }, { status: 400 });
        }

        if (!isValidVoice(voice)) {
            return NextResponse.json({ error: 'Invalid voice option.' }, { status: 400 });
        }

        // Generate speech using OpenAI API
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice || "alloy",
            input: text,
        });

        // Convert the response to a Buffer
        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Return the audio file
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'attachment; filename="speech.mp3"',
            },
        });
    } catch (error) {
        console.error('TTS API error:', error);

        // Determine if it's an OpenAI API error
        if (error instanceof OpenAI.APIError) {
            const status = error.status || 500;
            return NextResponse.json({ error: error.message }, { status });
        }

        // Generic error response
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}