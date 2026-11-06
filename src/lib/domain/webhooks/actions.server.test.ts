import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	createWebhook,
	deleteWebhook,
	enableWebhook,
	testWebhook,
	updateWebhook
} from './actions.server.js';

const mocks = vi.hoisted(() => ({
	owner: true,
	admin: false,
	teamSlug: 'my-team' as string | null,
	typename: 'WebhookSubscription',
	accessErrors: null as { message: string }[] | null,
	settingsErrors: null as { message: string }[] | null,
	mutationErrors: null as { message: string }[] | null,
	missingData: false,
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	test: vi.fn(),
	access: vi.fn(),
	settings: vi.fn()
}));

vi.mock('$houdini', async () => {
	const { readable } = await import('svelte/store');
	return {
		graphql: (query: string) => ({
			mutate: query.includes('CreateTeamWebhook')
				? mocks.create
				: query.includes('DeleteTeamWebhook')
					? mocks.delete
					: query.includes('TestTeamWebhook')
						? mocks.test
						: mocks.update
		}),
		load_WebhookManagementAccess: mocks.access.mockImplementation(async () => ({
			WebhookManagementAccess: readable({
				errors: mocks.accessErrors,
				data: {
					team: { viewerIsOwner: mocks.owner },
					me: { __typename: 'User', isAdmin: mocks.admin }
				}
			})
		})),
		load_WebhookSettings: mocks.settings.mockImplementation(async () => ({
			WebhookSettings: readable({
				errors: mocks.settingsErrors,
				data: {
					node: {
						__typename: mocks.typename,
						id: 'webhook-id',
						enabled: false,
						teamSlug: mocks.teamSlug
					}
				}
			})
		}))
	};
});

function event(overrides: Record<string, string | string[]> = {}) {
	const body = new FormData();
	for (const [key, value] of Object.entries({
		name: 'Deployment notifications',
		url: 'https://receiver.example.com/events',
		secret: '',
		eventScope: 'all',
		enabled: 'true',
		...overrides
	})) {
		for (const entry of typeof value === 'string' ? [value] : value) body.append(key, entry);
	}
	return {
		params: { team: 'my-team', webhookId: 'webhook-id' },
		request: new Request('https://console.example.com/team/my-team/settings/webhooks', {
			method: 'POST',
			body
		})
	} as Parameters<typeof updateWebhook>[0];
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.owner = true;
	mocks.admin = false;
	mocks.teamSlug = 'my-team';
	mocks.typename = 'WebhookSubscription';
	mocks.accessErrors = null;
	mocks.settingsErrors = null;
	mocks.mutationErrors = null;
	mocks.missingData = false;
	mocks.create.mockImplementation(async () => ({
		errors: mocks.mutationErrors,
		data: mocks.missingData ? null : { createWebhook: { webhook: { id: 'webhook-id' } } }
	}));
	mocks.update.mockImplementation(async () => ({
		errors: mocks.mutationErrors,
		data: mocks.missingData ? null : { updateWebhook: { webhook: { id: 'webhook-id' } } }
	}));
	mocks.delete.mockImplementation(async () => ({
		errors: mocks.mutationErrors,
		data: mocks.missingData ? null : { deleteWebhook: { webhookID: 'webhook-id' } }
	}));
	mocks.test.mockImplementation(async () => ({
		errors: mocks.mutationErrors,
		data: mocks.missingData
			? null
			: { testWebhook: { delivery: { id: 'test-delivery-id', isTest: true, success: false } } }
	}));
});

describe('team webhook actions', () => {
	it.each([createWebhook, updateWebhook, deleteWebhook, enableWebhook, testWebhook])(
		'rejects direct POSTs from a non-owner without global admin access (%s)',
		async (action) => {
			mocks.owner = false;
			await expect(action(event())).rejects.toMatchObject({ status: 403 });
			expect(mocks.create).not.toHaveBeenCalled();
			expect(mocks.update).not.toHaveBeenCalled();
			expect(mocks.delete).not.toHaveBeenCalled();
			expect(mocks.test).not.toHaveBeenCalled();
		}
	);

	it('allows a team owner to create an enabled webhook for the route team', async () => {
		const input = event({ secret: 'test-signing-key' });
		await expect(createWebhook(input)).rejects.toMatchObject({
			status: 303,
			location: '/team/my-team/settings/webhooks/webhook-id'
		});
		expect(mocks.create).toHaveBeenCalledWith(
			{
				input: {
					name: 'Deployment notifications',
					url: 'https://receiver.example.com/events',
					secret: 'test-signing-key',
					eventTypes: ['*'],
					teamSlug: 'my-team'
				}
			},
			{ event: input }
		);
		expect(mocks.update).not.toHaveBeenCalled();
		expect(mocks.test).not.toHaveBeenCalled();
	});

	it.each([createWebhook, updateWebhook, deleteWebhook, enableWebhook, testWebhook])(
		'allows global administrators who are not team owners (%s)',
		async (action) => {
			mocks.owner = false;
			mocks.admin = true;
			if (action === testWebhook) {
				await expect(action(event())).resolves.toMatchObject({
					testDelivery: { id: 'test-delivery-id' }
				});
			} else if (action === enableWebhook) {
				await expect(action(event({ secret: 'test-signing-key' }))).resolves.toEqual({
					success: true
				});
			} else {
				await expect(action(event({ secret: 'test-signing-key' }))).rejects.toMatchObject({
					status: 303
				});
			}
		}
	);

	it('rejects creation when the secret is blank or omitted', async () => {
		for (const secret of ['', []]) {
			const result = await createWebhook(event({ secret }));
			expect(result?.status).toBe(400);
			expect(result?.data.errors).toContain('A signing secret is required.');
		}
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it.each([updateWebhook, deleteWebhook, enableWebhook, testWebhook])(
		'rejects webhooks that belong to a different team (%s)',
		async (action) => {
			mocks.teamSlug = 'another-team';
			await expect(action(event())).rejects.toMatchObject({ status: 404 });
			expect(mocks.update).not.toHaveBeenCalled();
			expect(mocks.delete).not.toHaveBeenCalled();
			expect(mocks.test).not.toHaveBeenCalled();
		}
	);

	it.each([updateWebhook, testWebhook])(
		'rejects global webhooks even for global administrators (%s)',
		async (action) => {
			mocks.admin = true;
			mocks.teamSlug = null;
			await expect(action(event())).rejects.toMatchObject({ status: 404 });
		}
	);

	it.each([updateWebhook, testWebhook])('rejects IDs of other node types (%s)', async (action) => {
		mocks.typename = 'Application';
		await expect(action(event())).rejects.toMatchObject({ status: 404 });
	});

	it('does not continue when permissions cannot be verified', async () => {
		mocks.accessErrors = [{ message: 'API unavailable' }];
		await expect(createWebhook(event())).rejects.toMatchObject({ status: 500 });
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('does not continue when webhook ownership cannot be verified', async () => {
		mocks.settingsErrors = [{ message: 'API unavailable' }];
		await expect(deleteWebhook(event())).rejects.toMatchObject({ status: 500 });
		expect(mocks.delete).not.toHaveBeenCalled();
	});

	it('does not send tests when fresh permission or ownership checks fail', async () => {
		mocks.accessErrors = [{ message: 'API unavailable' }];
		await expect(testWebhook(event())).rejects.toMatchObject({ status: 500 });
		mocks.accessErrors = null;
		mocks.settingsErrors = [{ message: 'API unavailable' }];
		await expect(testWebhook(event())).rejects.toMatchObject({ status: 500 });
		expect(mocks.test).not.toHaveBeenCalled();
	});

	it('keeps the existing secret when edit leaves it blank and can disable the webhook', async () => {
		await expect(updateWebhook(event({ enabled: '' }))).rejects.toMatchObject({ status: 303 });
		expect(mocks.update.mock.calls[0][0]).toEqual({
			input: {
				id: 'webhook-id',
				name: 'Deployment notifications',
				url: 'https://receiver.example.com/events',
				eventTypes: ['*'],
				enabled: false
			}
		});
	});

	it('rotates a signing secret without trimming it', async () => {
		await expect(updateWebhook(event({ secret: '  new-test-key  ' }))).rejects.toMatchObject({
			status: 303
		});
		expect(mocks.update.mock.calls[0][0].input.secret).toBe('  new-test-key  ');
	});

	it.each([createWebhook, updateWebhook])(
		'rejects 7-character secrets without calling the API (%s)',
		async (action) => {
			const result = await action(event({ secret: '1234567' }));
			expect(result?.status).toBe(400);
			expect(result?.data.errors).toContain('The signing secret must be at least 8 characters.');
			expect(JSON.stringify(result)).not.toContain('1234567');
			expect(mocks.create).not.toHaveBeenCalled();
			expect(mocks.update).not.toHaveBeenCalled();
		}
	);

	it.each([createWebhook, updateWebhook])(
		'forwards an 8-character secret unchanged (%s)',
		async (action) => {
			await expect(action(event({ secret: '12345678' }))).rejects.toMatchObject({ status: 303 });
			const mutation = action === createWebhook ? mocks.create : mocks.update;
			expect(mutation.mock.calls[0][0].input.secret).toBe('12345678');
		}
	);

	it('keeps the existing secret when the edit field is omitted', async () => {
		await expect(updateWebhook(event({ secret: [] }))).rejects.toMatchObject({ status: 303 });
		expect(mocks.update.mock.calls[0][0].input).not.toHaveProperty('secret');
	});

	it.each([createWebhook, updateWebhook])(
		'submits the trimmed webhook name (%s)',
		async (action) => {
			await expect(
				action(event({ name: '  Renamed notifications  ', secret: 'test-signing-key' }))
			).rejects.toMatchObject({ status: 303 });
			const mutation = action === createWebhook ? mocks.create : mocks.update;
			expect(mutation.mock.calls[0][0].input.name).toBe('Renamed notifications');
		}
	);

	it.each([createWebhook, updateWebhook])(
		'rejects a blank name without calling the API (%s)',
		async (action) => {
			const result = await action(event({ name: '   ', secret: 'test-signing-key' }));
			expect(result?.status).toBe(400);
			expect(result?.data.errors).toContain('A webhook name is required.');
			expect(mocks.create).not.toHaveBeenCalled();
			expect(mocks.update).not.toHaveBeenCalled();
		}
	);

	it.each([createWebhook, updateWebhook])(
		'subscribes to other teams without checking their management permissions (%s)',
		async (action) => {
			const input = event({
				secret: 'test-signing-key',
				sourceScope: 'selected',
				sourceTeamSlugs: ['other-team', 'third-team'],
				teamSlug: 'attempted-owner-change'
			});
			await expect(action(input)).rejects.toMatchObject({ status: 303 });
			const mutation = action === createWebhook ? mocks.create : mocks.update;
			expect(mutation.mock.calls[0][0].input.sourceTeamSlugs).toEqual(['other-team', 'third-team']);
			expect(mocks.access).toHaveBeenCalledTimes(1);
			expect(mocks.access).toHaveBeenCalledWith(
				expect.objectContaining({ variables: { team: 'my-team' } })
			);
			if (action === createWebhook) {
				expect(mocks.create.mock.calls[0][0].input.teamSlug).toBe('my-team');
			} else {
				expect(mocks.update.mock.calls[0][0].input).not.toHaveProperty('teamSlug');
			}
		}
	);

	it.each([createWebhook, updateWebhook])(
		'uses the route owner for This team even when different sources are posted (%s)',
		async (action) => {
			await expect(
				action(
					event({
						secret: 'test-signing-key',
						sourceScope: 'team',
						sourceTeamSlugs: ['other-team'],
						teamSlug: 'attempted-owner-change'
					})
				)
			).rejects.toMatchObject({ status: 303 });
			const mutation = action === createWebhook ? mocks.create : mocks.update;
			expect(mutation.mock.calls[0][0].input.sourceTeamSlugs).toEqual(['my-team']);
		}
	);

	it.each([createWebhook, updateWebhook])(
		'sends an empty source list for all teams (%s)',
		async (action) => {
			await expect(
				action(event({ secret: 'test-signing-key', sourceScope: 'all' }))
			).rejects.toMatchObject({ status: 303 });
			const mutation = action === createWebhook ? mocks.create : mocks.update;
			expect(mutation.mock.calls[0][0].input.sourceTeamSlugs).toEqual([]);
			expect(mutation.mock.calls[0][0].input).not.toHaveProperty('allTeams');
		}
	);

	it('does not turn an empty selected-team submission into an all-team subscription', async () => {
		const result = await updateWebhook(event({ sourceScope: 'selected' }));
		expect(result?.status).toBe(400);
		expect(result?.data.errors).toContain('Select at least one source team.');
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it('returns validation errors without echoing the signing secret', async () => {
		const result = await createWebhook(event({ url: 'not-a-url', secret: 'test-signing-key' }));
		expect(result?.status).toBe(400);
		expect(result?.data.fields.url).toBe('not-a-url');
		expect(result?.data.fields.name).toBe('Deployment notifications');
		expect(JSON.stringify(result)).not.toContain('test-signing-key');
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('returns API errors without echoing the signing secret', async () => {
		mocks.mutationErrors = [{ message: 'The endpoint is not allowed.' }];
		const result = await createWebhook(event({ secret: 'test-signing-key' }));
		expect(result?.status).toBe(400);
		expect(result?.data.errors).toEqual(['The endpoint is not allowed.']);
		expect(JSON.stringify(result)).not.toContain('test-signing-key');
	});

	it.each([createWebhook, updateWebhook, deleteWebhook, enableWebhook, testWebhook])(
		'does not report success when the API returns no payload (%s)',
		async (action) => {
			mocks.missingData = true;
			await expect(action(event({ secret: 'test-signing-key' }))).resolves.toMatchObject({
				status: 500
			});
		}
	);

	it('deletes the webhook and redirects to the team list', async () => {
		await expect(deleteWebhook(event())).rejects.toMatchObject({
			status: 303,
			location: '/team/my-team/settings/webhooks'
		});
		expect(mocks.delete.mock.calls[0][0]).toEqual({ input: { id: 'webhook-id' } });
	});

	it('re-enables without overwriting the URL, secret, event types, or source selection', async () => {
		expect(await enableWebhook(event())).toEqual({ success: true });
		expect(mocks.update.mock.calls[0][0]).toEqual({
			input: { id: 'webhook-id', enabled: true }
		});
	});

	it('returns a failed test attempt for a disabled webhook without changing its configuration', async () => {
		const input = event({ id: 'another-webhook' });
		await expect(testWebhook(input)).resolves.toEqual({
			testDelivery: { id: 'test-delivery-id', isTest: true, success: false }
		});
		expect(mocks.test).toHaveBeenCalledExactlyOnceWith(
			{ input: { id: 'webhook-id' } },
			{ event: input }
		);
		expect(mocks.create).not.toHaveBeenCalled();
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it('returns successful test attempts', async () => {
		mocks.test.mockResolvedValue({
			data: { testWebhook: { delivery: { id: 'test-delivery-id', isTest: true, success: true } } }
		});
		await expect(testWebhook(event())).resolves.toEqual({
			testDelivery: { id: 'test-delivery-id', isTest: true, success: true }
		});
	});

	it('surfaces rate-limit errors without retrying the mutation', async () => {
		mocks.test.mockResolvedValue({
			errors: [{ message: 'Wait 30 seconds before sending another test.' }],
			data: null
		});
		await expect(testWebhook(event())).resolves.toMatchObject({
			status: 400,
			data: { errors: ['Wait 30 seconds before sending another test.'] }
		});
		expect(mocks.test).toHaveBeenCalledOnce();
	});

	it('preserves any returned attempt alongside GraphQL errors', async () => {
		mocks.mutationErrors = [{ message: 'Additional diagnostic error' }];
		await expect(testWebhook(event())).resolves.toMatchObject({
			status: 400,
			data: {
				errors: ['Additional diagnostic error'],
				testDelivery: { id: 'test-delivery-id', success: false }
			}
		});
	});
});
