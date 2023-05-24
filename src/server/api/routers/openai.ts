import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';

import { env } from "~/env.mjs";
import { askAboutResumePrompt, followupQuestionsPrompt } from "~/server/api/utils/prompts";

const openAiFetch = async <T>(url: string, params: any): Promise<T> => {
  console.log(params)
  console.log(`env.OPENAI_API_KEY: ${env.OPENAI_API_KEY}`)
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
  if (fetchResponse.status !== 200) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `OpenAI returned error ${fetchResponse.status}: ${fetchResponse.statusText}`,
    });
  }
  type JSONResponse = {
    id: string,
    choices: Array<T>,
  }
  const data = await fetchResponse.json() as JSONResponse
  console.log(data)
  console.log(data?.id)
  const response = data?.choices[0]
  console.log(response)
  if (!response) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'OpenAI returned no response',
    });
  }
  return response
}

export const openaiRouter = createTRPCRouter({
  askAboutResume: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .output(z.object({ response: z.string() }))
    .mutation(async ({ input: { messages } }) => {
      messages = [{ role: "assistant", content: askAboutResumePrompt() }, ...messages]
      console.log(messages[messages.length - 1])
      const response = await openAiFetch<{ message: { content: string } }>("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: messages,
      })
      const answer = response.message.content;
      return {
        response: answer
      };
    }),
  suggestFollowupQuestions: publicProcedure
    .input(z.object({ lastQuestion: z.string(), }))
    .output(z.object({ followupQuestions: z.array(z.string()) }))
    .mutation(async ({ input: { lastQuestion } }) => {
      const prompt = followupQuestionsPrompt(lastQuestion)
      const response = await openAiFetch<{ text: string }>("https://api.openai.com/v1/completions", {
        model: "text-curie-001",
        temperature: 0,
        prompt: prompt,
        max_tokens: 200,
      })
      const answer = response.text;
      const followupQuestions = answer.split('\n').map((q) => q.trim()).filter((q) => q.length > 5).filter((q) => q !== 'Followup questions:')
      return { followupQuestions }
    }),
});
