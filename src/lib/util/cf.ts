import { dev } from '$app/environment';

export const cf = (platform: Readonly<App.Platform> | undefined) => {
	return platform.env.fetch;
};
