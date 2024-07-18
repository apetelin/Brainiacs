import { NextRequest, NextResponse } from 'next/server';
// import { ChatCompletionMessageParam } from 'openai';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';
import { M_PLUS_1 } from 'next/font/google';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type ConversationMessage = {
    role: string;
    content: string;
    name?: string | undefined
};

async function readConversationFromFile(conversationId: string | null): Promise<ConversationMessage[] | null> {
    if (!conversationId) {
        console.error('No conversationId provided');
        return null;
    }

    // const filePath = path.join(__dirname, '..', '..', 'conversations', `history-${conversationId}.json`);

    try {
        const fileContent = await fs.readFile(`./file-${conversationId}.json`, 'utf8');
        // const conversation: ConversationMessage[] = JSON.parse(fileContent);
        const conversation: {role: string, content: string}[] = JSON.parse(fileContent);
        return conversation;
    } catch (error) {
        console.error('Error reading conversation from file:', error);
        return null;
    }
}

function checkFileExists(file: string): Promise<boolean> {
    return fs.access(file, fs.constants.F_OK)
             .then(() => true)
             .catch(() => false)
  }

async function writeResponseToFile(conversationId: string, content: string): Promise<void> {
    // const directoryPath = path.join(__dirname, '..', '..', 'conversations');
    // const filePath = path.join(directoryPath, `file-${conversationId}.json`);
    //const filePath = path.join(directoryPath, filePath);
    try {
      await fs.writeFile(`./file-${conversationId}.json`, content, 'utf8');
      console.log('Response written to file successfully.');
    } catch (error) {
      console.error('Error writing response to file:', error);
    }
  }

async function getNextMessageInConversation(conversationId: string, userMessage: string): Promise<string | null> {
    try {
        let conversation = await readConversationFromFile(conversationId);
        if (!conversation) {
                    // initialize facts & history of transactions
            conversation = [{ role: 'system', content: 'you are a helpful assistant' }];
            conversation.push({ role: 'user', content: userMessage });
        }
    
        // // initialize facts & history of transactions
        // conversation.unshift({ role: 'system', content: 'you are a helpful assistant' });
        // conversation.push({ role: 'user', content: userMessage });

        // var messages = conversation.map(message => ({
        //     role: message.role === "user" ? "user" : "assistant",
        //     content: message.content,
        // }));
        const messages: {role: string, content: string}[] = conversation.map(({ role, content }) => ({
            role: role, // Assuming 'role' matches the 'user' or 'assistant' values expected by the API
            content: content,
            // name: role === "user" ? "User Name" : "Assistant Name",
        }));
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages
            : messages
            // [
            //     {
            //       role: 'system',
            //       content: 'You are a helpful assistant.',
            //     },
            //     {
            //       role: 'user',
            //       content: "Who won the world series in 2020?",
            //     },
            //   ],
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

    if (!userMessage) {
        return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    if (!conversationId) {
        console.error('No conversationId provided');
        // const currentDateTime = new Date().toISOString();
        // conversationId = '1';//currentDateTime.replace(/[^0-9]/g, '');
        // const conversation: Array<ConversationMessage> = [{ role: 'system', content: 'you are a helpful assistant' }];
        // conversation.push({ role: 'user', content: userMessage });
        // writeResponseToFile(conversationId, JSON.stringify(conversation));
    }

    const conversation = await readConversationFromFile(conversationId);
    if (!conversation) {
        return  NextResponse.json({ result: "NOT OK" });;
    }
    console.log(JSON.stringify(conversation));

    return NextResponse.json({ result: "OK" });

    try {
        const response = await getNextMessageInConversation(conversationId!!, userMessage);
        if (!response) {
            return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
        }

        // conversation.push({ role: 'assistant', content: response });

        await writeResponseToFile(conversationId!!, response!!);

        return NextResponse.json({ response: response, conversationId: conversationId });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }




    // expected cnversation:
    // [
    //     {"role": "system", "content": "You are a helpful assistant."},
    //     {"role": "user", "content": "Who won the world series in 2020?"},
    //     {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
    //     {"role": "user", "content": "Where was it played?"}
    // ]
    // const conversation = await readConversationFromFile(conversationId);

    // try {
    //     const response = await openai.chat.completions.create({
    //         model: "gpt-4o",
    //         messages=conversation?.map((message) => ({message.role, message.content})),
    //         // prompt: message,
    //         // max_tokens: 150,
    //         // temperature: 0.7,
    //         // user: conversationId ? conversationId : undefined,
    //     });

    //     // Assuming the response includes a conversation ID and the generated text
    //     const nextConversationId = response.data.id; // This is hypothetical; adjust based on actual API response
    //     const generatedText = response.data.choices[0].text;

    //     return NextResponse.json({ conversation_id: nextConversationId, reply: generatedText });
    // } catch (error) {
    //     console.error('Error generating response:', error);
    //     return NextResponse.json({ error: 'Error generating response' }, { status: 500 });
    // }
}