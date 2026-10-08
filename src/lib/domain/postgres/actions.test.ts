import { vi } from 'vitest';

const { access, create, update, remove } = vi.hoisted(() => ({
	access: { fetch: vi.fn() },
	create: { mutate: vi.fn() },
	update: { mutate: vi.fn() },
	remove: { mutate: vi.fn() }
}));

vi.mock('$houdini', () => ({
	graphql: (query: string) => {
		if (query.includes('query PostgresManagementAccess')) return access;
		if (query.includes('mutation CreatePostgres')) return create;
		if (query.includes('mutation UpdatePostgres')) return update;
		if (query.includes('mutation DeletePostgres')) return remove;
		throw new Error(`Unexpected document: ${query}`);
	}
}));

import { actions as createActions } from '../../../routes/team/[team]/postgres/create/+page.server';
import { actions as updateActions } from '../../../routes/team/[team]/[env]/postgres/[postgres]/edit/+page.server';
import { actions as deleteActions } from '../../../routes/team/[team]/[env]/postgres/[postgres]/delete/+page.server';

function request(fields: Record<string, string>) {
	const body = new FormData();
	for (const [name, value] of Object.entries(fields)) body.set(name, value);
	return new Request('https://console.example.com/team/test/postgres', { method: 'POST', body });
}

function createEvent(fields: Record<string, string>) {
	return {
		params: { team: 'test' },
		request: request(fields)
	} as Parameters<typeof createActions.default>[0];
}

function updateEvent(fields: Record<string, string>) {
	return {
		params: { team: 'test', env: 'dev', postgres: 'database' },
		request: request(fields)
	} as Parameters<typeof updateActions.default>[0];
}

function deleteEvent(fields: Record<string, string>) {
	return {
		params: { team: 'test', env: 'dev', postgres: 'database' },
		request: request(fields)
	} as Parameters<typeof deleteActions.default>[0];
}

beforeEach(() => {
	vi.resetAllMocks();
	access.fetch.mockResolvedValue({
		data: { me: { __typename: 'User', isAdmin: false }, team: { viewerIsMember: true } }
	});
});

describe('Postgres management actions', () => {
	test('creates with platform defaults and redirects to the returned database', async () => {
		create.mutate.mockResolvedValue({
			data: {
				createPostgres: {
					postgres: {
						id: 'pg',
						name: 'database',
						teamEnvironment: { environment: { name: 'dev' } }
					}
				}
			}
		});
		await expect(
			createActions.default(
				createEvent({ name: 'database', environment: 'dev', majorVersion: '18' })
			)
		).rejects.toMatchObject({ status: 303, location: '/team/test/dev/postgres/database' });
		expect(create.mutate).toHaveBeenCalledWith(
			{
				input: {
					name: 'database',
					teamSlug: 'test',
					environmentName: 'dev',
					majorVersion: '18',
					cpu: undefined,
					memory: undefined,
					diskSize: undefined,
					highAvailability: false
				}
			},
			expect.any(Object)
		);
	});

	test('returns creation errors and retains submitted fields', async () => {
		create.mutate.mockResolvedValue({ errors: [{ message: 'Invalid quantity.' }] });
		const result = await createActions.default(
			createEvent({ name: 'database', environment: 'dev', majorVersion: '18', cpu: '0,1' })
		);
		expect(result).toMatchObject({
			status: 400,
			data: { name: 'database', cpu: '0,1', error: 'Invalid quantity.' }
		});
	});

	test('rejects missing required creation fields before mutation', async () => {
		expect(await createActions.default(createEvent({ name: 'database' }))).toMatchObject({
			status: 400
		});
		expect(create.mutate).not.toHaveBeenCalled();
	});

	test('updates quantities and permits disabling high availability', async () => {
		update.mutate.mockResolvedValue({ data: { updatePostgres: { postgres: { id: 'pg' } } } });
		await expect(
			updateActions.default(updateEvent({ cpu: '0,25', memory: '1', diskSize: '20' }))
		).rejects.toMatchObject({ status: 303, location: '/team/test/dev/postgres/database' });
		expect(update.mutate).toHaveBeenCalledWith(
			{
				input: {
					name: 'database',
					teamSlug: 'test',
					environmentName: 'dev',
					cpu: '0.25',
					memory: '1Gi',
					diskSize: '20Gi',
					highAvailability: false
				}
			},
			expect.any(Object)
		);
	});

	test.each([
		['cpu', '100m'],
		['memory', '-0.5'],
		['diskSize', '9'],
		['diskSize', '10.5'],
		['cpu', '8.1'],
		['memory', '32.1'],
		['diskSize', '1001']
	])('blocks invalid resources before create and update: %s=%s', async (name, value) => {
		const fields = { [name]: value };
		expect(
			await createActions.default(
				createEvent({ name: 'database', environment: 'dev', majorVersion: '18', ...fields })
			)
		).toMatchObject({ status: 400, data: { errors: { [name]: expect.any(String) } } });
		expect(await updateActions.default(updateEvent(fields))).toMatchObject({
			status: 400,
			data: { errors: { [name]: expect.any(String) } }
		});
		expect(create.mutate).not.toHaveBeenCalled();
		expect(update.mutate).not.toHaveBeenCalled();
	});

	test('requires the full environment/name before deletion', async () => {
		const result = await deleteActions.default(deleteEvent({ name: 'database' }));
		expect(result).toMatchObject({ status: 400 });
		expect(remove.mutate).not.toHaveBeenCalled();
	});

	test.each([false, undefined])('does not claim deletion when API returns %s', async (accepted) => {
		remove.mutate.mockResolvedValue(
			accepted === undefined ? {} : { data: { deletePostgres: { deletionRequested: accepted } } }
		);
		expect(await deleteActions.default(deleteEvent({ name: 'dev/database' }))).toMatchObject({
			status: 500,
			data: { error: 'Deletion was not accepted. Please try again.' }
		});
	});

	test('redirects with an asynchronous deletion notice only after acceptance', async () => {
		remove.mutate.mockResolvedValue({ data: { deletePostgres: { deletionRequested: true } } });
		await expect(
			deleteActions.default(deleteEvent({ name: 'dev/database' }))
		).rejects.toMatchObject({
			status: 303,
			location: '/team/test/postgres?deletionRequested=database'
		});
	});

	test('blocks all management actions for a non-member', async () => {
		access.fetch.mockResolvedValue({
			data: { me: { __typename: 'User', isAdmin: false }, team: { viewerIsMember: false } }
		});
		await expect(createActions.default(createEvent({}))).rejects.toMatchObject({ status: 403 });
		await expect(updateActions.default(updateEvent({}))).rejects.toMatchObject({ status: 403 });
		await expect(
			deleteActions.default(deleteEvent({ name: 'dev/database' }))
		).rejects.toMatchObject({
			status: 403
		});
		expect(create.mutate).not.toHaveBeenCalled();
		expect(update.mutate).not.toHaveBeenCalled();
		expect(remove.mutate).not.toHaveBeenCalled();
	});

	test('allows an administrator who is not a member', async () => {
		access.fetch.mockResolvedValue({
			data: { me: { __typename: 'User', isAdmin: true }, team: { viewerIsMember: false } }
		});
		remove.mutate.mockResolvedValue({ data: { deletePostgres: { deletionRequested: true } } });
		await expect(
			deleteActions.default(deleteEvent({ name: 'dev/database' }))
		).rejects.toMatchObject({ status: 303 });
		expect(remove.mutate).toHaveBeenCalledOnce();
	});

	test('fails closed if the permission query fails', async () => {
		access.fetch.mockResolvedValue({ errors: [{ message: 'Permission lookup failed.' }] });
		await expect(updateActions.default(updateEvent({}))).rejects.toMatchObject({ status: 500 });
		expect(update.mutate).not.toHaveBeenCalled();
	});
});
