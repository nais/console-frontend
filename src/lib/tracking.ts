import { browser } from '$app/environment';

export function trackEvent(name: string, data?: Record<string, string | number | boolean>): void {
	if (!browser || !window.sporing) return;
	if (data) {
		window.sporing.track(name, data);
	} else {
		window.sporing.track(name);
	}
}
