import { useQuery } from "react-query";
import { ChatModule, hasModelInCache } from "@mlc-ai/web-llm";
import { askAboutResumePrompt } from "~/utils/prompts";

const MODEL_LOCAL_ID = "Llama-2-13b-chat-hf-q4f32_1";

const APP_CONFIG = {
	"model_list": [
		{
			"model_url": "https://huggingface.co/mlc-ai/mlc-chat-Llama-2-7b-chat-hf-q4f32_1/resolve/main/",
			"local_id": "Llama-2-7b-chat-hf-q4f32_1"
		},
		{
			"model_url": "https://huggingface.co/mlc-ai/mlc-chat-Llama-2-13b-chat-hf-q4f32_1/resolve/main/",
			"local_id": "Llama-2-13b-chat-hf-q4f32_1"
		},
		{
			"model_url": "https://huggingface.co/mlc-ai/mlc-chat-Llama-2-7b-chat-hf-q4f16_1/resolve/main/",
			"local_id": "Llama-2-7b-chat-hf-q4f16_1",
			"required_features": ["shader-f16"],
		},
		{
			"model_url": "https://huggingface.co/mlc-ai/mlc-chat-Llama-2-13b-chat-hf-q4f16_1/resolve/main/",
			"local_id": "Llama-2-13b-chat-hf-q4f16_1",
			"required_features": ["shader-f16"],
		},
		{
			"model_url": "https://huggingface.co/mlc-ai/mlc-chat-Llama-2-70b-chat-hf-q4f16_1/resolve/main/",
			"local_id": "Llama-2-70b-chat-hf-q4f16_1",
			"required_features": ["shader-f16"],
		},
		{
			"model_url": "https://huggingface.co/mlc-ai/mlc-chat-RedPajama-INCITE-Chat-3B-v1-q4f32_0/resolve/main/",
			"local_id": "RedPajama-INCITE-Chat-3B-v1-q4f32_0"
		},
		{
			"model_url": "https://huggingface.co/mlc-ai/mlc-chat-vicuna-v1-7b-q4f32_0/resolve/main/",
			"local_id": "vicuna-v1-7b-q4f32_0"
		},
		{
			"model_url": "https://huggingface.co/mlc-ai/mlc-chat-RedPajama-INCITE-Chat-3B-v1-q4f16_0/resolve/main/",
			"local_id": "RedPajama-INCITE-Chat-3B-v1-q4f16_0",
			"required_features": ["shader-f16"],
		}
	],
	"model_lib_map": {
		"Llama-2-7b-chat-hf-q4f32_1": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-7b-chat-hf-q4f32_1-webgpu.wasm",
		"Llama-2-13b-chat-hf-q4f32_1": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-13b-chat-hf-q4f32_1-webgpu.wasm",
		"Llama-2-7b-chat-hf-q4f16_1": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-7b-chat-hf-q4f16_1-webgpu.wasm",
		"Llama-2-13b-chat-hf-q4f16_1": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-13b-chat-hf-q4f16_1-webgpu.wasm",
		"Llama-2-70b-chat-hf-q4f16_1": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-70b-chat-hf-q4f16_1-webgpu.wasm",
		"vicuna-v1-7b-q4f32_0": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/vicuna-v1-7b-q4f32_0-webgpu-v1.wasm",
		"RedPajama-INCITE-Chat-3B-v1-q4f32_0": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/RedPajama-INCITE-Chat-3B-v1-q4f32_0-webgpu-v1.wasm",
		"RedPajama-INCITE-Chat-3B-v1-q4f16_0": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/RedPajama-INCITE-Chat-3B-v1-q4f16_0-webgpu-v1.wasm"
	},
}

export function useLocalModel(enabled: boolean, progressCallback: (status: string, progress: number) => void) {
    return useQuery("local-model", async () => {
        const chat: ChatModule = new ChatModule();
        chat.setInitProgressCallback((report) => {
            progressCallback(`loading model - ${report.text}`, report.progress)
        });
        return chat.reload(MODEL_LOCAL_ID, {
            conv_config: { system: askAboutResumePrompt() }
        }, APP_CONFIG).then(() => chat);
    }, { enabled })
}

export function isModelCached(): Promise<boolean> {
    return hasModelInCache(MODEL_LOCAL_ID, APP_CONFIG);
}