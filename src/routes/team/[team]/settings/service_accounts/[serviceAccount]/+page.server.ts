import { graphql } from '$houdini';
import { fail } from '@sveltejs/kit';

const deleteTokenMutation = graphql(`
	mutation DeleteServiceAccountTokenAction($input: DeleteServiceAccountTokenInput!) {
		deleteServiceAccountToken(input: $input) {
			serviceAccountTokenDeleted
		}
	}
`);

const removeBindingMutation = graphql(`
	mutation RemoveWorkloadBindingAction($input: RemoveWorkloadFromServiceAccountInput!) {
		removeWorkloadFromServiceAccount(input: $input) {
			bindingDeleted
		}
	}
`);

const addBindingMutation = graphql(`
	mutation AddWorkloadBindingAction($input: AddWorkloadToServiceAccountInput!) {
		addWorkloadToServiceAccount(input: $input) {
			binding {
				id
			}
		}
	}
`);

const createTokenMutation = graphql(`
	mutation CreateServiceAccountTokenAction($input: CreateServiceAccountTokenInput!) {
		createServiceAccountToken(input: $input) {
			secret
			serviceAccountToken {
				id
				name
			}
		}
	}
`);

export const actions = {
	deleteToken: async (event) => {
		const data = await event.request.formData();
		const tokenId = data.get('tokenId') as string | null;

		if (!tokenId) {
			return fail(400, { error: 'Token ID is required' });
		}

		const res = await deleteTokenMutation.mutate(
			{ input: { serviceAccountTokenID: tokenId } },
			{ event }
		);

		if ((res.errors?.length ?? 0) > 0) {
			return fail(400, { error: res.errors![0].message });
		}

		return { success: true };
	},

	removeBinding: async (event) => {
		const data = await event.request.formData();
		const bindingId = data.get('bindingId') as string | null;

		if (!bindingId) {
			return fail(400, { error: 'Binding ID is required' });
		}

		const res = await removeBindingMutation.mutate({ input: { bindingID: bindingId } }, { event });

		if ((res.errors?.length ?? 0) > 0) {
			return fail(400, { error: res.errors![0].message });
		}

		return { success: true };
	},

	addBinding: async (event) => {
		const data = await event.request.formData();
		const serviceAccountID = data.get('serviceAccountID') as string | null;
		const workloadName = data.get('workloadName') as string | null;
		const environment = data.get('environment') as string | null;
		const teamSlug = data.get('teamSlug') as string | null;

		if (!serviceAccountID || !workloadName || !environment || !teamSlug) {
			return fail(400, { error: 'All fields are required' });
		}

		const res = await addBindingMutation.mutate(
			{ input: { serviceAccountID, workloadName, environment, teamSlug } },
			{ event }
		);

		if ((res.errors?.length ?? 0) > 0) {
			return fail(400, { error: res.errors![0].message });
		}

		return { success: true };
	},

	createToken: async (event) => {
		const data = await event.request.formData();
		const serviceAccountID = data.get('serviceAccountID') as string | null;
		const name = data.get('name') as string | null;
		const description = data.get('description') as string | null;
		const expiresAt = data.get('expiresAt') as string | null;

		if (!serviceAccountID || !name || !description) {
			return fail(400, { error: 'Name and description are required' });
		}

		const res = await createTokenMutation.mutate(
			{
				input: {
					serviceAccountID,
					name,
					description,
					...(expiresAt ? { expiresAt: new Date(expiresAt) } : {})
				}
			},
			{ event }
		);

		if ((res.errors?.length ?? 0) > 0) {
			return fail(400, { error: res.errors![0].message });
		}

		return { success: true, secret: res.data?.createServiceAccountToken.secret ?? null };
	}
};
