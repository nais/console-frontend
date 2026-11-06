import type { WebhookSourceTeamSearch$result } from '$houdini';
import type { ComponentProps } from 'svelte';
import { flushSync, mount, unmount } from 'svelte';
import { fromStore, writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebhookDeliveryLog from './WebhookDeliveryLog.svelte';
import WebhookEvents from './WebhookEvents.svelte';
import WebhookForm from './WebhookForm.svelte';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));
vi.mock('$app/state', () => ({ page: { url: new URL('https://console.example.com/') } }));

const { searchTeams } = vi.hoisted(() => ({ searchTeams: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$houdini', () => ({
	graphql: () => ({ subscribe: sourceTeamSearch.subscribe, fetch: searchTeams })
}));

const sourceTeamSearch = writable<{
	data: WebhookSourceTeamSearch$result | null;
	errors: { message: string }[] | null;
	fetching: boolean;
}>({ data: null, errors: null, fetching: false });

const eventTypes = [
	{
		type: 'TEAM_UPDATED',
		description: 'Triggered when a team is updated.',
		group: 'Team',
		teamScoped: true,
		cloudEventType: 'io.nais.team.updated'
	},
	{
		type: 'TEAM_MEMBER_ADDED',
		description: 'Triggered when a team member is added.',
		group: 'Team',
		teamScoped: true,
		cloudEventType: 'io.nais.team.member.added'
	},
	{
		type: 'APPLICATION_DELETED',
		description: 'Triggered when an application is deleted.',
		group: 'Application',
		teamScoped: true,
		cloudEventType: 'io.nais.application.deleted'
	},
	{
		type: 'RECONCILER_ENABLED',
		description: 'Triggered when a reconciler is enabled.',
		group: 'Reconciler',
		teamScoped: false,
		cloudEventType: 'io.nais.reconciler.enabled'
	}
];
const pageInfo = {
	totalCount: 1,
	hasNextPage: true,
	hasPreviousPage: false,
	pageStart: 1,
	pageEnd: 1,
	startCursor: 'first',
	endCursor: 'last'
};
type Delivery = NonNullable<
	ComponentProps<typeof WebhookDeliveryLog>['deliveries']
>['nodes'][number];

const delivery: Delivery = {
	id: 'delivery-id',
	' $fragments': { WebhookDeliveryFields: {} },
	eventType: 'TEAM_UPDATED',
	requestBody: '{"data":{"text":"<script>not executable</script>"}}',
	responseBody: null,
	responseStatus: null,
	isTest: false,
	requestHeaders: [],
	responseHeaders: [],
	responseBodyTruncated: false,
	errorMessage: null,
	deliveryState: null,
	durationMs: 200,
	success: false,
	createdAt: new Date('2026-11-05T10:00:00Z')
};

let cleanup: (() => Promise<void>) | undefined;

beforeEach(() => {
	vi.clearAllMocks();
	sourceTeamSearch.set({ data: null, errors: null, fetching: false });
});

afterEach(async () => {
	await cleanup?.();
	cleanup = undefined;
	document.body.replaceChildren();
});

function renderForm(props: Partial<ComponentProps<typeof WebhookForm>> = {}) {
	const component = mount(WebhookForm, {
		target: document.body,
		props: {
			eventTypes,
			ownerTeamSlug: 'my-team',
			cancelHref: '/team/my-team/settings/webhooks',
			...props
		}
	});
	cleanup = () => unmount(component);
	flushSync();
}

function renderDeliveries(props: Partial<ComponentProps<typeof WebhookDeliveryLog>> = {}) {
	const defaultDeliveries = { nodes: [delivery], pageInfo };
	const component = mount(WebhookDeliveryLog, {
		target: document.body,
		props: {
			fetching: false,
			onprevious: vi.fn(),
			onnext: vi.fn(),
			...props,
			get deliveries() {
				return props.deliveries === undefined ? defaultDeliveries : props.deliveries;
			},
			get testDelivery() {
				return props.testDelivery;
			}
		}
	});
	cleanup = () => unmount(component);
	flushSync();
}

function selectDeliveryTab(
	label: 'Request' | 'Response',
	details = document.querySelector('.delivery-details')
) {
	const tab = [...(details?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])].find(
		(tab) => tab.textContent?.trim() === label
	);
	if (!tab) throw new Error(`Missing ${label} tab`);
	tab.click();
	flushSync();
	const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
	if (!panel) throw new Error(`Missing ${label} panel`);
	expect(panel.hidden).toBe(false);
	return panel;
}

function renderEvents(types: readonly string[]) {
	const component = mount(WebhookEvents, {
		target: document.body,
		props: { eventTypes: types, metadata: eventTypes }
	});
	cleanup = () => unmount(component);
	flushSync();
}

function openSourceTeamPicker() {
	document.querySelector<HTMLInputElement>('input[name="sourceScope"][value="selected"]')?.click();
	flushSync();
	const button = document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]');
	if (!button) throw new Error('Missing source-team picker button');
	button.click();
	flushSync();
}

function findSourceTeams(query: string) {
	openSourceTeamPicker();
	const input = document.querySelector<HTMLInputElement>(
		'input[placeholder="Search by team name"]'
	);
	if (!input) throw new Error('Missing source-team search');
	input.value = query;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
	const button = [...document.querySelectorAll<HTMLButtonElement>('button')].find(
		(button) => button.textContent?.trim() === 'Search teams'
	);
	if (!button) throw new Error('Missing source-team search button');
	button.click();
	flushSync();
}

describe('webhook names', () => {
	it('renders a labelled, required name field and includes its value in submission', () => {
		renderForm();
		const input = document.querySelector<HTMLInputElement>('input[name="name"]');
		expect(input).not.toBeNull();
		expect(input?.labels?.[0]?.textContent).toContain('Webhook name');
		expect(input?.required).toBe(true);
		expect(input?.value).toBe('');
		expect(input?.checkValidity()).toBe(false);
		input!.value = 'Deployment notifications';
		input!.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		expect(input?.checkValidity()).toBe(true);
		expect(new FormData(document.querySelector('form')!).get('name')).toBe(
			'Deployment notifications'
		);
	});

	it('prefills the existing name when editing', () => {
		renderForm({
			initialFields: {
				name: 'Existing notifications',
				url: 'https://receiver.example.com',
				eventScope: 'all',
				eventTypes: ['*'],
				enabled: true
			}
		});
		expect(document.querySelector<HTMLInputElement>('input[name="name"]')?.value).toBe(
			'Existing notifications'
		);
	});

	it('keeps a rejected blank name instead of restoring the existing name', () => {
		const fields = {
			name: 'Existing notifications',
			url: 'https://receiver.example.com',
			eventScope: 'all' as const,
			eventTypes: ['*'],
			enabled: true
		};
		renderForm({
			initialFields: fields,
			formData: {
				fields: { ...fields, name: '' },
				errors: ['A webhook name is required.']
			}
		});
		expect(document.querySelector<HTMLInputElement>('input[name="name"]')?.value).toBe('');
		expect(document.body.textContent).toContain('A webhook name is required.');
	});
});

describe('webhook signing secrets', () => {
	const initialFields = {
		name: 'Deployment notifications',
		url: 'https://receiver.example.com',
		eventScope: 'all' as const,
		eventTypes: ['*'],
		enabled: true
	};

	it('requires a secret of at least 8 characters on creation', () => {
		renderForm();
		const input = document.querySelector<HTMLInputElement>('input[name="secret"]');
		expect(input?.required).toBe(true);
		expect(input?.minLength).toBe(8);
		expect(input?.checkValidity()).toBe(false);
		expect(new FormData(document.querySelector('form')!).get('secret')).toBe('');
		expect(document.querySelector('input[name="clearSecret"]')).toBeNull();
		expect(document.body.textContent).toContain('at least 8 characters');
	});

	it('allows a blank edit field to preserve the existing secret and cannot clear it', () => {
		renderForm({ initialFields, hasSecret: true });
		const input = document.querySelector<HTMLInputElement>('input[name="secret"]');
		expect(input?.required).toBe(false);
		expect(input?.minLength).toBe(8);
		expect(input?.checkValidity()).toBe(true);
		expect(input?.disabled).toBe(false);
		expect(input?.value).toBe('');
		expect(document.querySelector('input[name="clearSecret"]')).toBeNull();
		expect(document.body.textContent).toContain('Leave blank to keep the current secret');
		expect(new FormData(document.querySelector('form')!).get('clearSecret')).toBeNull();
		expect(new FormData(document.querySelector('form')!).get('secret')).toBe('');
	});

	it('still permits unchanged legacy webhooks without a configured secret', () => {
		renderForm({ initialFields, hasSecret: false });
		expect(document.querySelector('input[name="clearSecret"]')).toBeNull();
		expect(document.querySelector<HTMLInputElement>('input[name="secret"]')?.required).toBe(false);
		expect(document.querySelector<HTMLInputElement>('input[name="secret"]')?.disabled).toBe(false);
		expect(document.body.textContent).toContain('No secret configured.');
		expect(document.body.textContent).toContain('at least 8 characters to replace it');
	});

	it('does not repopulate the secret after validation fails', () => {
		renderForm({
			initialFields,
			hasSecret: true,
			formData: {
				fields: initialFields,
				errors: ['The signing secret must be at least 8 characters.']
			}
		});
		const input = document.querySelector<HTMLInputElement>('input[name="secret"]');
		expect(input?.value).toBe('');
		expect(input?.disabled).toBe(false);
		expect(new FormData(document.querySelector('form')!).get('clearSecret')).toBeNull();
		expect(document.body.textContent).toContain(
			'The signing secret must be at least 8 characters.'
		);
	});
});

describe('webhook source teams', () => {
	it('defaults creation to the owning team without fetching suggestions on mount', () => {
		renderForm();
		expect(
			document.querySelector<HTMLInputElement>('input[name="sourceScope"][value="team"]')?.checked
		).toBe(true);
		expect(
			[...document.querySelectorAll<HTMLInputElement>('input[name="sourceScope"]')].map((input) =>
				input.labels?.[0]?.textContent?.trim()
			)
		).toEqual(['This team', 'All teams', 'Selected teams']);
		expect(document.querySelector('input[name="sourceTeamSlugs"]')).toBeNull();
		expect(document.body.textContent).toContain('Receive events only from my-team.');
		expect(document.body.textContent).not.toContain('Ownership cannot be changed');
		expect(document.body.textContent).not.toContain('Owned by');
		expect(document.querySelector('input[name="teamSlug"]')).toBeNull();
		expect(searchTeams).not.toHaveBeenCalled();
	});

	it.each([
		{ sources: ['my-team'], scope: 'team' },
		{ sources: ['other-team'], scope: 'selected' },
		{ sources: ['my-team', 'other-team'], scope: 'selected' }
	])('derives $scope edit mode from $sources', ({ sources, scope }) => {
		renderForm({
			initialFields: {
				name: 'Deployment notifications',
				url: 'https://receiver.example.com',
				eventScope: 'all',
				eventTypes: ['*'],
				sourceTeamSlugs: sources,
				enabled: true
			}
		});
		expect(
			document.querySelector<HTMLInputElement>(`input[name="sourceScope"][value="${scope}"]`)
				?.checked
		).toBe(true);
	});

	it('submits all teams without a stale selected-team list and restores selection on switching back', () => {
		renderForm();
		document.querySelector<HTMLInputElement>('input[name="sourceScope"][value="all"]')?.click();
		flushSync();
		const form = document.querySelector('form');
		expect(form).not.toBeNull();
		expect(new FormData(form!).getAll('sourceTeamSlugs')).toEqual([]);
		expect(document.body.textContent).toContain('excluding global events');
		document
			.querySelector<HTMLInputElement>('input[name="sourceScope"][value="selected"]')
			?.click();
		flushSync();
		expect(new FormData(form!).getAll('sourceTeamSlugs')).toEqual(['my-team']);
	});

	it('derives all-team edit mode from an empty source list', () => {
		renderForm({
			initialFields: {
				name: 'Deployment notifications',
				url: 'https://receiver.example.com',
				eventScope: 'all',
				eventTypes: ['*'],
				sourceTeamSlugs: [],
				enabled: true
			},
			hasSecret: true
		});
		expect(
			document.querySelector<HTMLInputElement>('input[name="sourceScope"][value="all"]')?.checked
		).toBe(true);
		expect(document.querySelector('input[name="sourceTeamSlugs"]')).toBeNull();
		expect(document.body.textContent).toContain('Secret configured');
		expect(document.querySelector<HTMLInputElement>('input[name="secret"]')?.value).toBe('');
		expect(document.querySelector<HTMLInputElement>('input[name="secret"]')?.required).toBe(false);
	});

	it('keeps an invalid empty selected-team submission selected instead of switching to all teams', () => {
		renderForm({
			formData: {
				fields: {
					name: 'Deployment notifications',
					url: 'https://receiver.example.com',
					eventScope: 'all',
					eventTypes: ['*'],
					sourceScope: 'selected',
					sourceTeamSlugs: [],
					enabled: true
				},
				errors: ['Select at least one source team.']
			}
		});
		expect(
			document.querySelector<HTMLInputElement>('input[name="sourceScope"][value="selected"]')
				?.checked
		).toBe(true);
		expect(
			document.querySelector<HTMLInputElement>('input[name="sourceScope"][value="all"]')?.checked
		).toBe(false);
	});

	it('opens team search in a labelled modal without fetching on open', () => {
		renderForm();
		openSourceTeamPicker();
		const trigger = document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]');
		const dialog = document.querySelector('[role="dialog"]');
		expect(trigger?.getAttribute('aria-expanded')).toBe('true');
		expect(dialog?.id).toBe(trigger?.getAttribute('aria-controls'));
		expect(dialog?.getAttribute('data-state')).toBe('open');
		expect(dialog?.textContent).toContain('Add source teams');
		expect(dialog?.querySelector('input[placeholder="Search by team name"]')).not.toBeNull();
		expect(dialog?.querySelector('input[name="sourceTeamSlugs"]')).toBeNull();
		expect(searchTeams).not.toHaveBeenCalled();
	});

	it('allows searching and selecting another team without changing the owner or duplicating form values', () => {
		sourceTeamSearch.set({
			data: { search: { nodes: [{ __typename: 'Team', slug: 'other-team' }], pageInfo } },
			errors: null,
			fetching: false
		});
		renderForm();
		const form = document.querySelector('form');
		if (!form) throw new Error('Missing webhook form');
		const submit = vi.fn((event: Event) => event.preventDefault());
		form.addEventListener('submit', submit);
		findSourceTeams('other-team');
		expect(searchTeams).toHaveBeenCalledWith({
			variables: { query: 'other-team', after: null, before: null, first: 25, last: null }
		});
		const add = document.querySelector<HTMLButtonElement>('button[aria-label="Add other-team"]');
		expect(add).not.toBeNull();
		expect(document.querySelector('[aria-label="Source team search results"] input')).toBeNull();
		add?.click();
		flushSync();
		expect(
			document.querySelector<HTMLButtonElement>('button[aria-label="Added other-team"]')?.disabled
		).toBe(true);
		const done = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(
			(button) => button.textContent?.trim() === 'Done'
		);
		if (!done) throw new Error('Missing source-team picker Done button');
		done.click();
		flushSync();
		expect(document.querySelector('[role="dialog"]')?.getAttribute('data-state')).toBe('closed');
		expect(new FormData(form).getAll('sourceTeamSlugs')).toEqual(['my-team', 'other-team']);
		expect(document.querySelector('input[name="teamSlug"]')).toBeNull();
		expect(submit).not.toHaveBeenCalled();
		openSourceTeamPicker();
		expect(
			document.querySelector<HTMLButtonElement>('button[aria-label="Added other-team"]')?.disabled
		).toBe(true);
	});

	it('paginates the current search rather than using unsubmitted search text and preserves selections', () => {
		sourceTeamSearch.set({
			data: { search: { nodes: [{ __typename: 'Team', slug: 'other-team' }], pageInfo } },
			errors: null,
			fetching: false
		});
		renderForm();
		findSourceTeams('other-team');
		const input = document.querySelector<HTMLInputElement>(
			'input[placeholder="Search by team name"]'
		);
		if (!input) throw new Error('Missing source-team search');
		input.value = 'different-team';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();
		document.querySelector<HTMLButtonElement>('[aria-label="Next page"]')?.click();
		expect(searchTeams).toHaveBeenLastCalledWith({
			variables: { query: 'other-team', after: 'last', before: null, first: 25, last: null }
		});
		sourceTeamSearch.set({
			data: {
				search: {
					nodes: [{ __typename: 'Team', slug: 'next-team' }],
					pageInfo: { ...pageInfo, hasNextPage: false, hasPreviousPage: true }
				}
			},
			errors: null,
			fetching: false
		});
		flushSync();
		document.querySelector<HTMLButtonElement>('[aria-label="Previous page"]')?.click();
		expect(searchTeams).toHaveBeenLastCalledWith({
			variables: { query: 'other-team', after: null, before: 'first', first: null, last: 25 }
		});
		expect(document.querySelector<HTMLInputElement>('input[name="sourceTeamSlugs"]')?.checked).toBe(
			true
		);
	});

	it('shows team-search errors explicitly instead of presenting them as no results', () => {
		sourceTeamSearch.set({
			data: null,
			errors: [{ message: 'Search unavailable' }],
			fetching: false
		});
		renderForm();
		findSourceTeams('other-team');
		expect(document.body.textContent).toContain('Search unavailable');
		expect(document.body.textContent).not.toContain('No matching teams found.');
	});
});

describe('subscribed webhook events', () => {
	it('shows All events without rendering a list or groups for a wildcard subscription', () => {
		renderEvents(['*']);
		expect(document.body.textContent?.trim()).toBe('All events');
		expect(document.querySelector('button')).toBeNull();
		expect(document.querySelector('ul')).toBeNull();
	});

	it('groups subscribed events using API metadata and starts every group collapsed', () => {
		renderEvents(['TEAM_UPDATED', 'TEAM_MEMBER_ADDED', 'APPLICATION_DELETED']);
		const groups = document.querySelectorAll('.sh-accordion-item');
		expect(groups).toHaveLength(2);
		expect(groups[0].querySelector('button')?.textContent).toContain('Application');
		expect(groups[1].querySelector('button')?.textContent).toContain('Team');
		expect(groups[1].querySelector('button')?.textContent?.replace(/\s/g, '')).toBe('Team2');
		for (const group of groups) {
			expect(group.querySelector('button')?.getAttribute('aria-expanded')).toBe('false');
			expect(group.querySelector('.sh-accordion-content--closed')).not.toBeNull();
		}

		groups[1].querySelector('button')?.click();
		flushSync();
		expect(groups[1].querySelector('button')?.getAttribute('aria-expanded')).toBe('true');
		expect(groups[1].querySelector('.sh-accordion-content--closed')).toBeNull();
		expect(groups[1].querySelector('ul')?.textContent).toContain('Team updated');
		expect(groups[1].querySelector('ul')?.textContent).toContain('Team member added');
		expect(groups[0].querySelector('button')?.getAttribute('aria-expanded')).toBe('false');
		expect(document.body.textContent).not.toContain('Reconciler');
	});

	it('keeps unrecognized subscribed events visible in a separate group', () => {
		renderEvents(['FUTURE_EVENT']);
		expect(document.querySelector('button')?.textContent).toContain('Other events');
		expect(document.querySelector('li')?.textContent).toBe('Future event');
	});

	it('explicitly displays an empty subscription', () => {
		renderEvents([]);
		expect(document.body.textContent?.trim()).toBe('No events selected.');
		expect(document.querySelector('button')).toBeNull();
	});
});

describe('webhook form', () => {
	it('offers only team-scoped event types, with all team events selected by default', () => {
		renderForm();
		expect(
			document.querySelector<HTMLInputElement>('input[name="eventScope"][value="all"]')?.checked
		).toBe(true);
		expect(document.querySelector('input[value="TEAM_UPDATED"]')).not.toBeNull();
		expect(document.querySelector('input[value="RECONCILER_ENABLED"]')).toBeNull();
		expect(document.querySelector('input[name="enabled"]')).toBeNull();
		expect(document.querySelector<HTMLInputElement>('input[name="secret"]')?.type).toBe('password');
		expect(document.querySelector<HTMLInputElement>('input[name="secret"]')?.required).toBe(true);
	});

	it.each([
		['APPLICATION_DELETED', 'Application deleted', 'io.nais.application.deleted'],
		['TEAM_MEMBER_ADDED', 'Team member added', 'io.nais.team.member.added']
	])(
		'uses a short label for %s with the API description and CloudEvents type underneath',
		(type, title, cloudEventType) => {
			renderForm({ eventTypes: [{ ...eventTypes[0], type, cloudEventType }] });
			const checkbox = document.querySelector<HTMLInputElement>(`input[value="${type}"]`);
			expect(checkbox?.labels?.[0]?.textContent?.trim()).toBe(title);
			const description = document.getElementById(checkbox?.getAttribute('aria-describedby') ?? '');
			expect(description?.querySelector('div')?.textContent?.trim()).toBe(
				eventTypes[0].description
			);
			expect(description?.querySelector('code')?.textContent).toBe(cloudEventType);
		}
	);

	it('submits explicitly selected events', () => {
		renderForm();
		document.querySelector<HTMLInputElement>('input[name="eventScope"][value="selected"]')?.click();
		document.querySelector<HTMLInputElement>('input[value="TEAM_UPDATED"]')?.click();
		flushSync();
		const form = document.querySelector('form');
		expect(form).not.toBeNull();
		const fields = new FormData(form!);
		expect(fields.get('eventScope')).toBe('selected');
		expect(fields.getAll('eventTypes')).toEqual(['TEAM_UPDATED']);
	});

	it('uses the group title as the toggle label and accessible group name', () => {
		renderForm();
		const group = document.querySelector<HTMLInputElement>('input[value="Team"]');
		const fieldset = group?.closest('fieldset');
		const title = document.getElementById(fieldset?.getAttribute('aria-labelledby') ?? '');
		expect(title?.textContent).toBe('Team');
		expect(group?.labels?.[0]?.contains(title)).toBe(true);
		expect(group?.getAttribute('aria-label')).toBe('Select all Team events');
	});

	it('selects and clears one group without changing other groups or submitting group values', () => {
		renderForm();
		document.querySelector<HTMLInputElement>('input[name="eventScope"][value="selected"]')?.click();
		document.querySelector<HTMLInputElement>('input[value="APPLICATION_DELETED"]')?.click();
		const group = document.querySelector<HTMLInputElement>('input[value="Team"]');
		const form = document.querySelector('form');
		expect(form).not.toBeNull();

		group?.click();
		flushSync();
		expect(group?.checked).toBe(true);
		expect(group?.indeterminate).toBe(false);
		expect(new FormData(form!).getAll('eventTypes')).toEqual([
			'APPLICATION_DELETED',
			'TEAM_UPDATED',
			'TEAM_MEMBER_ADDED'
		]);

		group?.click();
		flushSync();
		expect(group?.checked).toBe(false);
		expect(group?.indeterminate).toBe(false);
		expect(new FormData(form!).getAll('eventTypes')).toEqual(['APPLICATION_DELETED']);
		expect([...new FormData(form!).keys()]).toEqual([
			'name',
			'url',
			'secret',
			'sourceScope',
			'eventScope',
			'eventTypes'
		]);
	});

	it('reflects individual selections and selects the entire group from a mixed state', () => {
		renderForm();
		const group = document.querySelector<HTMLInputElement>('input[value="Team"]');
		const updated = document.querySelector<HTMLInputElement>('input[value="TEAM_UPDATED"]');
		const memberAdded = document.querySelector<HTMLInputElement>(
			'input[value="TEAM_MEMBER_ADDED"]'
		);
		expect(group?.checked).toBe(false);
		expect(group?.indeterminate).toBe(false);

		updated?.click();
		flushSync();
		expect(group?.checked).toBe(false);
		expect(group?.indeterminate).toBe(true);

		group?.click();
		flushSync();
		expect(group?.checked).toBe(true);
		expect(group?.indeterminate).toBe(false);
		expect(updated?.checked).toBe(true);
		expect(memberAdded?.checked).toBe(true);

		memberAdded?.click();
		flushSync();
		expect(group?.checked).toBe(false);
		expect(group?.indeterminate).toBe(true);

		updated?.click();
		flushSync();
		expect(group?.checked).toBe(false);
		expect(group?.indeterminate).toBe(false);
	});

	it('preserves submitted selection and disabled status on a failed edit', () => {
		renderForm({
			initialFields: {
				name: 'Original notifications',
				url: 'https://old.example.com',
				eventScope: 'all',
				eventTypes: ['*'],
				enabled: true
			},
			hasSecret: true,
			formData: {
				errors: ['API error'],
				fields: {
					name: 'Renamed notifications',
					url: 'https://new.example.com',
					eventScope: 'selected',
					eventTypes: ['TEAM_UPDATED'],
					sourceScope: 'selected',
					sourceTeamSlugs: ['other-team'],
					enabled: false
				}
			}
		});
		expect(document.querySelector<HTMLInputElement>('input[name="name"]')?.value).toBe(
			'Renamed notifications'
		);
		expect(document.querySelector<HTMLInputElement>('input[name="name"]')?.required).toBe(true);
		expect(document.querySelector<HTMLInputElement>('input[name="url"]')?.value).toBe(
			'https://new.example.com'
		);
		expect(
			document.querySelector<HTMLInputElement>('input[name="eventScope"][value="selected"]')
				?.checked
		).toBe(true);
		expect(document.querySelector<HTMLInputElement>('input[value="TEAM_UPDATED"]')?.checked).toBe(
			true
		);
		expect(document.querySelector<HTMLInputElement>('input[value="Team"]')?.indeterminate).toBe(
			true
		);
		expect(document.querySelector<HTMLInputElement>('input[name="enabled"]')?.checked).toBe(false);
		expect(document.querySelector<HTMLInputElement>('input[name="secret"]')?.value).toBe('');
		expect(document.querySelector<HTMLInputElement>('input[name="sourceTeamSlugs"]')?.value).toBe(
			'other-team'
		);
		expect(document.body.textContent).toContain('API error');
	});
});

describe('webhook delivery log', () => {
	it.each([true, false])(
		'shows a returned test attempt as an expanded delivery row, success=%s',
		(success) => {
			const testDelivery: Delivery = {
				...delivery,
				id: 'returned-test',
				isTest: true,
				eventType: 'io.nais.webhook.test',
				success,
				responseStatus: success ? 204 : 500,
				errorMessage: success ? null : 'Connection failed',
				deliveryState: {
					status: success ? 'COMPLETED' : 'FAILED',
					attemptCount: 1,
					nextRetryAt: null
				}
			};
			renderDeliveries({ testDelivery });
			const rows = document.querySelectorAll<HTMLTableRowElement>('tbody tr');
			expect(rows).toHaveLength(4);
			expect(rows[0]?.textContent).toContain('Test event');
			expect(rows[0]?.textContent).toContain(success ? 'Success' : 'Failed');
			expect(
				rows[0]?.querySelector('td:last-child')?.textContent?.replaceAll(/\s+/g, ' ').trim()
			).toBe(success ? 'Completed' : 'Failed No retries');
			expect(rows[0]?.querySelector('button')?.getAttribute('aria-expanded')).toBe('true');
			expect(rows[1]?.hidden).toBe(false);
			expect(rows[1]?.textContent).toContain('Attempt 1');
			if (!success) expect(rows[1]?.textContent).toContain('Connection failed');
			expect(rows[3]?.hidden).toBe(true);
			expect(document.body.textContent).not.toContain('Test event result');
		}
	);

	it('does not duplicate a returned attempt that is already in delivery history', () => {
		const testDelivery = { ...delivery, isTest: true };
		renderDeliveries({
			testDelivery,
			deliveries: { nodes: [testDelivery], pageInfo }
		});
		expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
		expect(document.querySelector('h2')?.textContent?.trim()).toBe('Delivery log (1)');
		expect(document.querySelector('button[aria-expanded="true"]')).not.toBeNull();
	});

	it('shows the returned attempt even when loading delivery history failed', () => {
		renderDeliveries({ testDelivery: { ...delivery, isTest: true }, deliveries: null });
		expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
		expect(document.querySelector('button[aria-expanded="true"]')).not.toBeNull();
		expect(document.querySelector('h2')?.textContent?.trim()).toBe('Delivery log');
		expect(document.body.textContent).not.toContain('No delivery attempts yet.');
	});

	it('does not show a stale zero count when a test has just been returned', () => {
		renderDeliveries({
			testDelivery: { ...delivery, isTest: true },
			deliveries: { nodes: [], pageInfo: { ...pageInfo, totalCount: 0 } }
		});
		expect(document.querySelector('h2')?.textContent?.trim()).toBe('Delivery log');
		expect(document.querySelector('table')).not.toBeNull();
	});

	it('allows collapsing a returned attempt and automatically expands the next returned attempt', () => {
		const result = writable<ComponentProps<typeof WebhookDeliveryLog>['testDelivery']>(null);
		const latest = fromStore(result);
		renderDeliveries({
			get testDelivery() {
				return latest.current;
			}
		});
		document.querySelector<HTMLButtonElement>('[aria-label="Expand delivery details"]')?.click();
		flushSync();
		result.set({ ...delivery, id: 'first-test', isTest: true });
		flushSync();
		expect(document.querySelectorAll('button[aria-expanded="true"]')).toHaveLength(2);
		document.querySelector<HTMLButtonElement>('[aria-label="Collapse delivery details"]')?.click();
		flushSync();
		expect(document.querySelector('tbody tr button')?.getAttribute('aria-expanded')).toBe('false');
		result.set({ ...delivery, id: 'second-test', isTest: true });
		flushSync();
		expect(document.querySelector('tbody tr button')?.getAttribute('aria-expanded')).toBe('true');
		expect(document.querySelectorAll('button[aria-expanded="true"]')).toHaveLength(2);
	});

	it('uses readable event names while keeping the raw type available as a tooltip', () => {
		renderDeliveries();
		expect(document.querySelector('[title="TEAM_UPDATED"]')?.textContent).toBe('Team updated');
	});

	it('expands accessible delivery details and displays payloads as text', () => {
		renderDeliveries();
		const button = document.querySelector<HTMLButtonElement>(
			'[aria-label="Expand delivery details"]'
		);
		const details = document.getElementById(button?.getAttribute('aria-controls') ?? '');
		expect(details?.hidden).toBe(true);
		button?.click();
		flushSync();
		expect(button?.getAttribute('aria-expanded')).toBe('true');
		expect(details?.hidden).toBe(false);
		expect(selectDeliveryTab('Request', details).querySelector('pre.body')?.textContent).toBe(
			JSON.stringify(JSON.parse(delivery.requestBody), null, 2)
		);
		expect(document.querySelector('script')).toBeNull();
		expect(selectDeliveryTab('Response', details).textContent).toContain('No text response body.');
		expect(document.body.textContent).toContain('No response');
	});

	it('shows empty-state text outside the table when there are no deliveries', () => {
		renderDeliveries({ deliveries: { nodes: [], pageInfo: { ...pageInfo, totalCount: 0 } } });
		expect(document.body.textContent).toContain('No delivery attempts yet.');
		expect(document.querySelector('table')).toBeNull();
	});

	it('shows successful response bodies and HTTP status', () => {
		renderDeliveries({
			deliveries: {
				nodes: [{ ...delivery, success: true, responseStatus: 204, responseBody: 'accepted' }],
				pageInfo
			}
		});
		expect(document.body.textContent).toContain('204');
		expect(document.body.textContent).toContain('Success');
		expect(selectDeliveryTab('Response').querySelector('pre.body')?.textContent).toBe('accepted');
	});

	it('distinguishes an empty response body from unavailable text', () => {
		renderDeliveries({
			deliveries: {
				nodes: [{ ...delivery, success: true, responseStatus: 204, responseBody: '' }],
				pageInfo
			}
		});
		const response = selectDeliveryTab('Response');
		expect(response.textContent).toContain('Empty response body.');
		expect(response.textContent).not.toContain('No text response body.');
		expect(response.querySelector('pre.body')).toBeNull();
	});

	it('renders all header values as text with bold names', () => {
		renderDeliveries({
			deliveries: {
				nodes: [
					{
						...delivery,
						requestHeaders: [{ name: 'Content-Type', values: ['application/json'] }],
						responseHeaders: [
							{ name: 'X-Diagnostic', values: ['first', '<script>second</script>'] }
						]
					}
				],
				pageInfo
			}
		});
		const request = selectDeliveryTab('Request');
		expect(request.querySelectorAll('pre.headers')).toHaveLength(1);
		expect(request.querySelector('pre.headers')?.textContent).toBe(
			'Content-Type: application/json'
		);
		expect(request.querySelector('pre.headers strong')?.textContent).toBe('Content-Type:');
		const response = selectDeliveryTab('Response');
		expect(response.querySelectorAll('pre.headers')).toHaveLength(1);
		expect(response.querySelector('pre.headers')?.textContent).toBe(
			'X-Diagnostic: first, <script>second</script>'
		);
		expect(response.querySelector('pre.headers strong')?.textContent).toBe('X-Diagnostic:');
		expect(response.querySelector('h3')?.textContent).toBe('Headers');
		expect(document.querySelector('script')).toBeNull();
	});

	it('shows read errors even when an HTTP response was received, and warns about truncation', () => {
		renderDeliveries({
			deliveries: {
				nodes: [
					{
						...delivery,
						responseStatus: 200,
						responseBody: 'partial response',
						responseBodyTruncated: true,
						errorMessage: 'Unable to read the complete response'
					}
				],
				pageInfo
			}
		});
		expect(document.body.textContent).toContain('Unable to read the complete response');
		const response = selectDeliveryTab('Response');
		expect(response.textContent).toContain('truncated to 10 KiB');
		expect(response.querySelector('pre.body')?.textContent).toBe('partial response');
	});

	it('shows each header on its own line in one preformatted block', () => {
		renderDeliveries({
			deliveries: {
				nodes: [
					{
						...delivery,
						requestHeaders: [
							{ name: 'Content-Type', values: ['application/json'] },
							{ name: 'Accept', values: ['application/json', 'text/plain'] }
						]
					}
				],
				pageInfo
			}
		});
		const headers = selectDeliveryTab('Request').querySelector('pre.headers');
		expect(headers?.textContent).toBe(
			'Content-Type: application/json\nAccept: application/json, text/plain'
		);
		expect(headers?.querySelectorAll('strong')).toHaveLength(2);
	});

	it('keeps request/response tabs accessible and independent for each delivery', () => {
		renderDeliveries({
			deliveries: { nodes: [delivery, { ...delivery, id: 'second-delivery' }], pageInfo }
		});
		const details = document.querySelectorAll('.delivery-details');
		const requestTab = details[0]?.querySelector('[role="tab"]');
		const request = document.getElementById(requestTab?.getAttribute('aria-controls') ?? '');
		expect(requestTab?.getAttribute('aria-selected')).toBe('true');
		expect(request?.hidden).toBe(false);
		const response = selectDeliveryTab('Response', details[0]);
		expect(request?.hidden).toBe(true);
		expect(requestTab?.getAttribute('aria-selected')).toBe('false');
		expect(response.getAttribute('aria-labelledby')).not.toBe(
			request?.getAttribute('aria-labelledby')
		);
		const responseTab = document.getElementById(response.getAttribute('aria-labelledby') ?? '');
		expect(responseTab?.getAttribute('aria-selected')).toBe('true');
		expect(responseTab?.getAttribute('aria-controls')).toBe(response.id);
		expect(details[1]?.querySelector('[role="tab"]')?.getAttribute('aria-selected')).toBe('true');
		const ids = [...document.querySelectorAll('[role="tab"], [role="tabpanel"]')].map(
			(element) => element.id
		);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('pretty-prints both JSON bodies without rendering markup from their content', () => {
		const request = { data: { activityLogEntryId: 'entry-id', values: [1, true, null] } };
		const response = { message: '<script>not executable</script>', details: { accepted: true } };
		renderDeliveries({
			deliveries: {
				nodes: [
					{
						...delivery,
						requestBody: JSON.stringify(request),
						responseBody: JSON.stringify(response)
					}
				],
				pageInfo
			}
		});
		expect(selectDeliveryTab('Request').querySelector('pre.body')?.textContent).toBe(
			JSON.stringify(request, null, 2)
		);
		expect(selectDeliveryTab('Response').querySelector('pre.body')?.textContent).toBe(
			JSON.stringify(response, null, 2)
		);
		expect(document.querySelector('script')).toBeNull();
	});

	it.each(['plain text\n  preserve whitespace', '{"incomplete":', '<html>not JSON</html>'])(
		'preserves non-JSON and incomplete bodies unchanged (%s)',
		(body) => {
			renderDeliveries({
				deliveries: { nodes: [{ ...delivery, requestBody: body, responseBody: body }], pageInfo }
			});
			expect(selectDeliveryTab('Request').querySelector('pre.body')?.textContent).toBe(body);
			expect(selectDeliveryTab('Response').querySelector('pre.body')?.textContent).toBe(body);
		}
	);

	it.each([true, false])('labels historical tests by their outcome, success=%s', (success) => {
		renderDeliveries({
			deliveries: {
				nodes: [
					{
						...delivery,
						isTest: true,
						eventType: 'io.nais.webhook.test',
						success,
						deliveryState: {
							status: success ? 'COMPLETED' : 'FAILED',
							attemptCount: 1,
							nextRetryAt: null
						}
					}
				],
				pageInfo
			}
		});
		expect(document.querySelector('[title="io.nais.webhook.test"]')?.textContent).toBe(
			'Test event'
		);
		const row = document.querySelector('tbody tr');
		expect(row?.querySelector('td:last-child')?.textContent?.replaceAll(/\s+/g, ' ').trim()).toBe(
			success ? 'Completed' : 'Failed No retries'
		);
		const details = document.querySelector('.delivery-details');
		expect(details?.textContent).toContain(success ? 'Completed' : 'Failed');
		expect(details?.textContent).toContain('Attempt 1');
		expect(details?.textContent?.includes('No retries')).toBe(!success);
		expect(document.body.textContent).not.toContain('Not queued');
		expect(document.body.textContent).not.toContain('never retried');
		expect(document.body.textContent).not.toContain('do not affect webhook health');
		expect(document.body.textContent).not.toContain('shared');
		expect(document.body.textContent).not.toContain('Current state');
		expect(document.body.textContent).not.toContain('Current delivery state');
		expect(document.body.textContent).not.toContain('Will retry at');
	});

	it('shows unavailable attempt state without inferring expired queue data', () => {
		renderDeliveries();
		expect(document.querySelector('tbody tr td:last-child')?.textContent?.trim()).toBe(
			'Not available'
		);
		expect(document.querySelector('.delivery-details')?.textContent).toContain('Not available');
		expect(document.body.textContent).not.toContain('Queue state');
		expect(document.body.textContent).not.toContain('No retries');
	});

	it('keeps an earlier failed attempt and its scheduled retry unchanged after a later success', () => {
		const nextRetryAt = new Date('2026-01-01T10:00:00Z');
		const firstAttempt: Delivery = {
			...delivery,
			id: 'first-attempt',
			deliveryState: { status: 'FAILED', attemptCount: 1, nextRetryAt }
		};
		const secondAttempt: Delivery = {
			...delivery,
			id: 'second-attempt',
			success: true,
			responseStatus: 200,
			deliveryState: { status: 'COMPLETED', attemptCount: 2, nextRetryAt: null }
		};
		const history = writable({ nodes: [firstAttempt], pageInfo });
		const current = fromStore(history);
		renderDeliveries({
			get deliveries() {
				return current.current;
			}
		});
		const originalRow = document.querySelector('tbody tr');
		history.set({
			nodes: [secondAttempt, firstAttempt],
			pageInfo: { ...pageInfo, totalCount: 2, pageEnd: 2 }
		});
		flushSync();
		expect(originalRow?.isConnected).toBe(true);
		expect(originalRow?.querySelector('td:last-child')?.textContent?.trim()).toBe('Failed');
		const rows = document.querySelectorAll('tbody tr');
		expect(rows[0]?.querySelector('td:last-child')?.textContent?.trim()).toBe('Completed');
		expect(rows[1]?.textContent).toContain('Attempt 2');
		expect(rows[1]?.textContent).not.toContain('Retry scheduled for');
		expect(rows[3]?.textContent).toContain('Attempt 1');
		expect(rows[3]?.textContent).toContain('Retry scheduled for');
		expect(rows[3]?.querySelector('time')?.dateTime).toBe(nextRetryAt.toISOString());
		expect(document.body.textContent).not.toContain('shared');
		expect(document.body.textContent).not.toContain('Will retry at');
	});

	it.each(['COMPLETED', 'FAILED'] as const)(
		'shows the recorded %s attempt state without inventing a retry time',
		(status) => {
			renderDeliveries({
				deliveries: {
					nodes: [{ ...delivery, deliveryState: { status, attemptCount: 1, nextRetryAt: null } }],
					pageInfo
				}
			});
			expect(document.body.textContent).toContain(status[0] + status.slice(1).toLowerCase());
			expect(document.body.textContent).toContain('Attempt 1');
			expect(document.body.textContent).not.toContain('Retry scheduled for');
			expect(document.body.textContent).not.toContain('Will retry at');
		}
	);

	it('labels recorded retry scheduling without implying it is currently pending', () => {
		const nextRetryAt = new Date('2026-11-06T15:00:00Z');
		renderDeliveries({
			deliveries: {
				nodes: [
					{
						...delivery,
						deliveryState: { status: 'FAILED', attemptCount: 2, nextRetryAt }
					}
				],
				pageInfo
			}
		});
		expect(document.body.textContent).toContain('Retry scheduled for');
		expect(document.body.textContent).not.toContain('Will retry at');
		expect(document.querySelector(`time[datetime="${nextRetryAt.toISOString()}"]`)).not.toBeNull();
	});

	it('preserves source activity IDs, triggered times, and the original envelope time in payloads', () => {
		const requestBody = JSON.stringify({
			time: '2026-11-05T08:00:00Z',
			data: { activityLogEntryId: 'activity-id', triggeredAt: '2026-11-05T08:00:01Z' }
		});
		renderDeliveries({ deliveries: { nodes: [{ ...delivery, requestBody }], pageInfo } });
		const formatted = selectDeliveryTab('Request').querySelector('pre.body')?.textContent;
		expect(formatted).toBe(JSON.stringify(JSON.parse(requestBody), null, 2));
		expect(document.body.textContent).not.toContain('source activity time');
		expect(document.querySelector('thead')?.textContent).toContain('Attempted at');
		expect(document.querySelector('time')?.dateTime).toBe(delivery.createdAt.toISOString());
	});

	it('uses the pagination callback rather than a full page reload', () => {
		const onnext = vi.fn();
		renderDeliveries({ onnext });
		document.querySelector<HTMLButtonElement>('[aria-label="Next page"]')?.click();
		expect(onnext).toHaveBeenCalledOnce();
	});
});
