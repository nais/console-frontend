import { onMount } from 'svelte';

const pathname = new URLSearchParams(window.location.search).get('path') ?? '/team/nais';

export const page = {
	url: new URL(pathname, window.location.origin),
	params: { team: pathname.startsWith('/team/') ? pathname.split('/')[2] : undefined }
};

export function afterNavigate(callback: () => void) {
	onMount(() => {
		callback();
		window.addEventListener('test:navigated', callback);
		return () => window.removeEventListener('test:navigated', callback);
	});
}
