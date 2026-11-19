import { vi } from 'vitest';
import { load } from './+layout.server';

const config = vi.hoisted(() => ({ value: '' }));

vi.mock('$app/env/private', () => ({
	get LEGACY_DEPLOY_DISABLED() {
		return config.value;
	}
}));

const event: Pick<Parameters<typeof load>[0], 'cookies' | 'locals' | 'request'> = {
	cookies: {
		get: () => undefined,
		getAll: () => [],
		set: vi.fn(),
		delete: vi.fn(),
		serialize: () => ''
	},
	locals: { tenantName: 'test', githubOrganization: 'test' },
	request: new Request('http://localhost/')
};

test.each([
	['', false],
	['false', false],
	['true', true]
])('exposes %s as the boolean %s', async (value, expected) => {
	config.value = value;
	expect((await load(event as Parameters<typeof load>[0])).legacyDeployDisabled).toBe(expected);
});

test.each(['TRUE', '1', 'invalid'])(
	'rejects invalid legacy deploy configuration: %s',
	async (value) => {
		config.value = value;
		await expect(load(event as Parameters<typeof load>[0])).rejects.toThrow(
			'LEGACY_DEPLOY_DISABLED must be true or false'
		);
	}
);
