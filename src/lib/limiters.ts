import { RateLimiterMemory } from "rate-limiter-flexible";

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
