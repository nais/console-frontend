import { defineEnvVars } from '@sveltejs/kit/env';

// Env vars are not available at Docker build time; accept missing values and default to ''
const optional = {
	'~standard': {
		version: 1 as const,
		vendor: '' as const,
		types: {} as { input: string | undefined; output: string },
		validate: (value: unknown) => ({ value: typeof value === 'string' ? value : '' })
	}
};

export const variables = defineEnvVars({
	GRAPHQL_ENDPOINT: { schema: optional },
	TENANT_NAME: { schema: optional },
	GITHUB_ORGANIZATION: { schema: optional },
	SLACK_API_TOKEN: { schema: optional },
	SLACK_FEEDBACK_CHANNEL_ID: { schema: optional },
	TRACKING_ENABLED: { schema: optional },
	TRACKING_WEBSITE_ID: { schema: optional },
	TRACKING_DEV: { schema: optional }
});
