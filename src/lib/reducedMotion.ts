import { browser } from '$app/environment';

export const isReducedMotion = browser
	? window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
	: true;
