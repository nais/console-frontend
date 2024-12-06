<script lang="ts">
	export let cost: number;
	export let currency: string = 'EUR';

	let maximumFractionDigits = 0;
	if (cost < 100) {
		maximumFractionDigits = 2;
	}
</script>

<span class="cost"
	>{cost.toLocaleString('en-GB', {
		style: 'currency',
		currency: currency,
		maximumFractionDigits: maximumFractionDigits
	})}</span
>
