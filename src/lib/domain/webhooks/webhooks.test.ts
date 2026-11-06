import { describe, expect, it } from 'vitest';
import { formatWebhookEventName, readWebhookForm } from './webhooks.js';

describe('webhook event names', () => {
	it.each([
		['APPLICATION_DELETED', 'Application deleted'],
		['TEAM_MEMBER_ADDED', 'Team member added'],
		['POSTGRES_BRANCH_ACTIVATED', 'Postgres branch activated']
	])('formats %s as %s', (type, name) => {
		expect(formatWebhookEventName(type)).toBe(name);
	});
});

function form(overrides: Record<string, string> = {}) {
	const data = new FormData();
	for (const [name, value] of Object.entries({
		name: 'Deployment notifications',
		url: 'https://receiver.example.com/events',
		secret: 'test-signing-key',
		eventScope: 'all',
		...overrides
	})) {
		data.set(name, value);
	}
	return data;
}

describe('webhook form validation', () => {
	it.each([true, false])('requires a non-blank name (creating: %s)', (creating) => {
		for (const name of ['', ' \t\n ']) {
			expect(readWebhookForm(form({ name }), creating, 'my-team').errors).toContain(
				'A webhook name is required.'
			);
		}
		const omitted = form();
		omitted.delete('name');
		expect(readWebhookForm(omitted, creating, 'my-team').errors).toContain(
			'A webhook name is required.'
		);
	});

	it('trims names without changing their text', () => {
		const result = readWebhookForm(form({ name: '  \u00c5pen tjeneste  ' }), true, 'my-team');
		expect(result.errors).toEqual([]);
		expect(result.fields.name).toBe('\u00c5pen tjeneste');
	});

	it('rejects uploaded files as names', () => {
		const data = form();
		data.set('name', new Blob(['not a name']));
		expect(readWebhookForm(data, true, 'my-team').errors).toContain('A webhook name is required.');
	});

	it('uses the wildcard for all events and ignores individual selections', () => {
		const data = form();
		data.append('eventTypes', 'TEAM_UPDATED');
		expect(readWebhookForm(data, true, 'my-team').fields.eventTypes).toEqual(['*']);
	});

	it('deduplicates explicitly selected event types', () => {
		const data = form({ eventScope: 'selected' });
		data.append('eventTypes', 'TEAM_UPDATED');
		data.append('eventTypes', 'TEAM_UPDATED');
		expect(readWebhookForm(data, true, 'my-team')).toMatchObject({
			errors: [],
			fields: { eventScope: 'selected', eventTypes: ['TEAM_UPDATED'] }
		});
	});

	it.each(['', 'receiver.example.com', 'javascript:alert(1)', 'file:///tmp/receiver'])(
		'rejects invalid webhook URL %s',
		(url) => {
			expect(readWebhookForm(form({ url }), true, 'my-team').errors).toContain(
				'Enter a valid HTTP or HTTPS webhook URL.'
			);
		}
	);

	it('trims URLs but preserves signing secrets exactly', () => {
		const result = readWebhookForm(
			form({ url: '  http://localhost:3000/events  ', secret: '  test-signing-key  ' }),
			true,
			'my-team'
		);
		expect(result.errors).toEqual([]);
		expect(result.fields.url).toBe('http://localhost:3000/events');
		expect(result.secret).toBe('  test-signing-key  ');
		expect(result.fields).not.toHaveProperty('secret');
	});

	it('requires a secret on creation but permits leaving it unchanged on edit', () => {
		const omitted = form();
		omitted.delete('secret');
		for (const data of [form({ secret: '' }), omitted]) {
			expect(readWebhookForm(data, true, 'my-team').errors).toContain(
				'A signing secret is required.'
			);
			const result = readWebhookForm(data, false, 'my-team');
			expect(result.errors).toEqual([]);
			expect(result.secret).toBe('');
			expect(result.fields).not.toHaveProperty('secret');
		}
	});

	it.each([true, false])('enforces the 8-character minimum (creating: %s)', (creating) => {
		for (const secret of ['x', '1234567', '  abc  ']) {
			const result = readWebhookForm(form({ secret }), creating, 'my-team');
			expect(result.errors).toContain('The signing secret must be at least 8 characters.');
			expect(result.fields).not.toHaveProperty('secret');
		}
		for (const secret of ['12345678', '  abcd  ', 'longer-test-signing-key']) {
			const result = readWebhookForm(form({ secret }), creating, 'my-team');
			expect(result.errors).toEqual([]);
			expect(result.secret).toBe(secret);
			expect(result.fields).not.toHaveProperty('secret');
		}
	});

	it('omits source selection when not supplied, allowing API defaults or preservation', () => {
		for (const creating of [true, false]) {
			const result = readWebhookForm(form(), creating, 'my-team');
			expect(result.errors).toEqual([]);
			expect(result.fields.sourceTeamSlugs).toBeUndefined();
		}
	});

	it.each([true, false])(
		'uses the owner for This team and ignores posted source teams (creating: %s)',
		(creating) => {
			const data = form({ sourceScope: 'team', teamSlug: 'other-team' });
			data.append('sourceTeamSlugs', 'different-team');
			const result = readWebhookForm(data, creating, 'my-team');
			expect(result.errors).toEqual([]);
			expect(result.fields.sourceScope).toBe('team');
			expect(result.fields.sourceTeamSlugs).toEqual(['my-team']);
		}
	);

	it('represents all teams with an empty list rather than an allTeams field', () => {
		const data = form({ sourceScope: 'all' });
		data.append('sourceTeamSlugs', 'previous-team');
		const result = readWebhookForm(data, true, 'my-team');
		expect(result.errors).toEqual([]);
		expect(result.fields.sourceTeamSlugs).toEqual([]);
		expect(result.fields).not.toHaveProperty('allTeams');
	});

	it('preserves selected source teams, trims whitespace and removes duplicates', () => {
		const data = form({ sourceScope: 'selected' });
		data.append('sourceTeamSlugs', ' other-team ');
		data.append('sourceTeamSlugs', 'third-team');
		data.append('sourceTeamSlugs', 'other-team');
		const result = readWebhookForm(data, true, 'my-team');
		expect(result.errors).toEqual([]);
		expect(result.fields.sourceTeamSlugs).toEqual(['other-team', 'third-team']);
	});

	it.each(['', '   '])(
		'rejects empty selected source teams instead of subscribing to all (%s)',
		(slug) => {
			const data = form({ sourceScope: 'selected' });
			if (slug) data.append('sourceTeamSlugs', slug);
			const result = readWebhookForm(data, true, 'my-team');
			expect(result.errors).toContain('Select at least one source team.');
			expect(result.fields.sourceScope).toBe('selected');
		}
	);

	it('rejects uploaded files as source-team selections', () => {
		const data = form({ sourceScope: 'selected' });
		data.append('sourceTeamSlugs', new Blob(['other-team']));
		expect(readWebhookForm(data, true, 'my-team').errors).toContain(
			'Select at least one source team.'
		);
	});

	it('rejects invalid source scope and sources supplied without a scope', () => {
		expect(readWebhookForm(form({ sourceScope: 'invalid' }), true, 'my-team').errors).toContain(
			'Choose whether to receive events from this team, all teams, or selected teams.'
		);
		const data = form();
		data.append('sourceTeamSlugs', 'other-team');
		expect(readWebhookForm(data, true, 'my-team').errors).toContain(
			'Choose whether to receive events from this team, all teams, or selected teams.'
		);
	});

	it.each(['', 'invalid'])('rejects invalid event scope %s', (eventScope) => {
		expect(readWebhookForm(form({ eventScope }), true, 'my-team').errors).not.toHaveLength(0);
	});

	it('requires at least one explicit event when selected scope is used', () => {
		expect(readWebhookForm(form({ eventScope: 'selected' }), true, 'my-team').errors).toContain(
			'Select at least one event type from the list.'
		);
	});

	it('does not accept a wildcard as an explicitly selected event', () => {
		const data = form({ eventScope: 'selected' });
		data.append('eventTypes', '*');
		expect(readWebhookForm(data, true, 'my-team').errors).not.toHaveLength(0);
	});

	it('rejects file entries instead of treating them as form text', () => {
		const data = form({ eventScope: 'selected' });
		data.set('secret', new Blob(['not a secret']));
		data.append('eventTypes', new Blob(['TEAM_UPDATED']));
		expect(readWebhookForm(data, true, 'my-team').errors).toHaveLength(2);
	});

	it('preserves disabled status from an unchecked edit switch', () => {
		expect(readWebhookForm(form(), false, 'my-team').fields.enabled).toBe(false);
		expect(readWebhookForm(form({ enabled: 'true' }), false, 'my-team').fields.enabled).toBe(true);
	});
});
