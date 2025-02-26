import { json } from '@sveltejs/kit';

const GRAPHQL_API_URL = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';

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
		console.log(error);
		return false;
	}
}

let isAppReady = false;

async function ready() {
	isAppReady = await checkGraphQLAPI();
	setTimeout(ready, 1000);
}

ready();

export async function GET() {
	return json(
		{ status: isAppReady ? 'ready' : 'waiting-for-api' },
		{ status: isAppReady ? 200 : 503 }
	);
}
