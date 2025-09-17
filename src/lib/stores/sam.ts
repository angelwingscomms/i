import { writable } from 'svelte/store';

import type { ModelInputProps } from '$lib/types/sam';
import type { ModelScaleProps } from '$lib/types/sam';

export const clicks = writable<ModelInputProps[] | null>(null);
export const image = writable<HTMLImageElement | null>(null);
export const mask_img = writable<HTMLImageElement | null>(null);
export const model = writable<any>(null); // InferenceSession
export const tensor = writable<any>(null); // Tensor
export const model_scale = writable<ModelScaleProps | null>(null);