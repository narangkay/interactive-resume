export type messageType = { role: "user" | "assistant"; content: string }

export type askAboutResumeInputType = { lastQuestion: string, messages: messageType[] }

export type askAboutResumeOutputType = { response: messageType[] }

export type suggestFollowupQuestionsInputType = { lastQuestion: string }

export type suggestFollowupQuestionsOutputType = { response: string[] }

export type streamingAPIInputType = { endpoint: "askAboutResume", params: askAboutResumeInputType } | { endpoint: "suggestFollowupQuestions", params: suggestFollowupQuestionsInputType }

export type statusType = "loading" | "idle" | "success" | "error"

export type errorType = { message: string }

export type progressType = { message: string, percentage: number }

export type stateType = {
    status: statusType,
    isSuccess: boolean,
    isLoading: boolean,
    isError: boolean,
    isIdle: boolean,
    error?: errorType,
    progress?: progressType,
}

export type resumeExpertType = {
    modelState: stateType,
    askAboutResumeState: stateType,
    suggestFollowupQuestionsState: stateType,
    fetchModel: () => void,
    mutate: (
        input: {
            askAboutResumeInput: askAboutResumeInputType,
            suggestFollowupQuestionsInput: suggestFollowupQuestionsInputType,
        },
        params: {
            onAskAboutResumeSuccess: (data: askAboutResumeOutputType) => void,
            onSuggestFollowupQuestionsSuccess: (data: suggestFollowupQuestionsOutputType) => void,
        }) => void
}