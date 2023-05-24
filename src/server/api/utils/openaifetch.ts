import { env } from "~/env.mjs";
import { TRPCError } from '@trpc/server';
import { askAboutResumePrompt, followupQuestionsPrompt } from "./prompts";

const openAiFetch = async <T>(url: string, params: any): Promise<T> => {
    console.log(params)
    const fetchResponse = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(params),
    })
    console.log(fetchResponse.status)
    console.log(fetchResponse.statusText)
    if (fetchResponse.status !== 200) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `OpenAI returned error ${fetchResponse.status}: ${fetchResponse.statusText}`,
        });
    }
    type JSONResponse = {
        id: string,
        choices: Array<T>,
    }
    const data = await fetchResponse.json() as JSONResponse
    console.log(data)
    console.log(data?.id)
    const response = data?.choices[0]
    console.log(response)
    if (!response) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'OpenAI returned no response',
        });
    }
    return response
}

export const askAboutResumeFetch = async (input: { messages: { role: "user" | "assistant"; content: string }[] }) => {
    const messagesWithInstructions = [{ role: "assistant", content: askAboutResumePrompt() }, ...input.messages]
    console.log(messagesWithInstructions[messagesWithInstructions.length - 1])
    return openAiFetch<{ message: { content: string } }>("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: messagesWithInstructions,
    })
}

export const suggestFollowupQuestionsFetch = async (input: { lastQuestion: string }) => {
    const prompt = followupQuestionsPrompt(input.lastQuestion)
    return openAiFetch<{ text: string }>("https://api.openai.com/v1/completions", {
        model: "text-curie-001",
        temperature: 0,
        prompt: prompt,
        max_tokens: 200,
    })
}