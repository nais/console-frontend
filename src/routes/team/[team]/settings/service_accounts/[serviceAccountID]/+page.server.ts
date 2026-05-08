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
	}
};
