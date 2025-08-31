import { dev } from '$app/environment';

export const cf = (platform: Readonly<App.Platform> | undefined) => {
	console.log('platform', platform);
	console.log('platform.env', platform.env);
	console.log('platform.env.r.fetch', platform.env.r.fetch);
	console.log('platform.env.R', platform.env.R);
	return dev ? fetch : platform.env.r.fetch;
};
