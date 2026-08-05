import { graphql } from '$houdini';
import { removeBindingForm } from '$lib/forms/serviceaccounts';
import { deleteTokenForm } from '$lib/forms/service-account-token';
import { formAction } from '$lib/server/form';

const deleteTokenMutation = graphql(`
	mutation AdminDeleteServiceAccountToken($input: DeleteServiceAccountTokenInput!) {
		deleteServiceAccountToken(input: $input) {
			serviceAccountTokenDeleted
		}
	}
`);

const removeBindingMutation = graphql(`
	mutation AdminRemoveWorkloadBinding($input: RemoveWorkloadFromServiceAccountInput!) {
		removeWorkloadFromServiceAccount(input: $input) {
			bindingDeleted
		}
	}
`);

export const actions = {
	deleteToken: formAction({
		fields: deleteTokenForm,
		mutation: deleteTokenMutation,
		variables: ({ data }) => ({ input: { serviceAccountTokenID: data.tokenId } }),
		message: 'Failed to delete token',
		// The API reports a no-op deletion in the payload rather than as an error.
		succeeded: (result) => result.deleteServiceAccountToken.serviceAccountTokenDeleted === true
	}),

	removeBinding: formAction({
		fields: removeBindingForm,
		mutation: removeBindingMutation,
		variables: ({ data }) => ({ input: { bindingID: data.bindingId } }),
		message: 'Failed to remove binding',
		succeeded: (result) => result.removeWorkloadFromServiceAccount.bindingDeleted === true
	})
};
