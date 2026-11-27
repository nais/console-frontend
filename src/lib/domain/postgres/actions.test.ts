import { vi } from 'vitest';

const {
	access,
	create,
	update,
	remove,
	environmentCheck,
	currentResources,
	availableValues,
	recoverySource,
	recoveryBackup
} = vi.hoisted(() => ({
	access: { fetch: vi.fn() },
	create: { mutate: vi.fn() },
	update: { mutate: vi.fn() },
	remove: { mutate: vi.fn() },
	environmentCheck: { fetch: vi.fn() },
	currentResources: { fetch: vi.fn() },
	availableValues: { fetch: vi.fn() },
	recoverySource: { fetch: vi.fn() },
	recoveryBackup: { fetch: vi.fn() }
}));

vi.mock('$houdini', () => ({
	PostgresRecoverySourceStore: class {
		fetch = recoverySource.fetch;
	},
	PostgresRecoveryBackupStore: class {
		fetch = recoveryBackup.fetch;
	},
	PostgresAvailableValuesStore: class {
		fetch = availableValues.fetch;
	},
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

function updateEvent(fields: Record<string, string | string[]>) {
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
		data: {
			team: {
				environment: {
					environment: {
						availableValues: { postgresExtensions: { values: ['pgcrypto', 'vector'] } }
					},
					postgres: {
						extensions: ['pgcrypto'],
						backupRetentionDays: 7,
						resources: { diskSize: '10Gi' }
					}
				}
			}
		}
	});
	availableValues.fetch.mockResolvedValue({
		data: {
			team: {
				environment: {
					environment: {
						availableValues: {
							postgresMajorVersions: { values: ['17', '18'], defaultValues: ['18'] },
							postgresExtensions: { values: ['pgcrypto', 'vector'], defaultValues: ['pgcrypto'] }
						}
					}
				}
			}
		}
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
	test.each(['empty', 'throw'])(
		'does not encourage blind retries when the mutation outcome is %s',
		async (outcome) => {
			if (outcome === 'throw') create.mutate.mockRejectedValue(new Error('Connection lost'));
			else create.mutate.mockResolvedValue({ data: null });
			const result = await createActions.default(
				createEvent({ name: 'database', environment: 'dev', majorVersion: '18' })
			);
			expect(result).toMatchObject({ status: 502, data: { outcomeUnknown: true } });
			expect(result?.data.error).toContain('Check whether the database exists before retrying');
			expect(create.mutate).toHaveBeenCalledTimes(1);
		}
	);
	test('clones with the absolute instant, source version and safe inherited configuration', async () => {
		recoverySource.fetch.mockResolvedValue({
			data: {
				team: {
					environment: {
						postgres: {
							name: 'original',
							majorVersion: '17',
							earliestRestoreTime: new Date('2020-01-01T00:00:00Z')
						}
					}
				}
			}
		});
		create.mutate.mockResolvedValue({
			data: {
				createPostgres: {
					postgres: {
						id: 'restored',
						name: 'restored',
						teamEnvironment: { environment: { name: 'dev' } }
					}
				}
			}
		});
		await expect(
			createActions.default(
				createEvent({
					mode: 'recovery',
					name: 'restored',
					environment: 'dev',
					sourcePostgres: 'original',
					targetTime: '2021-01-01T13:00',
					targetInstant: '2021-01-01T12:00:00.000Z',
					majorVersion: '18',
					extensionsPresent: 'true'
				})
			)
		).rejects.toMatchObject({ status: 303 });
		const input = create.mutate.mock.calls[0][0].input;
		expect(input).toMatchObject({
			majorVersion: '17',
			recovery: { sourcePostgres: 'original', targetTime: new Date('2021-01-01T12:00:00Z') }
		});
		for (const field of ['cpu', 'memory', 'diskSize', 'highAvailability'])
			expect(input[field]).toBeUndefined();
		expect(input.extensions).toBeUndefined();
	});
	test.each([
		{ name: 'original', targetTime: '2021-01-01T12:00', targetInstant: '2021-01-01T12:00:00.000Z' },
		{ name: 'restored', targetTime: '2019-01-01T12:00', targetInstant: '2019-01-01T12:00:00.000Z' },
		{ name: 'restored', targetTime: '2021-02-30T12:00', targetInstant: '2021-02-30T12:00:00.000Z' },
		{ name: 'restored', targetTime: '9999-01-01T12:00', targetInstant: '9999-01-01T12:00:00.000Z' },
		{ name: 'restored', targetTime: '2021-01-01T12:00', targetInstant: '' }
	])('rejects unsafe recovery input %s without creating a database', async (fields) => {
		recoverySource.fetch.mockResolvedValue({
			data: {
				team: {
					environment: {
						postgres: {
							name: 'original',
							majorVersion: '17',
							earliestRestoreTime: new Date('2020-01-01T00:00:00Z')
						}
					}
				}
			}
		});
		const result = await createActions.default(
			createEvent({ mode: 'recovery', environment: 'dev', sourcePostgres: 'original', ...fields })
		);
		expect(result).toMatchObject({ status: 400 });
		expect(create.mutate).not.toHaveBeenCalled();
	});
	test('uses now minus ten minutes, truncated to whole seconds, when the time is empty', async () => {
		vi.useFakeTimers({ now: new Date('2026-01-01T13:00:30.750Z') });
		try {
			recoverySource.fetch.mockResolvedValue({
				data: {
					team: {
						environment: {
							postgres: {
								name: 'original',
								majorVersion: '17',
								earliestRestoreTime: new Date('2026-01-01T12:00:00Z')
							}
						}
					}
				}
			});
			create.mutate.mockResolvedValue({
				data: {
					createPostgres: {
						postgres: {
							id: 'c',
							name: 'clone',
							teamEnvironment: { environment: { name: 'dev' } }
						}
					}
				}
			});
			await expect(
				createActions.default(
					createEvent({
						mode: 'clone',
						name: 'clone',
						environment: 'dev',
						sourcePostgres: 'original',
						targetTime: ''
					})
				)
			).rejects.toMatchObject({ status: 303 });
			expect(create.mutate.mock.calls[0][0].input.recovery).toEqual({
				sourcePostgres: 'original',
				targetTime: new Date('2026-01-01T12:50:30.000Z')
			});
		} finally {
			vi.useRealTimers();
		}
	});
	test('rejects a default target before the earliest restore time instead of submitting', async () => {
		vi.useFakeTimers({ now: new Date('2026-01-01T12:05:00Z') });
		try {
			recoverySource.fetch.mockResolvedValue({
				data: {
					team: {
						environment: {
							postgres: {
								name: 'original',
								majorVersion: '17',
								earliestRestoreTime: new Date('2026-01-01T12:00:00Z')
							}
						}
					}
				}
			});
			const result = await createActions.default(
				createEvent({
					mode: 'clone',
					name: 'clone',
					environment: 'dev',
					sourcePostgres: 'original',
					targetTime: ''
				})
			);
			expect(result).toMatchObject({ status: 400 });
			expect(result?.data.error).toContain('earliest clone time');
			expect(create.mutate).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});
	describe('clone configuration', () => {
		const source = {
			name: 'original',
			majorVersion: '17',
			extensions: ['vector'],
			highAvailability: false,
			earliestRestoreTime: new Date('2020-01-01T00:00:00Z'),
			resources: { cpu: '500m', memory: '2Gi', diskSize: '20480Mi' }
		};
		beforeEach(() => {
			recoverySource.fetch.mockResolvedValue({
				data: { team: { environment: { postgres: source } } }
			});
			create.mutate.mockResolvedValue({
				data: {
					createPostgres: {
						postgres: { id: 'c', name: 'c', teamEnvironment: { environment: { name: 'dev' } } }
					}
				}
			});
		});
		async function clone(fields: Record<string, string | string[]> = {}) {
			const outcome = await createActions
				.default(
					createEvent({
						mode: 'clone',
						name: 'c',
						environment: 'dev',
						sourcePostgres: 'original',
						targetTime: '',
						extensionsPresent: 'true',
						extensions: ['vector'],
						...fields
					})
				)
				.then(
					(result) => result,
					(thrown) => thrown
				);
			return outcome;
		}
		const sent = () => create.mutate.mock.calls[0][0].input;

		test('sends only the recovery when nothing differs from the source (equal quantities)', async () => {
			// 0,5 cores == 500m, 2 GiB == 2Gi, 20 GiB == 20480Mi
			expect(
				await clone({ cpu: '0,5', memory: '2.0', diskSize: '20', majorVersion: '18' })
			).toMatchObject({ status: 303 });
			const input = sent();
			for (const field of ['cpu', 'memory', 'diskSize', 'highAvailability', 'extensions'])
				expect(input[field]).toBeUndefined();
			expect(input.majorVersion).toBe('17');
			expect(input.recovery.sourcePostgres).toBe('original');
		});
		test('sends only the changed cpu, memory, storage and high availability', async () => {
			await clone({ cpu: '2', memory: '4', diskSize: '30', highAvailability: 'on' });
			expect(sent()).toMatchObject({
				cpu: '2',
				memory: '4096Mi',
				diskSize: '30Gi',
				highAvailability: true
			});
			expect(sent().extensions).toBeUndefined();
			create.mutate.mockClear();
			await clone({ cpu: '0.5', memory: '3' });
			expect(sent()).toMatchObject({ memory: '3072Mi' });
			expect(sent().cpu).toBeUndefined();
			expect(sent().diskSize).toBeUndefined();
		});
		test('sends the full extension list only when one was added', async () => {
			await clone({ extensions: ['vector', 'pgcrypto'] });
			expect(sent().extensions).toEqual(['vector', 'pgcrypto']);
			expect(availableValues.fetch).toHaveBeenCalledTimes(1);
		});
		test('omits extensions when the source list is submitted unchanged or not at all', async () => {
			await clone({ extensions: ['vector'] });
			expect(sent().extensions).toBeUndefined();
			create.mutate.mockClear();
			await clone({ extensionsPresent: [], extensions: [] });
			expect(sent().extensions).toBeUndefined();
		});
		test('rejects removing a source extension and unavailable additions', async () => {
			const removed = await clone({ extensions: [] });
			expect(removed).toMatchObject({ status: 400 });
			expect(removed.data.error).toContain('cannot be removed: vector');
			const unavailable = await clone({ extensions: ['vector', 'unknown'] });
			expect(unavailable).toMatchObject({ status: 400 });
			expect(unavailable.data.error).toContain('unknown');
			expect(create.mutate).not.toHaveBeenCalled();
		});
		test.each(['19', '5', '19.9', '-1', 'abc'])(
			'rejects storage %s below the source',
			async (diskSize) => {
				const result = await clone({ diskSize });
				expect(result).toMatchObject({ status: 400 });
				expect(result.data.errors.diskSize).toContain('between 20 and 1000');
				expect(create.mutate).not.toHaveBeenCalled();
			}
		);
		test('applies the same format rules as the empty tab', async () => {
			const result = await clone({ cpu: '9', memory: 'x' });
			expect(result.data.errors).toMatchObject({
				cpu: expect.stringContaining('no greater than 8'),
				memory: expect.stringContaining('positive decimal')
			});
		});
		test('accepts an explicit value when the source has no configured resources', async () => {
			recoverySource.fetch.mockResolvedValue({
				data: { team: { environment: { postgres: { ...source, resources: null } } } }
			});
			await clone({ diskSize: '5', cpu: '1' });
			expect(sent()).toMatchObject({ diskSize: '5Gi', cpu: '1' });
		});
		test('ignores empty-tab fields for the version', async () => {
			await clone({ majorVersion: '18' });
			expect(sent().majorVersion).toBe('17');
		});
	});
	describe('standalone backup restore', () => {
		const backup = {
			name: 'frogres-dr-1',
			sourcePostgres: 'deleted-source',
			phase: 'COMPLETED',
			majorVersion: '17',
			diskSize: '20Gi',
			extensions: ['vector'],
			completedAt: new Date('2026-11-25T10:00:00Z'),
			expiresAt: null
		};
		beforeEach(() => {
			recoveryBackup.fetch.mockResolvedValue({
				data: { team: { environment: { postgresBackup: backup } } }
			});
			create.mutate.mockResolvedValue({
				data: {
					createPostgres: {
						postgres: {
							id: 'restored',
							name: 'restored',
							teamEnvironment: { environment: { name: 'dev' } }
						}
					}
				}
			});
		});

		test('restores from a completed backup with inherited version, disk and extensions', async () => {
			await expect(
				createActions.default(
					createEvent({
						mode: 'backup',
						name: 'deleted-source',
						environment: 'dev',
						backupName: 'frogres-dr-1',
						diskSize: '20',
						extensionsPresent: 'true',
						extensions: ['vector']
					})
				)
			).rejects.toMatchObject({ status: 303 });
			const input = create.mutate.mock.calls[0][0].input;
			expect(input).toMatchObject({
				name: 'deleted-source',
				majorVersion: '17',
				backupName: 'frogres-dr-1',
				recovery: undefined
			});
			for (const field of ['cpu', 'memory', 'diskSize', 'highAvailability', 'extensions'])
				expect(input[field]).toBeUndefined();
		});

		test('rejects incomplete, expired or smaller-disk backup restores', async () => {
			recoveryBackup.fetch.mockResolvedValueOnce({
				data: {
					team: { environment: { postgresBackup: { ...backup, phase: 'RUNNING' } } }
				}
			});
			const incomplete = await createActions.default(
				createEvent({
					mode: 'backup',
					name: 'restored',
					environment: 'dev',
					backupName: 'frogres-dr-1'
				})
			);
			expect(incomplete).toMatchObject({ status: 400 });
			expect(incomplete?.data.error).toContain('Only completed');

			recoveryBackup.fetch.mockResolvedValueOnce({
				data: {
					team: {
						environment: {
							postgresBackup: {
								...backup,
								expiresAt: new Date('2020-01-01T00:00:00Z')
							}
						}
					}
				}
			});
			const expired = await createActions.default(
				createEvent({
					mode: 'backup',
					name: 'restored',
					environment: 'dev',
					backupName: 'frogres-dr-1'
				})
			);
			expect(expired).toMatchObject({ status: 400 });
			expect(expired?.data.error).toContain('expired');

			const smallDisk = await createActions.default(
				createEvent({
					mode: 'backup',
					name: 'restored',
					environment: 'dev',
					backupName: 'frogres-dr-1',
					diskSize: '10'
				})
			);
			expect(smallDisk).toMatchObject({ status: 400 });
			expect(smallDisk?.data.errors.diskSize).toContain('between 20 and 1000');
			expect(create.mutate).not.toHaveBeenCalled();
		});
	});
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
					extensions: undefined,
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
					extensions: undefined,
					highAvailability: false
				}
			},
			expect.any(Object)
		);
	});

	describe('point-in-time recovery window', () => {
		const created = {
			data: {
				createPostgres: {
					postgres: {
						id: 'pg',
						name: 'database',
						teamEnvironment: { environment: { name: 'dev' } }
					}
				}
			}
		};

		test('is sent when creating', async () => {
			create.mutate.mockResolvedValue(created);
			await expect(
				createActions.default(
					createEvent({
						name: 'database',
						environment: 'dev',
						majorVersion: '18',
						backupRetentionDays: '14'
					})
				)
			).rejects.toMatchObject({ status: 303 });
			expect(create.mutate.mock.calls[0][0].input.backupRetentionDays).toBe(14);
		});

		test('is left to the platform when creating without a value', async () => {
			create.mutate.mockResolvedValue(created);
			await expect(
				createActions.default(
					createEvent({ name: 'database', environment: 'dev', majorVersion: '18' })
				)
			).rejects.toMatchObject({ status: 303 });
			expect(create.mutate.mock.calls[0][0].input.backupRetentionDays).toBeUndefined();
		});

		test.each(['1', '31', 'abc', '7.5'])('rejects %s without calling the API', async (days) => {
			expect(
				await createActions.default(
					createEvent({
						name: 'database',
						environment: 'dev',
						majorVersion: '18',
						backupRetentionDays: days
					})
				)
			).toMatchObject({
				status: 400,
				data: { error: expect.stringContaining('between 2 and 30') }
			});
			expect(await updateActions.default(updateEvent({ backupRetentionDays: days }))).toMatchObject(
				{ status: 400, data: { error: expect.stringContaining('between 2 and 30') } }
			);
			expect(create.mutate).not.toHaveBeenCalled();
			expect(update.mutate).not.toHaveBeenCalled();
		});

		test('is sent when updated and omitted when unchanged', async () => {
			update.mutate.mockResolvedValue({ data: { updatePostgres: { postgres: { id: 'pg' } } } });
			await expect(
				updateActions.default(updateEvent({ backupRetentionDays: '21' }))
			).rejects.toMatchObject({ status: 303 });
			expect(update.mutate.mock.calls[0][0].input.backupRetentionDays).toBe(21);
			await expect(
				updateActions.default(updateEvent({ backupRetentionDays: '7' }))
			).rejects.toMatchObject({ status: 303 });
			expect(update.mutate.mock.calls[1][0].input.backupRetentionDays).toBeUndefined();
		});
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

	test.each(['5', '9'])('accepts %s GiB storage when creating and updating', async (diskSize) => {
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
				createEvent({ name: 'database', environment: 'dev', majorVersion: '18', diskSize })
			)
		).rejects.toMatchObject({ status: 303 });
		await expect(updateActions.default(updateEvent({ diskSize }))).rejects.toMatchObject({
			status: 303
		});
		for (const mutation of [create, update]) {
			expect(mutation.mutate).toHaveBeenCalledWith(
				{ input: expect.objectContaining({ diskSize: `${diskSize}Gi` }) },
				expect.any(Object)
			);
		}
	});

	test('omits unchanged fractional storage while updating CPU and high availability', async () => {
		currentResources.fetch.mockResolvedValue({
			data: {
				team: {
					environment: {
						environment: { availableValues: { postgresExtensions: { values: [] } } },
						postgres: { extensions: [], resources: { diskSize: '20G' } }
					}
				}
			}
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

	describe('Postgres extension and version selection', () => {
		const creationFields = { name: 'database', environment: 'dev', majorVersion: '18' };

		test.each([{ extensions: ['pgcrypto', 'vector'] }, { extensions: [] }])(
			'creates with the explicit extension selection: %s',
			async ({ extensions }) => {
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
							...creationFields,
							extensionsPresent: 'true',
							extensions
						})
					)
				).rejects.toMatchObject({ status: 303 });
				expect(create.mutate).toHaveBeenCalledWith(
					{ input: expect.objectContaining({ extensions }) },
					expect.any(Object)
				);
			}
		);

		test.each<Record<string, string | string[]>>([
			{ majorVersion: '99' },
			{ extensions: ['unsupported'] }
		])('rejects selections unavailable in the selected environment: %s', async (fields) => {
			expect(
				await createActions.default(
					createEvent({
						...creationFields,
						...fields
					})
				)
			).toMatchObject({ status: 400, data: { ...fields, error: expect.any(String) } });
			expect(create.mutate).not.toHaveBeenCalled();
		});

		test('blocks creation when available values cannot be determined', async () => {
			availableValues.fetch.mockResolvedValue({ errors: [{ message: 'Options unavailable.' }] });
			expect(
				await createActions.default(
					createEvent({
						...creationFields,
						extensions: ['vector']
					})
				)
			).toMatchObject({
				status: 500,
				data: { extensions: ['vector'], error: 'Options unavailable.' }
			});
			expect(create.mutate).not.toHaveBeenCalled();
		});

		test.each([
			{ extensions: ['pgcrypto'], expected: undefined },
			{ extensions: ['vector'], expected: ['vector'] },
			{ extensions: [], expected: [] }
		])('updates with replacement semantics: %s', async ({ extensions, expected }) => {
			update.mutate.mockResolvedValue({ data: { updatePostgres: { postgres: { id: 'pg' } } } });
			await expect(
				updateActions.default(
					updateEvent({
						extensionsPresent: 'true',
						extensions
					})
				)
			).rejects.toMatchObject({ status: 303 });
			expect(update.mutate).toHaveBeenCalledWith(
				{ input: expect.objectContaining({ extensions: expected }) },
				expect.any(Object)
			);
		});

		test('retains existing extensions that are no longer available', async () => {
			const current = await currentResources.fetch();
			current.data.team.environment.postgres.extensions = ['legacy'];
			update.mutate.mockResolvedValue({ data: { updatePostgres: { postgres: { id: 'pg' } } } });
			await expect(
				updateActions.default(
					updateEvent({
						extensionsPresent: 'true',
						extensions: ['legacy', 'vector']
					})
				)
			).rejects.toMatchObject({ status: 303 });
			expect(update.mutate).toHaveBeenCalledWith(
				{ input: expect.objectContaining({ extensions: ['legacy', 'vector'] }) },
				expect.any(Object)
			);
		});

		test('does not overwrite concurrent extension changes when the selection is untouched', async () => {
			const current = await currentResources.fetch();
			current.data.team.environment.postgres.extensions = ['pgcrypto', 'vector'];
			update.mutate.mockResolvedValue({ data: { updatePostgres: { postgres: { id: 'pg' } } } });
			await expect(
				updateActions.default(
					updateEvent({
						extensionsPresent: 'true',
						extensions: ['pgcrypto'],
						initialExtensionsPresent: 'true',
						initialExtensions: ['pgcrypto'],
						cpu: '0.5'
					})
				)
			).rejects.toMatchObject({ status: 303 });
			expect(update.mutate).toHaveBeenCalledWith(
				{ input: expect.objectContaining({ extensions: undefined, cpu: '0.5' }) },
				expect.any(Object)
			);
		});

		test('rejects adding unavailable extensions and retains the selection', async () => {
			expect(
				await updateActions.default(
					updateEvent({
						extensionsPresent: 'true',
						extensions: ['unsupported']
					})
				)
			).toMatchObject({
				status: 400,
				data: { extensions: ['unsupported'], error: expect.any(String) }
			});
			expect(update.mutate).not.toHaveBeenCalled();
		});

		test('retains an explicitly empty selection when the update fails', async () => {
			update.mutate.mockResolvedValue({ errors: [{ message: 'Update failed.' }] });
			expect(await updateActions.default(updateEvent({ extensionsPresent: 'true' }))).toMatchObject(
				{
					status: 400,
					data: { extensions: [], error: 'Update failed.' }
				}
			);
		});
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
		['diskSize', '3'],
		['diskSize', '4'],
		['diskSize', '0'],
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
