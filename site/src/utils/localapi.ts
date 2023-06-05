import { useState } from "react"
import { type statusType, type stateType, type resumeExpertType, type askAboutResumeOutputType, type askAboutResumeInputType, type streamingAPIInputType, type suggestFollowupQuestionsInputType, type suggestFollowupQuestionsOutputType, errorType, progressType } from "./types";
import { useLocalModel } from "./localmodel";

export function getState(status: statusType, error?: Error, progress?: progressType): stateType {
    return {
        status,
        isIdle: status === "idle",
        isSuccess: status === "success",
        isLoading: status === "loading",
        isError: status === "error",
        error: status === "error" ? { message: error?.message ?? "Unknonwn error" } : undefined,
        progress: status === "loading" ? progress : undefined,
    }
}

export function useLocalResumeExpert(): resumeExpertType {
    const [state, setState] = useState<{
        askAboutResumeStatus: statusType,
        suggestFollowupQuestionsStatus: statusType,
    }>({
        askAboutResumeStatus: "idle",
        suggestFollowupQuestionsStatus: "idle",
    })
    const [enabled, setEnabled] = useState(false)
    const [modelProgress, setModelProgress] = useState<progressType>({ message: "", percentage: 0 })
    const model = useLocalModel(enabled, (status, progress) => {
        setModelProgress({ message: status, percentage: progress })
    })
    return {
        modelState: getState(model.status, model.error as Error | undefined, modelProgress),
        askAboutResumeState: getState(state.askAboutResumeStatus),
        suggestFollowupQuestionsState: getState(state.suggestFollowupQuestionsStatus),
        fetchModel: () => setEnabled(true),
        mutate: (
            input: {
                askAboutResumeInput: askAboutResumeInputType,
                suggestFollowupQuestionsInput: suggestFollowupQuestionsInputType,
            },
            params: {
                onAskAboutResumeSuccess: (data: askAboutResumeOutputType) => void,
                onSuggestFollowupQuestionsSuccess: (data: suggestFollowupQuestionsOutputType) => void,
            }) => {
            params.onAskAboutResumeSuccess({ response: [...input.askAboutResumeInput.messages, { role: "assistant", content: "I am a resume expert. I can help you with your resume." }] });
            params.onSuggestFollowupQuestionsSuccess({ response: ["What is your name?", "What is your email address?", "What is your phone number?"] })
        }
    }
}