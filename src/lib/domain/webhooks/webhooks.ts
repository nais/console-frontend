import type { WebhookEventTypes$result } from '$houdini';

export const WEBHOOK_SECRET_MIN_LENGTH = 8;
export type WebhookEventType = WebhookEventTypes$result['webhookEventTypes'][number];

export function formatWebhookEventName(
	type: string,
	catalogue: readonly WebhookEventType[]
): string {
	return (
		catalogue.find((event) => event.type === type || event.cloudEventType === type)?.description ??
		type
	);
}

export function canViewWebhooks(viewer: {
	viewerIsMember: boolean;
	viewerIsOwner: boolean;
	isAdmin: boolean;
}): boolean {
	return viewer.viewerIsMember || viewer.viewerIsOwner || viewer.isAdmin;
}

export function webhookUrlError(value: string): string | null {
	const url = value.trim();
	if (!URL.canParse(url) || !/^https:\/\//i.test(url)) {
		return 'Enter a valid HTTPS webhook URL.';
	}
	const parsed = new URL(url);
	if (parsed.username || parsed.password || /^https:\/\/[^/?#]*@/i.test(url)) {
		return 'Webhook URLs cannot contain credentials.';
	}
	if (url.includes('#')) {
		return 'Webhook URLs cannot contain fragments.';
	}
	const hostname = parsed.hostname.replace(/\.+$/, '').toLowerCase();
	if (
		hostname === 'localhost' ||
		hostname.endsWith('.localhost') ||
		hostname.startsWith('[') ||
		/^\d+\.\d+\.\d+\.\d+$/.test(hostname)
	) {
		return 'Webhook URLs must use a hostname other than localhost or an IP address.';
	}
	return null;
}

export interface WebhookFormFields {
	name: string;
	url: string;
	eventScope: 'all' | 'selected';
	eventTypes: string[];
	sourceScope?: 'team' | 'all' | 'selected';
	sourceTeamSlugs?: string[];
	enabled: boolean;
}

export interface WebhookFormResult {
	fields?: WebhookFormFields;
	errors?: string[];
}

export function readWebhookForm(data: FormData, creating: boolean, ownerTeamSlug: string) {
	const nameValue = data.get('name');
	const urlValue = data.get('url');
	const secretValue = data.get('secret');
	const scope = data.get('eventScope');
	const selected = data.getAll('eventTypes');
	const sourceScope = data.get('sourceScope');
	const sourceTeams = data.getAll('sourceTeamSlugs');
	const name = typeof nameValue === 'string' ? nameValue.trim() : '';
	const url = typeof urlValue === 'string' ? urlValue.trim() : '';
	const secret = typeof secretValue === 'string' ? secretValue : '';
	const eventTypes = scope === 'all' ? ['*'] : selected.filter((v) => typeof v === 'string');
	const fields: WebhookFormFields = {
		name,
		url,
		eventScope: scope === 'all' ? 'all' : 'selected',
		eventTypes: [...new Set(eventTypes)],
		...(sourceScope === 'team' || sourceScope === 'all' || sourceScope === 'selected'
			? {
					sourceScope,
					sourceTeamSlugs:
						sourceScope === 'team'
							? [ownerTeamSlug]
							: sourceScope === 'all'
								? []
								: [
										...new Set(
											sourceTeams
												.filter((v) => typeof v === 'string')
												.map((v) => v.trim())
												.filter(Boolean)
										)
									]
				}
			: {}),
		enabled: data.get('enabled') === 'true'
	};
	const errors: string[] = [];

	if (!name) {
		errors.push('A webhook name is required.');
	}
	const urlError = webhookUrlError(url);
	if (urlError) errors.push(urlError);
	if (secretValue !== null && typeof secretValue !== 'string') {
		errors.push('Invalid signing secret.');
	} else if (creating && !secret) {
		errors.push('A signing secret is required.');
	} else if (secret && secret.length < WEBHOOK_SECRET_MIN_LENGTH) {
		errors.push(`The signing secret must be at least ${WEBHOOK_SECRET_MIN_LENGTH} characters.`);
	}
	if (
		sourceScope !== null &&
		sourceScope !== 'team' &&
		sourceScope !== 'all' &&
		sourceScope !== 'selected'
	) {
		errors.push('Choose whether to receive events from this team, all teams, or selected teams.');
	} else if (sourceScope === 'selected') {
		if (sourceTeams.length === 0 || sourceTeams.some((v) => typeof v !== 'string' || !v.trim())) {
			errors.push('Select at least one source team.');
		}
	} else if (sourceScope === null && sourceTeams.length > 0) {
		errors.push('Choose whether to receive events from this team, all teams, or selected teams.');
	}
	if (scope !== 'all' && scope !== 'selected') {
		errors.push('Choose whether to receive all events or selected events.');
	} else if (
		scope === 'selected' &&
		(eventTypes.length === 0 ||
			eventTypes.includes('*') ||
			selected.some((v) => typeof v !== 'string'))
	) {
		errors.push('Select at least one event type from the list.');
	}

	return { fields, secret, errors };
}
