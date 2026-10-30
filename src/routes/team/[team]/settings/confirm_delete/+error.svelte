<script>
	import { page } from '$app/state';
	import { BodyShort, Heading } from '#lib/shadcn/ui/index.js';
</script>

<div>
	<Heading size="large">{page.status}</Heading>
	<BodyShort>
		{page.error?.message || 'Unknown error'}
	</BodyShort>
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 20vh;
	}
</style>
