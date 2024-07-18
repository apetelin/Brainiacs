import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

async function initializeConversation(): Promise<ConversationMessage[] | null> {
    const conversation: ConversationMessage[] = [];
    conversation.push({ role: 'system', content: 'you are a helpful assistant to person with dementia' });
    conversation.push({ role: 'system', content: 'avoid suggesting what to do next if you don\'t have 100% clear response' });
    conversation.push({ role: 'system', content: 'you assistant this person to make payments from bank account' });
    conversation.push({ role: 'system', content: 'each response from AI should be short and concise' });
    conversation.push({ role: 'system', content: 'payment could be done from checking account only' });
    conversation.push({ role: 'system', content: 'person with dementia is allowed to make an online transfer only, no check is allowed' });
    conversation.push({ role: 'system', content: 'AI assistant that is designed for people with dementia, their caregivers, and their family members. The AI assistant is designed to help people with dementia pay their bills on time, make money transfers, and manage their finances. The AI assistant is also designed to help caregivers and family members keep track of the person with dementia\'s finances and make sure that they are being taken care of properly. The two main features are: 1. Bill Payment: The AI assistant will remind the person with dementia to pay their bills on time and help them make the payment. 2. Money Transfer: The AI assistant will help the person with dementia transfer money to their caregivers or family members. The AI assistant will be able to communicate with the person with dementia through voice commands and text messages. The AI assistant will also be able to send notifications to the person with dementia\'s caregivers and family members to keep them updated on the person with dementia\'s finances. The UI of the AI assistant will be simple and easy to use, with large buttons and clear text. The AI assistant will also have a voice command feature that will allow the person with dementia to interact with the AI assistant using their voice. From the technical perspective, the AI assistant will be built using OpenAI and/or Anthropic services avaialable via API. The AI assistant will be able to understand natural language and respond to voice commands. The AI assistant will also be able to access the person with dementia\'s financial information securely and make payments on their behalf. The proposed frontend framework is React.js and the backend framework is Express.js or Next.js. The database will be PostgreSQL. Potentially, as a stretch goal, the AI assistant will include AI video avatar that will help the person with dementia feel more comfortable and engaged with the AI assistant.' });
    conversation.push({ role: 'system', content: 'AI assistant must come to one decision only: if payment that person with dementia is relative and safe or the payment is not acceptable due to scam or out of sense to be made.' });
    conversation.push({ role: 'system', content: 'If final decision is made by AI assistant then response MUST contain phrase "#END_CHAT#"' });
    conversation.push({ role: 'system', content: 'If function "create_payment" was successfully executed then response MUST contain phrase "#END_CHAT#"' });
    conversation.push({ role: 'system', content: 'Do NOT continue conversation once #END_CHAT# was added to assistant reposponse' });
    const relatives = await prisma.relative.findMany();
    console.debug('relatives:');
    console.debug(JSON.stringify(relatives));
    conversation.push({ role: 'system', content: 'person with dementia has relatives:' + JSON.stringify(relatives) });
    const payments = await prisma.payment.findMany({ orderBy: { date: 'desc' } });
    console.debug('payments:');
    console.debug(JSON.stringify(payments));
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

async function hasReachedDecision(response: string | null): Promise<boolean> {
    return response?.includes("#END_CHAT#") ?? false;
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
        conversation = await initializeConversation();
        if (!conversation) {
            console.error('Failed to initialize conversation');
            conversation = [];
        }
        writeConversationToFile(conversationId, conversation!!);
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
        let response = await getNextMessageInConversation(conversation);
        if (!response) {
            return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
        }
        console.log('Response:', response);
        console.log('hasReachedDecision:')
        const decision = await hasReachedDecision(response);
        console.log(decision)
        if (decision) {
            console.log('Decision reached');            
            response = response.replace('#END_CHAT#', '');
            conversation.push({ role: 'system', content: response });
            conversation.push({ role: 'system', content: '#END_CHAT#' });
        } else {
            conversation.push({ role: 'system', content: response });    
        }
        writeConversationToFile(conversationId, conversation);
        return NextResponse.json({ response: response, conversationId: conversationId, conversationCompeted: decision });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}