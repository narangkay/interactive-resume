export type messageType = { role: "user" | "assistant"; content: string }

export type askAboutResumeInputType = { messages: messageType[] }

export type askAboutResumeOutputType = { response: messageType[] }

export type suggestFollowupQuestionsInputType = { lastQuestion: string }

export type suggestFollowupQuestionsOutputType = { response: string[] }

export type streamingAPIInputType = {endpoint: "askAboutResume", params: askAboutResumeInputType} | {endpoint: "suggestFollowupQuestions", params: suggestFollowupQuestionsInputType}