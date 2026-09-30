import { building } from '$app/env';
import { logger } from '#lib/logger.js';
import { GRAPHQL_ENDPOINT } from '$app/env/private';

const GRAPHQL_API_URL = GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';

async function checkGraphQLAPI() {
	try {
		const response = await fetch(GRAPHQL_API_URL, {
			method: 'POST'
		});

		if (response.status === 401) {
			return true;
		}

		return response.ok;
	} catch (error) {
		logger.error({ error, url: GRAPHQL_API_URL }, 'Failed to check GraphQL API');
		return false;
	}
}

let isAppReady = false;

async function ready() {
	isAppReady = await checkGraphQLAPI();
	setTimeout(ready, 3000);
}

if (!building) {
	ready();
}

export async function GET() {
	return Response.json(
		{ status: isAppReady ? 'ready' : 'waiting-for-api' },
		{ status: isAppReady ? 200 : 503 }
	);
}
