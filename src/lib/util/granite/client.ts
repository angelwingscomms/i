const MODEL_ID = 'onnx-community/granite-4.0-350m-ONNX-web';
const MAX_NEW_TOKENS = 512;

export type GraniteRole = 'system' | 'user' | 'assistant';

export interface GraniteMessage {
	role: GraniteRole;
	content: string;
}

export interface GraniteLoadOptions {
	on_progress?: (value: number) => void;
}

export interface GraniteGenerateOptions {
	on_token?: (value: string) => void;
}

interface GraniteInstance {
	model: any;
	tokenizer: any;
}

const model_cache: Record<string, Promise<GraniteInstance> | GraniteInstance> = {};
let transformer_module: Promise<typeof import('@huggingface/transformers')> | null = null;

export const supports_webgpu = () => typeof navigator !== 'undefined' && 'gpu' in navigator;

export const create_granite_client = () => {
	let past_key_values: unknown = null;

	const ensure_transformers = async () => {
		if (!transformer_module) {
			transformer_module = import('@huggingface/transformers');
		}
		return transformer_module;
	};

	const load = async (options?: GraniteLoadOptions) => {
		if (!supports_webgpu()) {
			throw new Error('webgpu is required');
		}

		const cached = model_cache[MODEL_ID];
		if (cached && !(cached instanceof Promise)) {
			return cached;
		}

		if (!cached) {
			model_cache[MODEL_ID] = (async () => {
				const { AutoModelForCausalLM, AutoTokenizer } =
					await ensure_transformers();
				const progress_callback = (progress: { loaded?: number; total?: number }) => {
					if (!options?.on_progress || !progress.loaded || !progress.total) return;
					const ratio = progress.total === 0 ? 0 : progress.loaded / progress.total;
					options.on_progress(Math.min(100, Math.round(ratio * 100)));
				};
				const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
					progress_callback
				});
				const model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
					dtype: 'fp16',
					device: 'webgpu',
					progress_callback
				});
				return { model, tokenizer } satisfies GraniteInstance;
			})();
		}

		const promise = model_cache[MODEL_ID];
		if (promise instanceof Promise) {
			const resolved = await promise;
			model_cache[MODEL_ID] = resolved;
			options?.on_progress?.(100);
			return resolved;
		}
		options?.on_progress?.(100);
		return promise;
	};

	const generate = async (
		messages: GraniteMessage[],
		options?: GraniteGenerateOptions
	) => {
		const instance = await load();
		return generate_with_instance(instance, messages, options);
	};

	const generate_with_instance = async (
		instance: GraniteInstance,
		messages: GraniteMessage[],
		options?: GraniteGenerateOptions
	) => {
		const { TextStreamer } = await ensure_transformers();
		const { model, tokenizer } = instance;
		const input = tokenizer.apply_chat_template(messages, {
			add_generation_prompt: true,
			return_dict: true
		});
		const streamer = options?.on_token
			? new TextStreamer(tokenizer, {
				callback_function: (token: string) => options.on_token?.(token),
				skip_prompt: true,
				skip_special_tokens: true
			})
			: undefined;
		const { sequences, past_key_values: new_past_key_values } = await model.generate({
			...input,
			past_key_values,
			max_new_tokens: MAX_NEW_TOKENS,
			do_sample: false,
			streamer,
			return_dict_in_generate: true
		});
		past_key_values = new_past_key_values;
		const prompt_length = input.input_ids.dims[1];
		const [decoded] = tokenizer.batch_decode(
			sequences.slice(null, [prompt_length, null]),
			{ skip_special_tokens: true }
		);
		return decoded.trim();
	};

	const reset = () => {
		past_key_values = null;
	};

	return { load, generate, reset };
};
