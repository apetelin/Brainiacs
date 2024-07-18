import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import { headers } from 'next/headers';

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
    conversation.push({ role: 'system', content: 'you assist this person to make payments from bank account' });
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

async function createPayment(recipient: string, phone: string, details: string, amount: number) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = headers().get('host') || 'localhost:3000';
    const apiUrl = `${protocol}://${host}/api/payments`;

    const userId = 1; // Always set userId to 1
    const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, date, recipient, phone, details, amount }),
        });

        if (!response.ok) {
            throw new Error(`Failed to create payment: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
}


async function getNextMessageInConversation(conversation: ConversationMessage[]): Promise<string | null> {
    try {
        const tools = [
            {
                type: "function",
                function: {
                    name: "create_payment",
                    description: "Create a new payment",
                    parameters: {
                        type: "object",
                        properties: {
                            recipient: { type: "string", description: "Payment recipient" },
                            phone: { type: "string", description: "Recipient phone number" },
                            details: { type: "string", description: "Payment details" },
                            amount: { type: "number", description: "Payment amount" },
                        },
                        required: ["recipient", "phone", "details", "amount"],
                    },
                },
            },
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: conversation,
            tools: tools,
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;

        if (responseMessage.tool_calls) {
            for (const toolCall of responseMessage.tool_calls) {
                if (toolCall.function.name === "create_payment") {
                    const args = JSON.parse(toolCall.function.arguments);
                    try {
                        const paymentResult = await createPayment(
                            args.recipient,
                            args.phone,
                            args.details,
                            args.amount
                        );
                        conversation.push({
                            role: "function",
                            name: "create_payment",
                            content: JSON.stringify(paymentResult),
                        });
                    } catch (error) {
                        console.error('Error creating payment:', error);
                        conversation.push({
                            role: "function",
                            name: "create_payment",
                            content: JSON.stringify({ error: `Failed to create payment: ${error.message}` }),
                        });
                    }
                }
            }

            // Get final response after function call
            const finalResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: conversation,
            });

            return finalResponse.choices[0].message.content;
        }

        return responseMessage.content;
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
            return NextResponse.json({ result: "NOT OK" });
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