import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { askAboutResumeFetch, suggestFollowupQuestionsFetch } from "~/server/api/utils/openaifetch";


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
      const response = await askAboutResumeFetch(input)
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
      const response = await suggestFollowupQuestionsFetch(input)
      const answer = response.text;
      const followupQuestions = answer.split('\n').map((q) => q.trim()).filter((q) => q.length > 5).filter((q) => q !== 'Followup questions:')
      return { response: followupQuestions }
    }),
});
