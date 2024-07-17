import {NextRequest, NextResponse} from 'next/server';
import {ChatOpenAI} from "@langchain/openai";
import {BaseMessage, HumanMessage} from "@langchain/core/messages";
import {END, MessageGraph, START} from "@langchain/langgraph";

// Initialize the model and graph outside the handler to reuse them across requests
const model = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY
});
const graph = new MessageGraph();

graph.addNode("oracle", async (state: BaseMessage[]) => {
    return model.invoke(state);
});

graph.addEdge(START, "oracle" as any);
graph.addEdge("oracle" as any, END);

const runnable = graph.compile();

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const res = await runnable.invoke(new HumanMessage(message));

        return NextResponse.json({ response: res[res.length - 1].content });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}