import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const cve = data.get('cve') as string | null;

		if (cve) {
			const normalizedCve = cve.trim();
			redirect(303, `/vulnerabilities/${encodeURIComponent(normalizedCve)}`);
		}

		return { success: false, error: 'Please enter a CVE ID' };
	}
};
