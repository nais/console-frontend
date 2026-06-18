import { browser } from '$app/environment';

export function trackEvent(name: string, data?: Record<string, string | number | boolean>): void {
	if (!browser || !window.sporing) return;
	if (data) {
		window.sporing.track(name, data);
	} else {
		window.sporing.track(name);
	}
}

export function pageTypeFromPath(path: string): string {
	const parts = path.split('/').filter(Boolean);
	if (parts.length >= 4 && parts[0] === 'team') {
		return parts[3];
	}
	if (parts.length >= 2 && parts[0] === 'team') {
		return 'team';
	}
	return 'other';
}
