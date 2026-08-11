import { browser } from '$app/env';

export const isReducedMotion = browser
	? window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
	: true;
