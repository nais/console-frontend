import { browser, dev, version } from '$app/env';
import { base } from '$app/paths';
import { get, writable } from 'svelte/store';

export const appVersionUpdated = writable(false);
let checking: Promise<boolean> | undefined;

export async function checkForUpdate(): Promise<boolean> {
	if (!browser || dev) return false;
	if (get(appVersionUpdated)) return true;
	if (checking) return checking;

	checking = (async () => {
		try {
			const response = await fetch(`${base}/_app/version.json`, { cache: 'no-store' });
			if (!response.ok) {
				throw new Error(`Version check failed: HTTP ${response.status}`);
			}
			const data: unknown = await response.json();
			if (
				!data ||
				typeof data !== 'object' ||
				!('version' in data) ||
				typeof data.version !== 'string' ||
				!data.version
			) {
				throw new Error('Version check returned an invalid version');
			}
			const changed = data.version !== version;
			appVersionUpdated.set(changed);
			return changed;
		} catch (error) {
			console.warn('Unable to check for a new Console version:', error);
			return false;
		}
	})();

	try {
		return await checking;
	} finally {
		checking = undefined;
	}
}

export function reloadForUpdate(url: URL): void {
	if (!browser || dev || !get(appVersionUpdated) || url.origin !== location.origin) return;

	try {
		const key = `console:version-reload:${version}`;
		if (sessionStorage.getItem(key) !== null) return;
		sessionStorage.setItem(key, '1');
		location.assign(url.href);
	} catch (error) {
		console.warn('Unable to reload Console after a version update:', error);
	}
}
