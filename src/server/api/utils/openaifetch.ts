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

export const askAboutResumeFetch = async (input: askAboutResumeInputType, stream: boolean = false) => {
    const messagesWithInstructions = [{ role: "assistant", content: askAboutResumePrompt() }, ...input.messages]
    console.log(messagesWithInstructions[messagesWithInstructions.length - 1])
    return openAiFetch("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: messagesWithInstructions,
        stream: stream,
    })
}

export const suggestFollowupQuestionsFetch = async (input: suggestFollowupQuestionsInputType, stream: boolean = false) => {
    const prompt = followupQuestionsPrompt(input.lastQuestion)
    return openAiFetch("https://api.openai.com/v1/completions", {
        model: "text-curie-001",
        temperature: 0,
        prompt: prompt,
        max_tokens: 200,
        stream: stream,
    })
}

const parseResponse = <T>(json: any): T | undefined => {
    const data = json as { id: string, choices: Array<T>, }
    console.log(data?.id)
    const response = data?.choices[0]
    console.log(response)
    return response
}

export const parseAskAboutResumeResponse = (json: any): string => {
    return parseResponse<{ message: { content: string } }>(json)?.message?.content ?? ""
}

export const parseSuggestFollowupQuestionsResponse = (json: any): string => {
    return parseResponse<{ text: string }>(json)?.text ?? ""
}