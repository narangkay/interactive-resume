import { useState } from "react"
import { type statusType, type stateType, type resumeExpertType, type askAboutResumeOutputType, type askAboutResumeInputType, type streamingAPIInputType, type suggestFollowupQuestionsInputType, type suggestFollowupQuestionsOutputType } from "./types";

export function getState(status: statusType): stateType {
    return { status, isIdle: status === "idle", isSuccess: status === "success", isLoading: status === "loading", isError: status === "error" }
}

export function useLocalResumeExpert(): resumeExpertType {
    const [state, setState] = useState<{
        modelStatus: statusType,
        askAboutResumeStatus: statusType,
        suggestFollowupQuestionsStatus: statusType,
    }>({
        modelStatus: "idle",
        askAboutResumeStatus: "idle",
        suggestFollowupQuestionsStatus: "idle",
    })
    return {
        modelState: getState(state.modelStatus),
        askAboutResumeState: getState(state.askAboutResumeStatus),
        suggestFollowupQuestionsState: getState(state.suggestFollowupQuestionsStatus),
        fetchModel: (params?: { onSuccess?: () => void }) => {
            setState({ ...state, modelStatus: "loading" })
            setTimeout(() => {
                setState({ ...state, modelStatus: "success" })
            }, 10000)
            if (params?.onSuccess) { params.onSuccess(); }
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
            params.onAskAboutResumeSuccess({ response: [...input.askAboutResumeInput.messages, { role: "assistant", content: "I am a resume expert. I can help you with your resume." }] });
            params.onSuggestFollowupQuestionsSuccess({ response: ["What is your name?", "What is your email address?", "What is your phone number?"] })
        }
    }
}