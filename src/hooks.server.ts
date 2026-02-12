import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { error, type Handle } from '@sveltejs/kit';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from '$env/static/private';

const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL,
	token: UPSTASH_REDIS_REST_TOKEN
});

const globalLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(100, '15m'),
	analytics: true,
	prefix: 'global'
});

const authLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(10, '1m'),
	analytics: true,
	prefix: 'auth'
});

export const handle: Handle = async ({ event, resolve }) => {
	const ip = event.getClientAddress();
	const path = event.url.pathname;

	if (
		path.startsWith('/_app/') ||
		path.startsWith('/favicon') ||
		path.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|webp|mp3|ogg)$/)
	) {
		return resolve(event, {
			preload: ({ type }) => type === 'font' || type === 'js' || type === 'css'
		});
	}

	let limiter = globalLimit;
	let identifier = ip;

	if (path.startsWith('/auth/')) {
		limiter = authLimit;
		identifier = `auth:${ip}`;
	}

	const { success, limit, reset, remaining } = await limiter.limit(identifier);

	if (!success) {
		const retryAfter = Math.ceil((reset - Date.now()) / 1000);
		throw error(429, {
			message: `Terlalu banyak permintaan. Silakan coba lagi dalam ${retryAfter} detik.`
		});
	}

	const response = await resolve(event, {
		preload: ({ type }) => type === 'font' || type === 'js' || type === 'css'
	});

	response.headers.set('X-RateLimit-Limit', limit.toString());
	response.headers.set('X-RateLimit-Remaining', remaining.toString());
	response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());

	return response;
};
