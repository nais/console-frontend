import { graphql } from '$houdini';
import { serviceAccountForm } from '$lib/forms/serviceaccounts.js';
import { formAction } from '$lib/server/form.js';

const mutation = graphql(`
	mutation CreateServiceAccount($input: CreateServiceAccountInput!) {
		createServiceAccount(input: $input) {
			serviceAccount {
				id
				name
			}
		}
	}
`);

export const actions = {
	default: formAction({
		fields: serviceAccountForm,
		mutation,
		variables: ({ data, params }) => ({ input: { ...data, teamSlug: params.team } }),
		message: 'Failed to create service account',
		succeeded: (result) => !!result.createServiceAccount.serviceAccount,
		redirectTo: ({ result, params }) =>
			`/team/${params.team}/settings/service_accounts/${result.createServiceAccount.serviceAccount!.id}`
	})
};
