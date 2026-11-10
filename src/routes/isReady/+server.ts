import { logger } from '#lib/logger.js';
import { GRAPHQL_ENDPOINT } from '$app/env/private';

const GRAPHQL_API_URL = GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';

async function checkGraphQLAPI() {
	try {
		const response = await fetch(GRAPHQL_API_URL, {
			method: 'POST',
			signal: AbortSignal.timeout(2000),
			redirect: 'error'
		});

		await response.body?.cancel();
		return response.ok || response.status === 401;
	} catch (error) {
		logger.error({ error, url: GRAPHQL_API_URL }, 'Failed to check GraphQL API');
		return false;
	}
}

export async function GET() {
	const isAppReady = await checkGraphQLAPI();
	return Response.json(
		{ status: isAppReady ? 'ready' : 'waiting-for-api' },
		{
			status: isAppReady ? 200 : 503,
			headers: { 'Cache-Control': 'no-store' }
		}
	);
}
