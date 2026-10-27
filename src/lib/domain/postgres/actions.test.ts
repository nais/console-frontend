import { vi } from 'vitest';

const { access, create, update, remove, environmentCheck, currentResources } = vi.hoisted(() => ({
	access: { fetch: vi.fn() },
	create: { mutate: vi.fn() },
	update: { mutate: vi.fn() },
	remove: { mutate: vi.fn() },
	environmentCheck: { fetch: vi.fn() },
	currentResources: { fetch: vi.fn() }
}));

vi.mock('$houdini', () => ({
	graphql: (query: string) => {
		if (query.includes('query PostgresManagementAccess')) return access;
		if (query.includes('query PostgresCreationEnvironments')) return environmentCheck;
		if (query.includes('query PostgresUpdateResources')) return currentResources;
		if (query.includes('mutation CreatePostgres')) return create;
		if (query.includes('mutation UpdatePostgres')) return update;
		if (query.includes('mutation DeletePostgres')) return remove;
		throw new Error(`Unexpected document: ${query}`);
	}
}));

import { actions as createActions } from '../../../routes/team/[team]/postgres/create/+page.server';
import { actions as updateActions } from '../../../routes/team/[team]/[env]/postgres/[postgres]/edit/+page.server';
import { actions as deleteActions } from '../../../routes/team/[team]/[env]/postgres/[postgres]/delete/+page.server';

function request(fields: Record<string, string | string[]>) {
	const body = new FormData();
	for (const [name, values] of Object.entries(fields)) {
		for (const value of Array.isArray(values) ? values : [values]) body.append(name, value);
	}
	return new Request('https://console.example.com/team/test/postgres', { method: 'POST', body });
}

function createEvent(fields: Record<string, string | string[]>) {
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
	currentResources.fetch.mockResolvedValue({
		data: { team: { environment: { postgres: { resources: { diskSize: '10Gi' } } } } }
	});
	access.fetch.mockResolvedValue({
		data: { me: { __typename: 'User', isAdmin: false }, team: { viewerIsMember: true } }
	});
	environmentCheck.fetch.mockResolvedValue({
		data: {
			team: {
				environments: [{ environment: { name: 'dev' }, gcpProjectID: 'project-id' }]
			}
		}
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
					labels: [],
					cpu: undefined,
					memory: undefined,
					diskSize: undefined,
					highAvailability: false
				}
			},
			expect.any(Object)
		);
	});

	test('creates with labels and trims keys and values', async () => {
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
				createEvent({
					name: 'database',
					environment: 'dev',
					majorVersion: '18',
					label_key: [' owner ', 'cost-center'],
					label_value: [' team ', '']
				})
			)
		).rejects.toMatchObject({ status: 303 });
		expect(create.mutate).toHaveBeenCalledWith(
			{
				input: expect.objectContaining({
					labels: [
						{ key: 'owner', value: 'team' },
						{ key: 'cost-center', value: '' }
					]
				})
			},
			expect.any(Object)
		);
	});

	test.each([
		{ label_key: ['duplicate', 'duplicate'], label_value: ['a', 'b'] },
		{ label_key: ['bad key'], label_value: ['value'] },
		{ label_key: ['key'], label_value: ['bad value'] }
	])('rejects invalid labels before creation: %s', async (labels) => {
		const result = await createActions.default(
			createEvent({
				name: 'database',
				environment: 'dev',
				majorVersion: '18',
				...labels
			})
		);
		expect(result).toMatchObject({
			status: 400,
			data: { labelRows: expect.any(Array), error: 'Check the label fields below.' }
		});
		expect(create.mutate).not.toHaveBeenCalled();
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

	test('rejects Postgres creation in on-premises environments', async () => {
		environmentCheck.fetch.mockResolvedValue({
			data: {
				team: {
					environments: [{ environment: { name: 'dev-fss' }, gcpProjectID: null }]
				}
			}
		});
		expect(
			await createActions.default(
				createEvent({ name: 'database', environment: 'dev-fss', majorVersion: '18' })
			)
		).toMatchObject({
			status: 400,
			data: { error: 'Postgres is only available in GCP environments.' }
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
					memory: '1024Mi',
					diskSize: '20Gi',
					highAvailability: false
				}
			},
			expect.any(Object)
		);
	});

	test.each(['0.6', '0,6'])(
		'sends whole MiB when creating and updating with %s GiB',
		async (memory) => {
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
			update.mutate.mockResolvedValue({ data: { updatePostgres: { postgres: { id: 'pg' } } } });
			await expect(
				createActions.default(
					createEvent({ name: 'database', environment: 'dev', majorVersion: '18', memory })
				)
			).rejects.toMatchObject({ status: 303 });
			await expect(updateActions.default(updateEvent({ memory }))).rejects.toMatchObject({
				status: 303
			});
			for (const mutation of [create, update]) {
				expect(mutation.mutate).toHaveBeenCalledWith(
					{ input: expect.objectContaining({ memory: '615Mi' }) },
					expect.any(Object)
				);
			}
		}
	);

	test('omits unchanged fractional storage while updating CPU and high availability', async () => {
		currentResources.fetch.mockResolvedValue({
			data: { team: { environment: { postgres: { resources: { diskSize: '20G' } } } } }
		});
		update.mutate.mockResolvedValue({ data: { updatePostgres: { postgres: { id: 'pg' } } } });
		await expect(
			updateActions.default(
				updateEvent({ cpu: '0.25', diskSize: '18.6264514923095703125', highAvailability: 'on' })
			)
		).rejects.toMatchObject({ status: 303 });
		expect(update.mutate).toHaveBeenCalledWith(
			{
				input: expect.objectContaining({ cpu: '0.25', diskSize: undefined, highAvailability: true })
			},
			expect.any(Object)
		);
	});

	test('does not update when current storage cannot be verified', async () => {
		currentResources.fetch.mockResolvedValue({ errors: [{ message: 'Storage lookup failed.' }] });
		expect(await updateActions.default(updateEvent({ cpu: '0.25' }))).toMatchObject({
			status: 500,
			data: { cpu: '0.25', error: 'Storage lookup failed.' }
		});
		expect(update.mutate).not.toHaveBeenCalled();
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
