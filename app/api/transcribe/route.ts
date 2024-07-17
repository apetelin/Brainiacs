import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;

    if (!audio) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    try {
        const response = await openai.audio.transcriptions.create({
            file: audio,
            model: "whisper-1"
        });

        return NextResponse.json({ text: response.text });
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return NextResponse.json({ error: 'Error transcribing audio' }, { status: 500 });
    }
}