<script>
	import { appSpec } from '$lib/mock/appSpec';
</script>

<div>
	{#if appSpec.azure} <a href="/">Azure</a>{/if}
	{#if appSpec.maskinporten.enabled} <a href="/">Maskinporten</a>{/if}
	{#if appSpec.idporten.enabled} <a href="/">ID-Porten</a>{/if}
</div>
