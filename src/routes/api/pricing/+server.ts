import type { GaxiosResponse } from 'gaxios';
import { cloudbilling_v1, google } from 'googleapis';

// Define a simple in-memory cache
// Cache duration is until the next restart
const pricingCache = new Map<string, { timestamp: number; skus: cloudbilling_v1.Schema$Sku[] }>();

async function getPricingForRegion(currency: string) {
	const cached = pricingCache.get(currency);
	if (cached) {
		return cached.skus;
	}

	// Otherwise, fetch from Google
	const auth = await google.auth.getClient({
		scopes: ['https://www.googleapis.com/auth/cloud-platform']
	});

	const billing = google.cloudbilling({ version: 'v1', auth });

	const allSkus: cloudbilling_v1.Schema$Sku[] = [];
	let nextPageToken: string | null | undefined = undefined;

	do {
		const res: GaxiosResponse<cloudbilling_v1.Schema$ListSkusResponse> =
			await billing.services.skus.list({
				parent: 'services/6F81-5844-456A',
				currencyCode: currency,
				pageSize: 500,
				pageToken: nextPageToken
			});

		if (res.data.skus?.length) {
			allSkus.push(...res.data.skus);
		}

		nextPageToken = res.data.nextPageToken;
	} while (nextPageToken);

	const filteredSkus = allSkus.filter(
		(sku) =>
			sku.description === 'E2 Instance Core running in Finland' ||
			sku.description === 'E2 Instance Ram running in Finland'
	);

	// Save result in cache
	pricingCache.set(currency, { timestamp: 0, skus: filteredSkus });

	return filteredSkus;
}

export async function POST(event) {
	interface PricingRequestBody {
		currency: string;
	}

	const body: PricingRequestBody = await event.request.json();
	const { currency } = body;

	if (!currency) {
		return new Response('currency is required', { status: 400 });
	}

	try {
		const pricing = await getPricingForRegion(currency);
		return new Response(JSON.stringify(pricing), { status: 200 });
	} catch (error) {
		console.error('Error fetching pricing:', error);
		return new Response('Error fetching pricing', { status: 500 });
	}
}
