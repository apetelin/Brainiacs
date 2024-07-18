import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { promises as fs } from 'fs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type ConversationMessage = OpenAI.ChatCompletionMessageParam;

async function readConversationFromFile(conversationId: string | null): Promise<ConversationMessage[] | null> {
    if (!conversationId) {
        console.error('No conversationId provided');
        return null;
    }
    try {
        const fileContent = await fs.readFile(`./file-${conversationId}.json`, 'utf8');
        const conversation: ConversationMessage[] = JSON.parse(fileContent);
        return conversation;
    } catch (error) {
        console.error('Error reading conversation from file:', error);
        return null;
    }
}

function initializeConversation(): ConversationMessage[] {
    const conversation: ConversationMessage[] = [];
    conversation.push({ role: 'system', content: 'you are a helpful assistant to person with dementia' });
    conversation.push({ role: 'system', content: 'you assistant this person to make payments from bank account' });
    conversation.push({ role: 'system', content: 'each response from AI should be short and concise' });
    conversation.push({ role: 'system', content: 'payment could be done from checking account only' });
    conversation.push({ role: 'system', content: 'person with dementia is allowed to make an online transfer only, no check is allowed' });
    return conversation;
}

function convertToJsonString(arrayOfJsons: any[]): string {
    return arrayOfJsons.map(json => JSON.stringify(json)).join('\n');
}

async function writeConversationToFile(conversationId: string, conversation: ConversationMessage[]): Promise<void> {
    const formattedConversation = '[\n' + conversation.map(obj => JSON.stringify(obj)).join(',\n') + '\n]';
    try {
        await fs.writeFile(`./file-${conversationId}.json`, formattedConversation, 'utf8');
        console.log('Conversation written to file successfully.');
    } catch (error) {
        console.error('Error writing conversation to file:', error);
    }
}

async function getNextMessageInConversation(conversation: ConversationMessage[]): Promise<string | null> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: conversation,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error getting next message in conversation:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const userMessage = formData.get('userMessage') as string;
    let conversationId = formData.get('conversationId') as string | null;
    let conversation: OpenAI.Chat.Completions.ChatCompletionMessageParam[] | null;

    if (!userMessage) {
        return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    if (!conversationId) {
        console.error('No conversationId provided');
        const currentDateTime = new Date().toISOString();
        conversationId = currentDateTime.replace(/[^0-9]/g, '');
        conversation = initializeConversation();
        writeConversationToFile(conversationId, conversation);
    } else {
        conversation = await readConversationFromFile(conversationId);
        if (!conversation) {
            return NextResponse.json({ result: "NOT OK" });;
        }
        console.log(JSON.stringify(conversation));
    }
    try {
        console.log("conversation: " + convertToJsonString(conversation))
        conversation.push({ role: 'user', content: userMessage });
        const response = await getNextMessageInConversation(conversation);
        if (!response) {
            return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
        }
        console.log('Response:', response);
        conversation.push({ role: 'assistant', content: response });
        await writeConversationToFile(conversationId!!, conversation);
        return NextResponse.json({ response: response, conversationId: conversationId });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}