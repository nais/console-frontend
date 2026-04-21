import { runQuery } from '$lib/urql/load';
import { DataProductQuery } from './dataproduct';

export async function load(event) {
	return {
		DataProduct: await runQuery(event, DataProductQuery, {})
	};
}
