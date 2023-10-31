<script lang="ts">
	import { PendingValue, fragment, graphql, type AppImage } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { CopyButton } from '@nais/ds-svelte-community';

	export let app: AppImage;
	$: data = fragment(
		app,
		graphql(`
			fragment AppImage on App {
				image @loading
				deployInfo @loading {
					timestamp @loading
					deployer
					url
				}
				dependencyTrack @loading {
					projectName
					findingsLink
					vulnerabilities {
						severity
						severityRank
					}
				}
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
	$: deployInfo = $data?.deployInfo;
</script>

<h4 class="imageHeader">
	Image {#if image !== PendingValue}
		<CopyButton
			size="xsmall"
			variant="action"
			text="Copy image name"
			activeText="Image name copied"
			copyText={image}
		/>
	{/if}
</h4>
{#if deployInfo?.timestamp === PendingValue}
	<Loading />
{:else if deployInfo.timestamp !== null}
	<p class="lastActivity">
		<a href={deployInfo.url}>Deployed</a>
		<Time time={deployInfo.timestamp} distance={true} />
		{#if deployInfo.deployer && deployInfo.url}
			by
			<a href="https://github.com/{deployInfo.deployer}">{deployInfo.deployer}</a>.
		{/if}
	</p>
{/if}
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
		<div class="vulnerabilities">
			<h5>Vulnerabilities</h5>
		{#if $data?.dependencyTrack === PendingValue}
			<Loading />
		{:else if $data?.dependencyTrack === null}
			<code>No data found in dependencytrack</code>
		{:else}
			{ JSON.stringify($data.dependencyTrack) }
		{/if}
		</div>
	</div>
{/if}

<style>
	.lastActivity {
		margin-top: 0px;
	}
	.imageHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
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
	.vulnerabilities {
		grid-column: 1 / span 2;
		grid-row: 3;
	}
	code {
		font-size: 1rem;
	}
</style>
