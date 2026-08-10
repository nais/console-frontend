import { graphql } from '$houdini';
import { addBindingWithTeamForm } from '$lib/forms/serviceaccounts';
import { formAction } from '$lib/server/form';

const addBindingMutation = graphql(`
	mutation AdminAddWorkloadBinding($input: AddWorkloadToServiceAccountInput!) {
		addWorkloadToServiceAccount(input: $input) {
			binding {
				id
			}
		}
	}
`);

export const actions = {
	default: formAction({
		fields: addBindingWithTeamForm,
		mutation: addBindingMutation,
		variables: ({ data, params }) => ({
			input: {
				serviceAccountID: params.serviceAccountID,
				workloadName: data.workloadName,
				environment: data.environment,
				teamSlug: data.teamSlug
			}
		}),
		message: 'Failed to add binding',
		succeeded: (result) => !!result.addWorkloadToServiceAccount.binding
	})
};
