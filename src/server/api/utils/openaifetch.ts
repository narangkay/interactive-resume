import { env } from "~/env.mjs";
import { askAboutResumePrompt, followupQuestionsPrompt } from "./prompts";
import { type askAboutResumeInputType, type suggestFollowupQuestionsInputType } from "~/utils/types";

const openAiFetch = async (url: string, params: any): Promise<Response> => {
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
    return fetchResponse
}

export const askAboutResumeFetch = async (input: askAboutResumeInputType) => {
    const messagesWithInstructions = [{ role: "assistant", content: askAboutResumePrompt() }, ...input.messages]
    console.log(messagesWithInstructions[messagesWithInstructions.length - 1])
    return openAiFetch("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: messagesWithInstructions,
    })
}

export const suggestFollowupQuestionsFetch = async (input: suggestFollowupQuestionsInputType) => {
    const prompt = followupQuestionsPrompt(input.lastQuestion)
    return openAiFetch("https://api.openai.com/v1/completions", {
        model: "text-curie-001",
        temperature: 0,
        prompt: prompt,
        max_tokens: 200,
    })
}