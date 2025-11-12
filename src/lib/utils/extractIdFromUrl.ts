export function extractIdFromUrl(url: string): string {
	if (!url) return '';
	const id = url.trim().split('/').at(-1);
	return id && id.length > 0 ? id : '';
}
