import { graphql } from '$houdini';
import { serviceAccountForm } from '$lib/forms/serviceaccounts.js';
import { formAction } from '$lib/server/form.js';

const mutation = graphql(`
	mutation CreateAdminServiceAccount($input: CreateServiceAccountInput!) {
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
		variables: ({ data }) => ({ input: data }),
		message: 'Failed to create service account',
		succeeded: (result) => !!result.createServiceAccount.serviceAccount,
		redirectTo: ({ result }) =>
			`/admin/service_accounts/${result.createServiceAccount.serviceAccount!.id}`
	})
};
