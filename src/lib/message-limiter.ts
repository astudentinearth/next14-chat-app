import { RateLimiterMemory } from "rate-limiter-flexible";

export const messagesLimiter = new RateLimiterMemory({
	points: 30,
	duration: 60
});

export const joinLimiter = new RateLimiterMemory({
	points: 20,
	duration: 60
});

export const socketLimiter = new RateLimiterMemory({
	points: 250,
	duration: 60
});
