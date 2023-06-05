import { useState } from "react"
import { type statusType, type stateType, type resumeExpertType, type askAboutResumeOutputType, type askAboutResumeInputType, type streamingAPIInputType, type suggestFollowupQuestionsInputType, type suggestFollowupQuestionsOutputType, errorType, progressType } from "./types";
import { useLocalModel } from "./localmodel";
import { askForFollowupQuestions } from "./prompts";

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
    const [askAboutResumeStatus, setAskAboutResumeStatus] = useState<statusType>("idle")
    const [suggestFollowupQuestionsStatus, setSuggestFollowupQuestionsStatus] = useState<statusType>("idle")
    const [enabled, setEnabled] = useState(false)
    const [modelProgress, setModelProgress] = useState<progressType>({ message: "", percentage: 0 })
    const model = useLocalModel(enabled, (status, progress) => {
        console.log(`model status: ${status} progress: ${progress}`)
        setModelProgress({ message: status, percentage: (100 * progress) })
    })
    return {
        modelState: getState(model.status, model.error as Error | undefined, modelProgress),
        askAboutResumeState: getState(askAboutResumeStatus),
        suggestFollowupQuestionsState: getState(suggestFollowupQuestionsStatus),
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
            setAskAboutResumeStatus("loading");
            setSuggestFollowupQuestionsStatus("loading");
            model.data?.generate(input.askAboutResumeInput.lastQuestion, (_step: number, message: string) => {
                params.onAskAboutResumeSuccess({ response: [...input.askAboutResumeInput.messages, { role: "assistant", content: message }] });
            }).then((response) => {
                params.onAskAboutResumeSuccess({ response: [...input.askAboutResumeInput.messages, { role: "assistant", content: response }] });
                setAskAboutResumeStatus("success");
            }).catch((error: errorType) => {
                console.log(error)
                setAskAboutResumeStatus("error");
            }).then(() => {
                return model.data?.generate(askForFollowupQuestions(), (_step: number, message: string) => {
                    params.onSuggestFollowupQuestionsSuccess({
                        response:
                            message.split('\n').map((q) => q.trim()).map(q => q.replace(/^\d+\.\s*/, "")).filter((q) => q.length > 5)
                    });
                })
            }).then((response) => {
                params.onSuggestFollowupQuestionsSuccess({
                    response:
                        response.split('\n').map((q) => q.trim()).map(q => q.replace(/^\d+\.\s*/, "")).filter((q) => q.length > 5)
                });
                setSuggestFollowupQuestionsStatus("success");
            }).catch((error: errorType) => {
                console.log(error)
                setSuggestFollowupQuestionsStatus("error");
            })
        }
    }
}