import { render } from 'svelte/server';
import PostgresConfigurationFields from './PostgresConfigurationFields.svelte';

describe('PostgresConfigurationFields', () => {
	test('renders server validation errors next to the corresponding fields', async () => {
		const { body } = await render(PostgresConfigurationFields, {
			props: {
				cpu: '9',
				memory: '33',
				diskSize: '9',
				errors: { cpu: 'invalid', memory: 'invalid', diskSize: 'invalid' }
			}
		});
		expect(body).toContain('CPU (cores) must be no greater than 8.');
		expect(body).toContain('Memory (GiB) must be no greater than 32.');
		expect(body).toContain('Storage (GiB) must be a whole number between 10 and 1000.');
		expect(body.match(/aria-invalid="true"/g)).toHaveLength(3);
	});
	test('renders a default summary without placeholders or submitted defaults', async () => {
		const { body } = await render(PostgresConfigurationFields);
		for (const name of ['cpu', 'memory', 'diskSize', 'highAvailability']) {
			expect(body).toContain(`name="${name}"`);
		}
		expect(body).not.toContain('Leave blank to use platform defaults.');
		expect(body).not.toContain('placeholder=');
		for (const value of ['0.1', '0.5', '10']) {
			expect(body).toMatch(new RegExp(`<dd[^>]*>${value.replace('.', '\\.')}<\\/dd>`));
			expect(body).not.toContain(`value="${value}"`);
		}
		expect(body).not.toContain('checked');
		expect(body).toContain('Customize resources');
		expect(body).toContain('aria-expanded="false"');
		for (const label of ['CPU (cores)', 'Memory (GiB)', 'Storage (GiB)'])
			expect(body).toContain(label);
	});

	test('opens customization for retained resource values', async () => {
		const { body } = await render(PostgresConfigurationFields, { props: { cpu: '0,25' } });
		expect(body).toContain('aria-expanded="true"');
		expect(body).toContain('value="0,25"');
		expect(body).toMatch(/<dd[^>]*>0,25<\/dd>/);
	});

	test('renders existing values and high availability for editing', async () => {
		const { body } = await render(PostgresConfigurationFields, {
			props: {
				cpu: '0.25',
				memory: '1',
				diskSize: '20',
				highAvailability: true,
				editing: true
			}
		});
		for (const value of ['0.25', '1', '20']) expect(body).toContain(`value="${value}"`);
		expect(body).toContain('checked');
		expect(body).toContain('Leave blank to keep the current value.');
		expect(body).not.toContain('placeholder=');
		expect(body).not.toContain('Leave blank to use platform defaults.');
		expect(body).not.toContain('Customize resources');
	});
});
