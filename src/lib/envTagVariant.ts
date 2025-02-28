import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';

export const envTagVariant = (env: string): TagProps['variant'] => {
	if (env.includes('prod')) {
		if (env.includes('fss')) {
			return 'alt3-moderate';
		}
		return 'info-moderate';
	}
	if (env.includes('fss')) {
		return 'neutral-moderate';
	}
	return 'neutral-filled';
};
