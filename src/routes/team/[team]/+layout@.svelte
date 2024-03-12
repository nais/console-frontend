<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="breadcrumbs">
	<div class="page">
		<a href="">{$page.params.team}</a>
	</div>
</div>

<div class="page">
	<slot />
</div>

<style>
	.page {
		margin-top: 1rem;
	}

	.breadcrumbs {
		background: var(--active-color);
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--active-color-strong);
	}

	.breadcrumbs .page {
		margin: 0 auto;
	}
</style>
