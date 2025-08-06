export function idFromTriggerUrl(triggerUrl: string): string {
	if (!triggerUrl) return '';
	const id = triggerUrl.trim().split('/').at(-1);
	return id && id.length > 0 ? id : '';
}
