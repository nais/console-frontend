import type { Fields } from '$lib/ui/Form/form';
import { isRedirect, type Redirect, type RequestEvent } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formAction, graphqlIssues, type FormFailure } from './form';

describe('graphqlIssues', () => {
	it('reads the field out of the path, after the input segment', () => {
		const [issue] = graphqlIssues([
			{
				message: 'A team slug must be at least 3 characters long.',
				path: ['createValkey', 'input', 'teamSlug']
			}
		]);

		expect(issue.path).toEqual(['teamSlug']);
		expect(issue.message).toBe('A team slug must be at least 3 characters long.');
	});

	it('prefers an explicit extensions.field over the path', () => {
		const [issue] = graphqlIssues([
			{
				message: 'Name must not be empty.',
				path: ['createValkey'],
				extensions: { field: 'name' }
			}
		]);

		expect(issue.path).toEqual(['name']);
	});

	it('keeps every error when a field has more than one', () => {
		const issues = graphqlIssues([
			{ message: 'Name must not be empty.', path: ['createValkey'], extensions: { field: 'name' } },
			{
				message: 'Name must consist of lowercase letters, numbers, and hyphens only.',
				path: ['createValkey'],
				extensions: { field: 'name' }
			},
			{
				message: 'Environment name must not be empty.',
				path: ['createValkey'],
				extensions: { field: 'environmentName' }
			}
		]);

		expect(issues).toHaveLength(3);
		expect(issues.map((issue) => issue.path)).toEqual([['name'], ['name'], ['environmentName']]);
	});

	it('leaves the path empty when the error names no field', () => {
		const [issue] = graphqlIssues([{ message: 'Something went wrong', path: ['createValkey'] }]);
		expect(issue.path).toEqual([]);
	});

	it('handles an error with no path at all', () => {
		const [issue] = graphqlIssues([{ message: 'Unauthorized' }]);
		expect(issue.path).toEqual([]);
		expect(issue.message).toBe('Unauthorized');
	});

	it('keeps indexes and nested names inside a repeated group', () => {
		const [issue] = graphqlIssues([
			{
				message: 'Name must not be empty.',
				path: ['updateApplication', 'input', 'environmentVariables', 1, 'name']
			}
		]);

		// Matches the `group.index.field` names the repeat controls submit under.
		expect(issue.path).toEqual(['environmentVariables', 1, 'name']);
		expect(issue.path.join('.')).toBe('environmentVariables.1.name');
	});

	it('renames only the leading segment so indexes survive', () => {
		const [issue] = graphqlIssues(
			[
				{
					message: 'Name must not be empty.',
					path: ['updateApplication', 'input', 'environmentVariables', 1, 'name']
				}
			],
			{ environmentVariables: 'variables' }
		);

		expect(issue.path.join('.')).toBe('variables.1.name');
	});

	it('renames a whole path, for fields folded into a nested input', () => {
		const [issue] = graphqlIssues(
			[{ message: 'Must be at least 1', path: ['updateApplication', 'input', 'replicas', 'min'] }],
			{ 'replicas.min': 'min', 'replicas.max': 'max' }
		);

		expect(issue.path).toEqual(['min']);
	});

	it('prefers a whole-path rename over renaming the leading segment', () => {
		const [issue] = graphqlIssues([{ message: 'Nope', path: ['m', 'input', 'replicas', 'max'] }], {
			replicas: 'wrong',
			'replicas.max': 'max'
		});

		expect(issue.path).toEqual(['max']);
	});

	it('splits a dotted extensions.field and numbers its indexes', () => {
		const [issue] = graphqlIssues([
			{ message: 'Required', path: ['x'], extensions: { field: 'variables.2.name' } }
		]);

		expect(issue.path).toEqual(['variables', 2, 'name']);
	});

	it('ignores a non-string extensions.field', () => {
		const [issue] = graphqlIssues([
			{ message: 'Nope', path: ['m', 'input', 'slug'], extensions: { field: 42 } }
		]);

		expect(issue.path).toEqual(['slug']);
	});

	it('uses the last input segment when the path nests another', () => {
		const [issue] = graphqlIssues([
			{ message: 'Nope', path: ['m', 'input', 'nested', 'input', 'slug'] }
		]);

		expect(issue.path).toEqual(['slug']);
	});

	it('produces issues zod would accept, so <Form> can render them like its own', () => {
		const [issue] = graphqlIssues([{ message: 'Taken', extensions: { field: 'slug' } }]);

		expect(issue.code).toBe('custom');
		expect(typeof issue.message).toBe('string');
		expect(Array.isArray(issue.path)).toBe(true);
	});
});

const testFields = [
	{ type: 'text', name: 'name', label: 'Name', validation: z.string().min(1) },
	{ type: 'text', name: 'purpose', label: 'Purpose', validation: z.string().min(1) }
] as const satisfies Fields;

const eventFor = (values: Record<string, string>, params: Record<string, string> = {}) => {
	const body = new FormData();
	for (const [key, value] of Object.entries(values)) body.append(key, value);
	return { request: new Request('http://x/f', { method: 'POST', body }), params } as RequestEvent;
};

const fakeMutation = <Data>(result: {
	data?: Data | null;
	errors?: { message: string; path?: (string | number)[]; extensions?: { field?: unknown } }[];
}) => {
	const calls: unknown[] = [];
	return {
		calls,
		mutate: async (variables: unknown) => {
			calls.push(variables);
			return { data: result.data ?? null, errors: result.errors ?? null };
		}
	};
};

const caught = async (run: () => Promise<unknown>) => {
	try {
		return { returned: await run(), thrown: undefined };
	} catch (thrown) {
		return { returned: undefined, thrown };
	}
};

describe('formAction', () => {
	it('never reaches the mutation when validation fails', async () => {
		const mutation = fakeMutation({ data: { ok: true } });
		const action = formAction({
			fields: testFields,
			mutation,
			variables: ({ data }) => data,
			message: 'Failed',
			redirectTo: () => '/done'
		});

		const result = (await action(eventFor({ name: '', purpose: 'p' }))) as {
			status: number;
			data: FormFailure;
		};

		expect(mutation.calls).toHaveLength(0);
		expect(result.status).toBe(422);
		expect(result.data.errors?.[0].path).toEqual(['name']);
		// The submission is echoed back so the page re-renders what was typed.
		expect(result.data.values).toEqual({ name: '', purpose: 'p' });
	});

	it('hands the validated data and route params to variables', async () => {
		const mutation = fakeMutation({ data: { ok: true } });
		const action = formAction({
			fields: testFields,
			mutation,
			variables: ({ data, params }) => ({ input: { ...data, teamSlug: params.team } }),
			message: 'Failed',
			onSuccess: () => ({ done: true })
		});

		await action(eventFor({ name: 'n', purpose: 'p' }, { team: 'myteam' }));

		expect(mutation.calls[0]).toEqual({ input: { name: 'n', purpose: 'p', teamSlug: 'myteam' } });
	});

	it('puts an API error on the field it names', async () => {
		const mutation = fakeMutation({
			errors: [{ message: 'Name is taken.', path: ['create'], extensions: { field: 'name' } }]
		});
		const action = formAction({
			fields: testFields,
			mutation,
			variables: ({ data }) => data,
			message: 'Failed to create',
			redirectTo: () => '/done'
		});

		const result = (await action(eventFor({ name: 'taken', purpose: 'p' }))) as {
			status: number;
			data: FormFailure;
		};

		expect(result.status).toBe(422);
		expect(result.data.errors).toEqual([
			expect.objectContaining({ path: ['name'], message: 'Name is taken.' })
		]);
		expect(result.data.values).toEqual({ name: 'taken', purpose: 'p' });
	});

	it('still reports a failure when the API names a field the form has no control for', async () => {
		const mutation = fakeMutation({
			errors: [{ message: 'Slug is reserved.', path: ['create', 'input', 'teamSlug'] }]
		});
		const action = formAction({
			fields: testFields,
			mutation,
			variables: ({ data }) => data,
			message: 'Failed to create',
			redirectTo: () => '/done'
		});

		const result = (await action(eventFor({ name: 'n', purpose: 'p' }))) as {
			status: number;
			data: FormFailure;
		};

		// <Form> shows this as a form-level message, and the fallback keeps it from going silent.
		expect(result.data.errors?.[0].path).toEqual(['teamSlug']);
		expect(result.data.error).toBe('Failed to create');
	});

	it('fails with the message when the mutation returns no data', async () => {
		const mutation = fakeMutation({ data: null });
		const action = formAction({
			fields: testFields,
			mutation,
			variables: ({ data }) => data,
			message: 'Failed to create',
			redirectTo: () => '/done'
		});

		const result = (await action(eventFor({ name: 'n', purpose: 'p' }))) as {
			status: number;
			data: FormFailure;
		};

		expect(result.status).toBe(500);
		expect(result.data.error).toBe('Failed to create');
	});

	it('fails when the payload reports failure in a flag', async () => {
		const mutation = fakeMutation({ data: { deleteValkey: { valkeyDeleted: false } } });
		const action = formAction({
			fields: testFields,
			mutation,
			variables: ({ data }) => data,
			message: 'Failed to delete Valkey',
			succeeded: (result) => result.deleteValkey.valkeyDeleted,
			redirectTo: () => '/done'
		});

		const result = (await action(eventFor({ name: 'n', purpose: 'p' }))) as {
			status: number;
			data: FormFailure;
		};

		expect(result.status).toBe(500);
		expect(result.data.error).toBe('Failed to delete Valkey');
	});

	it('redirects on success, using the mutation payload', async () => {
		const mutation = fakeMutation({ data: { createTeam: { team: { slug: 'my-team' } } } });
		const action = formAction({
			fields: testFields,
			mutation,
			variables: ({ data }) => data,
			message: 'Failed',
			redirectTo: ({ result }) => `/team/${result.createTeam.team.slug}`
		});

		const { thrown } = await caught(() => action(eventFor({ name: 'n', purpose: 'p' })));

		expect(isRedirect(thrown)).toBe(true);
		expect((thrown as Redirect).status).toBe(303);
		expect((thrown as Redirect).location).toBe('/team/my-team');
	});

	it('returns data instead of redirecting when there is no redirectTo', async () => {
		const mutation = fakeMutation({ data: { createToken: { secret: 's3cret' } } });
		const action = formAction({
			fields: testFields,
			mutation,
			variables: ({ data }) => data,
			message: 'Failed',
			onSuccess: ({ result }) => ({ secret: result.createToken.secret })
		});

		expect(await action(eventFor({ name: 'n', purpose: 'p' }))).toEqual({ secret: 's3cret' });
	});

	it('builds the fields from the request when they depend on it', async () => {
		const mutation = fakeMutation({ data: { ok: true } });
		const action = formAction({
			fields: (event) =>
				[
					{
						type: 'text',
						name: 'confirm',
						label: 'Confirm',
						validation: z.literal(`${event.params.env}/${event.params.app}`)
					}
				] as const satisfies Fields,
			mutation,
			variables: ({ data }) => data,
			message: 'Failed',
			onSuccess: () => ({ ok: true })
		});

		const params = { env: 'dev', app: 'my-app' };
		const wrong = (await action(eventFor({ confirm: 'dev/other' }, params))) as { status: number };
		expect(wrong.status).toBe(422);

		expect(await action(eventFor({ confirm: 'dev/my-app' }, params))).toEqual({ ok: true });
	});
});
