import { render } from 'svelte/server';
import ChartBoundaryFailureFixture from './ChartBoundaryFailureFixture.svelte';

describe('ChartBoundary', () => {
	test('renders its fallback for server-side render errors', async () => {
		const { body } = await render(ChartBoundaryFailureFixture, {
			transformError: async () => ({ message: 'Unexpected rendering error' })
		});

		expect(body).toContain('Chart failed to render.');
		expect(body).toContain('Metadata failed to render.');
		expect(body).toContain('Content before chart');
		expect(body).toContain('Content after chart');
		expect(body).not.toContain('synthetic chart render failure');
	});
});
