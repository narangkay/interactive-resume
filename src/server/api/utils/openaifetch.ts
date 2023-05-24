import { env } from "~/env.mjs";
import { TRPCError } from '@trpc/server';

export const openAiFetch = async <T>(url: string, params: any): Promise<T> => {
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