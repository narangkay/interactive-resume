import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { askAboutResumeFetch, suggestFollowupQuestionsFetch, parseAskAboutResumeResponse, parseSuggestFollowupQuestionsResponse } from "~/server/api/utils/openaifetch";

const throwErrorOrTransform = async (fetchResponse: Response, parseResponse: (response: Response) => string): Promise<string> => {
  if (fetchResponse.status !== 200) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Open AI returned error ${fetchResponse.status}: ${fetchResponse.statusText}`,
    });
  }
  return await fetchResponse.json().then(parseResponse)
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
      const answer = await askAboutResumeFetch(input).then((fetchResponse) => throwErrorOrTransform(fetchResponse, parseAskAboutResumeResponse))
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
      const answer = await suggestFollowupQuestionsFetch(input).then((fetchResponse) => throwErrorOrTransform(fetchResponse, parseSuggestFollowupQuestionsResponse))
      const followupQuestions = answer.split('\n').map((q) => q.trim()).filter((q) => q.length > 5).filter((q) => q !== 'Followup questions:')
      return { response: followupQuestions }
    }),
});
