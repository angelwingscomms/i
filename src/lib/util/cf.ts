import { dev } from '$app/environment';

export const cf = (platform: Readonly<App.Platform> | undefined) => {
	console.log('platform', platform);
	console.log('platform.env', platform.env);
	return dev ? fetch : platform.env.r.fetch;
};
