import { useQuery } from "react-query";
import { ChatModule } from "web-llm";

export function useLocalModel(enabled: boolean, progressCallback: (status: string, progress: number) => void) {
    return useQuery("local-model", async () => {
        const chat = new ChatModule();
        chat.setInitProgressCallback((report) => {
            progressCallback(`loading model - ${report.text}`, report.progress)
        });
        await chat.reload("vicuna-v1-7b-q4f32_0");
        return chat
    }, { enabled })
}