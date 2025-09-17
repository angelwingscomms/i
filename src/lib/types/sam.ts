export interface ModelScaleProps {
	sam_scale: number;
	height: number;
	width: number;
}

export interface ModelInputProps {
	x: number;
	y: number;
	click_type: number;
}

export interface ModelDataProps {
	clicks?: ModelInputProps[];
	tensor: unknown;
	model_scale: ModelScaleProps;
}
