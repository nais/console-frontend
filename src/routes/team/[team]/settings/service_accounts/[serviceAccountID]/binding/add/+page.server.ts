import { graphql } from '$houdini';
import { addBindingForm } from '$lib/forms/serviceaccounts';
import { formAction } from '$lib/server/form';

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
	default: formAction({
		fields: addBindingForm,
		mutation: addBindingMutation,
		variables: ({ data, params }) => ({
			input: {
				serviceAccountID: params.serviceAccountID,
				workloadName: data.workloadName,
				environment: data.environment,
				teamSlug: params.team
			}
		}),
		message: 'Failed to add binding',
		succeeded: (result) => !!result.addWorkloadToServiceAccount.binding
	})
};
