
export type askAboutResumeInputType = { messages: { role: "user" | "assistant"; content: string }[] }

export type suggestFollowupQuestionsInputType = { lastQuestion: string }