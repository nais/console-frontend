import { render } from 'svelte/server';
import ChartBoundaryFailureFixture from './ChartBoundaryFailureFixture.svelte';

describe('ChartBoundary', () => {
	test('renders its fallback for server-side render errors', async () => {
		const { body } = await render(ChartBoundaryFailureFixture, {
			transformError: () => ({ message: 'Unexpected rendering error' })
		});

		expect(body).toContain('Chart failed to render.');
		expect(body).not.toContain('synthetic chart render failure');
	});
});
