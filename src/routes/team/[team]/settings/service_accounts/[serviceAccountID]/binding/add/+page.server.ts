import { graphql } from '$houdini';
import { fail } from '@sveltejs/kit';

const addBindingMutation = graphql(`
	mutation AddWorkloadBindingPage($input: AddWorkloadToServiceAccountInput!) {
		addWorkloadToServiceAccount(input: $input) {
			binding {
				id
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const serviceAccountID = data.get('serviceAccountID') as string | null;
		const workloadName = data.get('workloadName') as string | null;
		const environment = data.get('environment') as string | null;
		const teamSlug = event.params.team;

		if (!serviceAccountID || !workloadName || !environment) {
			return fail(400, { error: 'All fields are required' });
		}

		const res = await addBindingMutation.mutate(
			{ input: { serviceAccountID, workloadName, environment, teamSlug } },
			{ event }
		);

		if ((res.errors?.length ?? 0) > 0) {
			return fail(400, { error: res.errors![0].message });
		}

		return { success: true, workloadName, environment };
	}
};
