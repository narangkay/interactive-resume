import { type streamingAPIInputType } from "~/utils/types";
import { askAboutResumeFetch, suggestFollowupQuestionsFetch, parseAskAboutResumeResponse, parseSuggestFollowupQuestionsResponse } from "~/server/api/utils/openaifetch";
import { createParser, type ParsedEvent, type ReconnectInterval } from "eventsource-parser";

export const config = {
    runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
    const input = (await req.json()) as streamingAPIInputType;
    let res: Response;
    let responseParser: (jsondata: any, stream: boolean) => string;
    switch (input.endpoint) {
        case "askAboutResume":
            res = await askAboutResumeFetch(input.params, true);
            responseParser = parseAskAboutResumeResponse;
            break;
        case "suggestFollowupQuestions":
            res = await suggestFollowupQuestionsFetch(input.params, true);
            responseParser = parseSuggestFollowupQuestionsResponse;
            break;
    }

    if (res.status !== 200) {
        return new Response(undefined, { status: res.status, statusText: res.statusText });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let counter = 0;

    const stream = new ReadableStream({
        async start(controller) {
            function onParse(event: ParsedEvent | ReconnectInterval) {
                if (event.type === "event") {
                    const data = event.data;
                    if (data === "[DONE]") {
                        controller.close();
                        return;
                    }
                    try {
                        const text = responseParser(JSON.parse(data), true);
                        if (counter < 2 && (text.match(/\n/) || []).length) {
                            return;
                        }
                        const queue = encoder.encode(text);
                        controller.enqueue(queue);
                        counter++;
                    } catch (e) {
                        controller.error(e);
                    }
                }
            }

            // stream response (SSE) from OpenAI may be fragmented into multiple chunks
            // this ensures we properly read chunks & invoke an event for each SSE event stream
            const parser = createParser(onParse);

            // https://web.dev/streams/#asynchronous-iteration
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            for await (const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk as BufferSource));
            }
        },
    });

    return new Response(stream);
};

export default handler;