<script lang="ts">
	import type { cloudbilling_v1 } from 'googleapis';
	import { onMount } from 'svelte';

	let pricingData: cloudbilling_v1.Schema$Sku[] = [];
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const response = await fetch('/api/pricing', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					currency: 'USD'
				})
			});

			if (!response.ok) {
				throw new Error(`Server error: ${response.statusText}`);
			}

			pricingData = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	});

	function convertPriceToNumber(nanos: number): number {
		return nanos / 1e9;
	}
</script>

{#if loading}
	<p>Loading pricing data...</p>
{:else if error}
	<p style="color: red;">Error: {error}</p>
{:else}
	<h2>Pricing Data</h2>
	<ul>
		{#each pricingData as sku, i (i)}
			<strong>{sku.description}</strong><br />
			{convertPriceToNumber(
				sku.pricingInfo?.[0]?.pricingExpression?.tieredRates?.[0]?.unitPrice?.nanos ?? 0
			)}<br />
		{/each}
	</ul>
{/if}
