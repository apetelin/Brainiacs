import React from "react";
import { sum } from "lodash";


export function useChat() {
    const [sending, setSending] = React.useState<string | boolean>(false);
    const [conversationId, setConversationId] = React.useState<string|undefined>(undefined);
    const [lastReply, setLastReply] = React.useState<string | undefined>(undefined);

    function submit(userMessage: string) {
        setSending(true);
        const formData = new FormData();
        formData.append("userMessage", JSON.stringify(userMessage));
        if (conversationId) {
            formData.append("conversationId", conversationId);
        }
        return fetch('api/chat', {
            method: 'POST',
            body: formData,
        }).then((result) => {
            if (result.ok) {
                return result.json();
            }
            setSending("Error sending message");
        }).then((json) => {
            setSending(false);
            if (json.response) {
                setLastReply(json.response);
            }
            if (json.conversationId) {
                setConversationId(json.conversationId);
            }
            if (json.conversationCompeted) {
                console.log("Conversation Competed");
                setConversationId(undefined);
            }
        })
            .catch((e) => setSending("Error sending message"))
    }

    return {submitChat: submit, sendingChat: sending, conversationId, lastReply};
}