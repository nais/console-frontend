import { zodSchema } from '$lib/ui/Form/form';
import { describe, expect, it } from 'vitest';
import { deleteConfirmationForm } from './delete-confirmation';
import { createTeamForm } from './team';
import { uniqueVariableNames, workloadEnvForm } from './workload-env';
import { maxAtLeastMin, resizeApplicationForm, setImageVersionForm } from './workload';

const errorsFor = (
	result: { success: boolean; error?: { issues: readonly { path: PropertyKey[] }[] } },
	path: string
) =>
	(result.error?.issues ?? []).filter((issue) => issue.path.join('.') === path).map(() => true)
		.length;

describe('createTeamForm', () => {
	const schema = zodSchema(createTeamForm);

	const valid = {
		slug: 'my-team',
		purpose: 'Making sure users have a good experience',
		slackChannel: '#my-team-slack'
	};

	it('accepts a well-formed team', () => {
		expect(schema.safeParse(valid).success).toBe(true);
	});

	it.each([
		['too short', 'ab'],
		['leading hyphen', '-team'],
		['trailing hyphen', 'myteam-'],
		['consecutive hyphens', 'my--team'],
		['uppercase', 'MyTeam'],
		['starts with a digit', '1team'],
		['reserved', 'default'],
		['nais prefix', 'naisteam'],
		['team prefix', 'teamrocket']
	])('rejects slug: %s', (_label, slug) => {
		const result = schema.safeParse({ ...valid, slug });
		expect(result.success).toBe(false);
		expect(errorsFor(result, 'slug')).toBeGreaterThan(0);
	});

	it('rejects a slack channel without a leading #', () => {
		const result = schema.safeParse({ ...valid, slackChannel: 'my-team-slack' });
		expect(result.success).toBe(false);
		expect(errorsFor(result, 'slackChannel')).toBeGreaterThan(0);
	});

	it('rejects a slack channel longer than 80 characters after the #', () => {
		const result = schema.safeParse({ ...valid, slackChannel: '#' + 'a'.repeat(81) });
		expect(result.success).toBe(false);
	});

	it('rejects a purpose shorter than 3 characters', () => {
		const result = schema.safeParse({ ...valid, purpose: 'hi' });
		expect(result.success).toBe(false);
		expect(errorsFor(result, 'purpose')).toBeGreaterThan(0);
	});

	it('trims surrounding whitespace', () => {
		const result = schema.safeParse({ ...valid, slug: '  my-team  ' });
		expect(result.success).toBe(true);
		expect(result.data?.slug).toBe('my-team');
	});
});

describe('resizeApplicationForm', () => {
	const schema = zodSchema(resizeApplicationForm, maxAtLeastMin);

	it('accepts max above min', () => {
		expect(schema.safeParse({ min: '1', max: '4' }).success).toBe(true);
	});

	it('accepts max equal to min', () => {
		expect(schema.safeParse({ min: '2', max: '2' }).success).toBe(true);
	});

	it('reports max below min on the max field', () => {
		const result = schema.safeParse({ min: '5', max: '2' });
		expect(result.success).toBe(false);
		expect(errorsFor(result, 'max')).toBe(1);
	});

	it('rejects non-integer replica counts', () => {
		expect(schema.safeParse({ min: '1.5', max: '4' }).success).toBe(false);
	});

	it('coerces numeric strings from the form submission', () => {
		const result = schema.safeParse({ min: '0', max: '10' });
		expect(result.data).toEqual({ min: 0, max: 10 });
	});
});

describe('setImageVersionForm', () => {
	const schema = zodSchema(setImageVersionForm, undefined, undefined, {
		image: [
			{ value: 'ghcr.io/nais/app:1', label: '1' },
			{ value: 'ghcr.io/nais/app:2', label: '2' }
		]
	});

	it('accepts anything when the options are unknown', () => {
		const unchecked = zodSchema(setImageVersionForm);
		expect(unchecked.safeParse({ image: 'ghcr.io/evil/app:1' }).success).toBe(true);
	});

	it('accepts an offered image', () => {
		expect(schema.safeParse({ image: 'ghcr.io/nais/app:2' }).success).toBe(true);
	});

	it('rejects an image that was not offered', () => {
		expect(schema.safeParse({ image: 'ghcr.io/evil/app:1' }).success).toBe(false);
	});

	it('rejects an empty selection', () => {
		expect(schema.safeParse({ image: '' }).success).toBe(false);
	});
});

describe('workloadEnvForm', () => {
	const schema = zodSchema(workloadEnvForm, uniqueVariableNames);

	it('accepts distinct variable names', () => {
		const result = schema.safeParse({
			variables: [
				{ name: 'FOO', value: '1' },
				{ name: 'BAR', value: '2' }
			]
		});
		expect(result.success).toBe(true);
	});

	it('accepts an empty value', () => {
		expect(schema.safeParse({ variables: [{ name: 'FOO', value: '' }] }).success).toBe(true);
	});

	it('accepts no variables at all', () => {
		expect(schema.safeParse({ variables: [] }).success).toBe(true);
	});

	it('rejects a blank name', () => {
		const result = schema.safeParse({ variables: [{ name: '  ', value: '1' }] });
		expect(result.success).toBe(false);
		expect(errorsFor(result, 'variables.0.name')).toBeGreaterThan(0);
	});

	it('flags the second occurrence of a duplicated name', () => {
		const result = schema.safeParse({
			variables: [
				{ name: 'FOO', value: '1' },
				{ name: 'BAR', value: '2' },
				{ name: 'FOO', value: '3' }
			]
		});
		expect(result.success).toBe(false);
		expect(errorsFor(result, 'variables.2.name')).toBe(1);
		expect(errorsFor(result, 'variables.0.name')).toBe(0);
	});

	it('treats names differing only by whitespace as duplicates', () => {
		const result = schema.safeParse({
			variables: [
				{ name: 'FOO', value: '1' },
				{ name: ' FOO ', value: '2' }
			]
		});
		expect(result.success).toBe(false);
		expect(errorsFor(result, 'variables.1.name')).toBe(1);
	});
});

describe('deleteConfirmationForm', () => {
	const schema = zodSchema(deleteConfirmationForm('dev/my-app'));

	it('accepts the exact name', () => {
		expect(schema.safeParse({ name: 'dev/my-app' }).success).toBe(true);
	});

	it('accepts the exact name with surrounding whitespace', () => {
		expect(schema.safeParse({ name: ' dev/my-app ' }).success).toBe(true);
	});

	it('rejects a different name', () => {
		expect(schema.safeParse({ name: 'dev/other-app' }).success).toBe(false);
	});

	it('rejects the name without its environment prefix', () => {
		expect(schema.safeParse({ name: 'my-app' }).success).toBe(false);
	});

	it('rejects an empty confirmation', () => {
		expect(schema.safeParse({ name: '' }).success).toBe(false);
	});
});
