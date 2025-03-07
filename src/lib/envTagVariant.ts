import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';

// HACK: mantained manually - should have been provided by Nais API
export const envTagVariant = (env: string): TagProps['variant'] => {
	switch (env) {
		case 'non-prod':
		case 'sandbox':
		case 'dev-gcp':
		case 'ci':
		case 'test':
		case 'dev':
			return 'neutral-filled';
		case 'prod-gcp':
		case 'prod':
			return 'info-moderate';
		case 'prod-fss':
			return 'alt3-moderate';
		case 'dev-fss':
			return 'neutral-moderate';
		default:
			if (env.includes('prod')) {
				return 'info-moderate';
			}
			return 'neutral-filled';
	}
};
