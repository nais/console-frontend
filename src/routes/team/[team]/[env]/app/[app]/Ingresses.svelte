<script lang="ts">
	import { fragment, graphql, IngressType, type Ingresses, type ValueOf } from '$houdini';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import Globe from '$lib/icons/Globe.svelte';
	import { Heading, Tooltip } from '@nais/ds-svelte-community';
	import { HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		app: Ingresses;
	}

	let { app }: Props = $props();

	let data = $derived(
		fragment(
			app,
			graphql(`
				fragment Ingresses on Application {
					__typename
					name
					environment {
						name
					}
					team {
						slug
					}

					ingresses {
						url
						type
					}
				}
			`)
		)
	);

	const externalIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.EXTERNAL);
	};

	const internalIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.INTERNAL);
	};

	const authenticatedIngresses = (
		ingresses: {
			readonly url: string;
			readonly type: ValueOf<typeof IngressType>;
		}[]
	) => {
		return ingresses.filter((ingress) => ingress.type === IngressType.AUTHENTICATED);
	};
</script>

{#if $data.ingresses.length > 0}
	<Heading level="2" size="medium" spacing>Ingresses</Heading>

	<div class="content">
		{#each externalIngresses($data.ingresses) as ingress}
			<Tooltip content="External ingress"
				><a href={ingress.url}
					><IconWithText icon={Globe} size="medium">
						{#snippet text()}
							<span class="workload-name">{ingress.url}</span>
						{/snippet}
					</IconWithText></a
				></Tooltip
			>
		{/each}

		{#each internalIngresses($data.ingresses) as ingress}
			<Tooltip content="Internal ingress"
				><a href={ingress.url}
					><IconWithText icon={HouseIcon} size="medium">
						{#snippet text()}
							<span class="workload-name">{ingress.url}</span>
						{/snippet}
					</IconWithText></a
				>
			</Tooltip>
		{/each}

		{#each authenticatedIngresses($data.ingresses) as ingress}
			<Tooltip content="Authenticated ingress">
				<a href={ingress.url}
					><IconWithText icon={PadlockLockedIcon} size="medium">
						{#snippet text()}
							<span class="workload-name">{ingress.url}</span>
						{/snippet}
					</IconWithText></a
				>
			</Tooltip>
		{/each}
	</div>
{/if}

<style>
	.content {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--a-spacing-1);
	}
</style>
