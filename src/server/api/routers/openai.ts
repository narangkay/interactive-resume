import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { askAboutResumeFetch, suggestFollowupQuestionsFetch } from "~/server/api/utils/openaifetch";

const throwErrorOrTransform = async <T>(fetchResponse: Response): Promise<T> => {
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
      message: "OpenAI returned no response"
    })
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
    .output(z.object({
      response: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      ),
    }))
    .mutation(async ({ input }) => {
      const response = await askAboutResumeFetch(input).then(throwErrorOrTransform<{ message: { content: string } }>)
      const answer = response.message.content;
      return {
        response: [
          ...input.messages,
          { role: "assistant", content: answer },
        ]
      };
    }),
  suggestFollowupQuestions: publicProcedure
    .input(z.object({ lastQuestion: z.string(), }))
    .output(z.object({ response: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const response = await suggestFollowupQuestionsFetch(input).then(throwErrorOrTransform<{ text: string }>)
      const answer = response.text;
      const followupQuestions = answer.split('\n').map((q) => q.trim()).filter((q) => q.length > 5).filter((q) => q !== 'Followup questions:')
      return { response: followupQuestions }
    }),
});
