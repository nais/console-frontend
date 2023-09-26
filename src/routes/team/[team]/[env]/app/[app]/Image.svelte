<script lang="ts">
	import { PendingValue, fragment, graphql, type AppImage } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import { CopyButton } from '@nais/ds-svelte-community';

	export let app: AppImage;
	$: data = fragment(
		app,
		graphql(`
			fragment AppImage on App {
				image @loading
			}
		`)
	);

	const parseImage = (image: string) => {
		const tag = image.split(':')[1];
		const name = image.split(':')[0].split('/').pop();
		const registry = image.split('/')[0];
		const repository = image.split('/').slice(1, -1).join('/');
		return { registry, repository, name, tag };
	};

	$: image = $data?.image;
</script>

<h4 class="imageHeader">
	Image {#if image !== PendingValue}
		<CopyButton
			variant="action"
			text="Copy image name"
			activeText="Image name copied"
			copyText={image}
		/>
	{/if}
</h4>
{#if image === PendingValue}
	<Loading />
{:else}
	{@const { registry, repository, name, tag } = parseImage(image)}
	<div class="imageGrid">
		<div class="registry">
			<h5>Registry</h5>
			<code>{registry}</code>
		</div>
		<div class="repository">
			<h5>Repository</h5>
			<code>{repository}</code>
		</div>
		<div class="imageName">
			<h5>Name</h5>
			<code>{name}</code>
		</div>
		<div class="tag">
			<h5>Tag</h5>
			<code>{tag}</code>
		</div>
	</div>
{/if}

<style>
	.imageHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.imageGrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 0rem;
		row-gap: 0rem;
	}
	.registry {
		grid-column: 1;
		grid-row: 1;
	}
	.repository {
		grid-column: 2;
		grid-row: 1;
	}
	.imageName {
		grid-column: 1;
		grid-row: 2;
	}
	.tag {
		grid-column: 2;
		grid-row: 2;
	}
	code {
		font-size: 1rem;
	}
</style>
