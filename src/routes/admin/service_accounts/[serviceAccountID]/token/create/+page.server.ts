import { graphql } from '$houdini';
import { resolveExpiry } from '$lib/domain/service-accounts/tokenExpiry';
import { serviceAccountTokenForm } from '$lib/forms/service-account-token';
import { formAction } from '$lib/server/form';

const createTokenMutation = graphql(`
	mutation AdminCreateServiceAccountToken($input: CreateServiceAccountTokenInput!) {
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
	default: formAction({
		fields: serviceAccountTokenForm,
		mutation: createTokenMutation,
		variables: ({ data, params }) => {
			// Resolved server-side so the expiry does not depend on the client's clock.
			const { date } = resolveExpiry(data.expiresIn, data.expiresAt);

			return {
				input: {
					serviceAccountID: params.serviceAccountID,
					name: data.name,
					description: data.description,
					...(date ? { expiresAt: date } : {})
				}
			};
		},
		message: 'Failed to create token',
		succeeded: (result) => !!result.createServiceAccountToken,
		// The secret is shown once, on this page, so there is nowhere to redirect to.
		onSuccess: ({ result }) => ({ secret: result.createServiceAccountToken.secret ?? null })
	})
};
