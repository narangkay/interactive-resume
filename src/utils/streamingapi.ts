import { useState } from "react"
import { type resumeExpertType, type stateType, type askAboutResumeOutputType, type askAboutResumeInputType, type streamingAPIInputType, type suggestFollowupQuestionsInputType, type suggestFollowupQuestionsOutputType } from "./types";


function useStreamingOpenAi() {
    const [state, setState] = useState<stateType>({
        status: "idle",
        isIdle: true,
        isSuccess: false,
        isLoading: false,
        isError: false,
    })
    return {
        state,
        fetchWrapper: (params: streamingAPIInputType, onStream: (response: string) => void) => {
            setState({ status: "loading", isIdle: false, isSuccess: false, isError: false, isLoading: true })
            fetch("/api/streamingtrpc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            })
                .then(async (response) => {
                    if (!response.ok) {
                        setState({ status: "error", isIdle: false, isSuccess: false, isLoading: false, isError: true, error: { message: `Open AI returned error ${response.status}: ${response.statusText}` } })
                        return
                    }

                    const data = response.body;
                    if (!data) {
                        setState({ status: "error", isIdle: false, isSuccess: false, isLoading: false, isError: true, error: { message: "Open AI returned no response" } })
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
                    setState({ status: "success", isIdle: false, isSuccess: true, isLoading: false, isError: false })
                })
                .catch((_error) => {
                    setState({ status: "error", isIdle: false, isSuccess: false, isLoading: false, isError: true, error: { message: "Unknown error" } })
                });
        }
    }
}

function useAskAboutResume() {
    const { state, fetchWrapper } = useStreamingOpenAi()
    return {
        state,
        mutate: (input: askAboutResumeInputType, params: { onSuccess: (data: askAboutResumeOutputType) => void }) => {
            fetchWrapper({ endpoint: "askAboutResume", params: input }, (response) => {
                params.onSuccess({ response: [...input.messages, { role: "assistant", content: response }] })
            })
        }
    }
}

function useSuggestFollowupQuestions() {
    const { state, fetchWrapper } = useStreamingOpenAi()
    return {
        state,
        mutate: (input: suggestFollowupQuestionsInputType, params: { onSuccess: (data: suggestFollowupQuestionsOutputType) => void }) => {
            fetchWrapper({ endpoint: "suggestFollowupQuestions", params: input }, (response) => {
                params.onSuccess({ response: response.split('\n').map((q) => q.trim()).filter((q) => q.length > 5).filter((q) => q !== 'Followup questions:') })
            })
        }
    }
}

export function useResumeExpert(): resumeExpertType {
    const { state: askAboutResumeState, mutate: askAboutResume } = useAskAboutResume();
    const { state: suggestFollowupQuestionsState, mutate: suggestFollowupQuestions } = useSuggestFollowupQuestions();
    return {
        modelState: { status: "success", isIdle: false, isSuccess: true, isLoading: false, isError: false },
        askAboutResumeState: askAboutResumeState,
        suggestFollowupQuestionsState: suggestFollowupQuestionsState,
        fetchModel: (params?: { onSuccess?: () => void }) => {
            if (params?.onSuccess) {
                params.onSuccess()
            }
        },
        mutate: (
            input: {
                askAboutResumeInput: askAboutResumeInputType,
                suggestFollowupQuestionsInput: suggestFollowupQuestionsInputType,
            },
            params: {
                onAskAboutResumeSuccess: (data: askAboutResumeOutputType) => void,
                onSuggestFollowupQuestionsSuccess: (data: suggestFollowupQuestionsOutputType) => void,
            }) => {
            askAboutResume(input.askAboutResumeInput, { onSuccess: params.onAskAboutResumeSuccess })
            suggestFollowupQuestions(input.suggestFollowupQuestionsInput, { onSuccess: params.onSuggestFollowupQuestionsSuccess })
        }
    }
}