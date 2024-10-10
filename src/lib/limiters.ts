import { RateLimiterAbstract, RateLimiterMemory } from "rate-limiter-flexible";

export const middlewareLimiter = new RateLimiterMemory({
	duration: 60,
	points: 300
});

export const signupLimiter = new RateLimiterMemory({
	duration: 60 * 60 * 24,
	points: 10
});

export const loginLimiter = new RateLimiterMemory({
	duration: 60 * 60,
	points: 8
});

export const chatActionsLimiter = new RateLimiterMemory({
	duration: 60,
	points: 120
});

export const createChannelLimiter = new RateLimiterMemory({
	duration: 180,
	points: 18
});

export async function tryConsume(
	limiter: RateLimiterAbstract,
	key: string | number,
	points: number
) {
	try {
		await limiter.consume(key, points);
	} catch {
		return false;
	}
	return true;
}
