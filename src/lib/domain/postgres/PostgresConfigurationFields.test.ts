import { render } from 'svelte/server';
import PostgresConfigurationFields from './PostgresConfigurationFields.svelte';

describe('PostgresConfigurationFields', () => {
	test('renders named resource fields and default guidance for creation', async () => {
		const { body } = await render(PostgresConfigurationFields);
		for (const name of ['cpu', 'memory', 'diskSize', 'highAvailability']) {
			expect(body).toContain(`name="${name}"`);
		}
		expect(body).toContain('Leave blank to use the platform default.');
		expect(body).not.toContain('checked');
	});

	test('renders existing values and high availability for editing', async () => {
		const { body } = await render(PostgresConfigurationFields, {
			props: {
				cpu: '250m',
				memory: '1Gi',
				diskSize: '20Gi',
				highAvailability: true,
				editing: true
			}
		});
		for (const value of ['250m', '1Gi', '20Gi']) expect(body).toContain(`value="${value}"`);
		expect(body).toContain('checked');
		expect(body).toContain('Leave blank to keep the current value.');
	});
});
