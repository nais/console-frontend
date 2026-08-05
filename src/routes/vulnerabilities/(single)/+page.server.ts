import { cveSearchForm } from '$lib/forms/vulnerability';
import { validateForm } from '$lib/server/form';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	search: async (event) => {
		const result = await validateForm({ event, fields: cveSearchForm });

		if (!result.success) {
			return result.errorResponse;
		}

		redirect(303, `/vulnerabilities/${encodeURIComponent(result.data.cve)}`);
	}
};
