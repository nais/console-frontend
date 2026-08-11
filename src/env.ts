import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	GRAPHQL_ENDPOINT: {},
	TENANT_NAME: {},
	GITHUB_ORGANIZATION: {},
	SLACK_API_TOKEN: {},
	SLACK_FEEDBACK_CHANNEL_ID: {}
});
