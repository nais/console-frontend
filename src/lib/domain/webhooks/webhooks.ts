import { capitalizeFirstLetter } from '#lib/utils/formatters.js';

export const WEBHOOK_SECRET_MIN_LENGTH = 8;

export function formatWebhookEventName(type: string): string {
	return capitalizeFirstLetter(type.replaceAll('_', ' ').toLowerCase());
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
	if (!URL.canParse(url) || !['http:', 'https:'].includes(new URL(url).protocol)) {
		errors.push('Enter a valid HTTP or HTTPS webhook URL.');
	}
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
