import { vi } from 'vitest';
import { load } from './+layout.server';

const config = vi.hoisted(() => ({ value: '', v0s: '' }));

vi.mock('$app/env/private', () => ({
	get LEGACY_DEPLOY_DISABLED() {
		return config.value;
	},
	get V0S_VULNERABILITIES_ENABLED() {
		return config.v0s;
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

test.each([
	['', false],
	['false', false],
	['true', true]
])('exposes v0s vulnerabilities %s as the boolean %s', async (value, expected) => {
	config.value = '';
	config.v0s = value;
	expect((await load(event as Parameters<typeof load>[0])).v0sVulnerabilities).toBe(expected);
});

test.each(['TRUE', '1', 'invalid'])('rejects invalid v0s configuration: %s', async (value) => {
	config.value = '';
	config.v0s = value;
	await expect(load(event as Parameters<typeof load>[0])).rejects.toThrow(
		'V0S_VULNERABILITIES_ENABLED must be true or false'
	);
});
