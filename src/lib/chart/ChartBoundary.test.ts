import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import ChartBoundary from './ChartBoundary.svelte';
import ChartBoundaryFailureFixture from './ChartBoundaryFailureFixture.svelte';

describe('ChartBoundary', () => {
	test.each([undefined, true, false])(
		'supports fillHeight=%s while preserving the default',
		async (fillHeight) => {
			const { body } = await render(ChartBoundary, {
				props: {
					fillHeight,
					children: createRawSnippet(() => ({ render: () => '<div>Chart content</div>' }))
				}
			});
			expect(body).toContain('Chart content');
			if (fillHeight === false) {
				expect(body).not.toContain('fill-height');
			} else {
				expect(body).toContain('fill-height');
			}
		}
	);

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
