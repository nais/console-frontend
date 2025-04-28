import type { GaxiosResponse } from 'gaxios';
import { cloudbilling_v1beta, google } from 'googleapis';

interface PricingRequestBody {
	currency: string;
	skuIds: string[]; // Accepting an array of SKU IDs
}

export interface SkuPricing {
	type: 'CPU' | 'MEM';
	price: number;
	currency: string;
	skuId: string;
}

interface SkuPriceData {
	rate?: {
		tiers?: Array<{
			listPrice?: {
				nanos: number;
				currencyCode: string;
			};
		}>;
	};
}

const skus_to_fetch: { [skuId: string]: { description: string; type: 'CPU' | 'MEM' } } = {
	'0981-D144-B18E': { description: 'E2 Instance Core running in Finland', type: 'CPU' },
	'779E-BED5-F31F': { description: 'E2 Instance Ram running in Finland', type: 'MEM' }
};

// Cache to store the pricing data, with proper types
const pricingCache: Map<string, { data: SkuPriceData }> = new Map();

function convertPriceToNumber(nanos: number): number {
	return nanos / 1e9;
}

// Map Google Cloud API response to the custom SkuPriceData format
function mapApiResponseToSkuPriceData(
	apiResponse: cloudbilling_v1beta.Schema$GoogleCloudBillingPricesV1betaPrice
): SkuPriceData {
	return {
		rate: {
			tiers: apiResponse.rate?.tiers?.map((tier) => ({
				listPrice: tier.listPrice
					? {
							nanos: tier.listPrice.nanos ?? 0, // Default to 0 if undefined or null
							currencyCode: tier.listPrice.currencyCode || ''
						}
					: undefined
			}))
		}
	};
}

async function getPricingForSku(skuId: string, currency: string): Promise<SkuPriceData> {
	const cacheKey = `${skuId}-${currency}`;
	const cachedData = pricingCache.get(cacheKey);

	// Check if cached data exists
	if (cachedData) {
		return cachedData.data; // Return cached data
	}

	const auth = await google.auth.getClient({
		scopes: ['https://www.googleapis.com/auth/cloud-platform']
	});
	const billing = google.cloudbilling({ version: 'v1beta', auth });
	const res: GaxiosResponse<cloudbilling_v1beta.Schema$GoogleCloudBillingPricesV1betaPrice> =
		await billing.skus.price.get({
			name: `skus/${skuId}/price`,
			currencyCode: currency
		});

	if (res.status !== 200) {
		throw new Error(`Failed to fetch pricing for SKU ${skuId}: ${res.statusText}`);
	}
	if (!res.data) {
		throw new Error(`No data found for SKU ${skuId}`);
	}

	// Map the API response to the custom format and cache it
	const skuPriceData = mapApiResponseToSkuPriceData(res.data);
	pricingCache.set(cacheKey, { data: skuPriceData });

	return skuPriceData;
}

async function getPricingForSkus(skuIds: string[], currency: string): Promise<SkuPricing[]> {
	const pricingData: SkuPricing[] = [];

	for (const skuId of skuIds) {
		try {
			const pricing = await getPricingForSku(skuId, currency);
			const type = skus_to_fetch[skuId]?.type || 'CPU'; // Default to 'CPU' if no match
			const price = convertPriceToNumber(pricing.rate?.tiers?.at(0)?.listPrice?.nanos || 0);
			const skuCurrency = pricing.rate?.tiers?.at(0)?.listPrice?.currencyCode || '';

			if (price > 0) {
				pricingData.push({
					type,
					price,
					currency: skuCurrency,
					skuId
				});
			} else {
				console.warn(`No valid price found for SKU ${skuId}`);
			}
		} catch (error) {
			console.error(`Error fetching pricing for SKU ${skuId}:`, error);
		}
	}

	return pricingData;
}

export async function POST(event) {
	const body: PricingRequestBody = await event.request.json();
	const { currency, skuIds } = body;

	if (!currency) {
		return new Response('Currency is required', { status: 400 });
	}

	if (!skuIds || skuIds.length === 0) {
		return new Response('SKU IDs are required and cannot be empty', { status: 400 });
	}

	try {
		const pricing = await getPricingForSkus(skuIds, currency);
		return new Response(JSON.stringify(pricing), { status: 200 });
	} catch (error) {
		console.error('Error fetching pricing:', error);
		return new Response('Error fetching pricing', { status: 500 });
	}
}
