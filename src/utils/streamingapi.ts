import { useState } from "react"
import { type askAboutResumeOutputType, type askAboutResumeInputType, type streamingAPIInputType, type suggestFollowupQuestionsInputType, type suggestFollowupQuestionsOutputType } from "./types";


function useStreamingOpenAi() {
    const [state, setState] = useState<{ isLoading: boolean, isError: boolean, error?: { message: string } }>({
        isLoading: false,
        isError: false,
    })
    return {
        state,
        fetchWrapper: (params: streamingAPIInputType, onStream: (response: string) => void) => {
            setState({ isError: false, isLoading: true })
            fetch("/api/streamingtrpc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            })
                .then(async (response) => {
                    if (!response.ok) {
                        setState({ isLoading: false, isError: true, error: { message: `Open AI returned error ${response.status}: ${response.statusText}` } })
                        return
                    }

                    const data = response.body;
                    if (!data) {
                        setState({ isLoading: false, isError: true, error: { message: "Open AI returned no response" } })
                        return
                    }
                    const reader = data.getReader();
                    const decoder = new TextDecoder();
                    let done = false;

                    let allChunks = ""
                    while (!done) {
                        const { value, done: doneReading } = await reader.read();
                        done = doneReading;
                        const chunkValue = decoder.decode(value);
                        allChunks += chunkValue;
                        onStream(allChunks)
                        await new Promise((resolve) => {
                            setTimeout(resolve, 100);
                          });
                    }
                    setState({ ...state, isLoading: false })
                })
                .catch((_error) => {
                    setState({ isLoading: false, isError: true, error: { message: "Unknown error" } })
                });
        }
    }
}

export function useAskAboutResume() {
    const { state, fetchWrapper } = useStreamingOpenAi()
    return {
        ...state,
        mutate: (input: askAboutResumeInputType, params: { onSuccess: (data: askAboutResumeOutputType) => void }) => {
            fetchWrapper({ endpoint: "askAboutResume", params: input }, (response) => {
                params.onSuccess({ response: [...input.messages, { role: "assistant", content: response }] })
            })
        }
    }
}

export function useSuggestFollowupQuestions() {
    const { state, fetchWrapper } = useStreamingOpenAi()
    return {
        ...state,
        mutate: (input: suggestFollowupQuestionsInputType, params: { onSuccess: (data: suggestFollowupQuestionsOutputType) => void }) => {
            fetchWrapper({ endpoint: "suggestFollowupQuestions", params: input }, (response) => {
                params.onSuccess({ response: response.split('\n').map((q) => q.trim()).filter((q) => q.length > 5).filter((q) => q !== 'Followup questions:') })
            })
        }
    }
}