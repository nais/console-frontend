<script lang="ts">
	import { page } from '$app/state';
	import { type App$result } from '$houdini';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import {
		CloudDownIcon,
		ExclamationmarkTriangleIcon,
		GlobeIcon,
		HouseIcon,
		PadlockLockedIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		app: App$result;
	}

	let { app }: Props = $props();
</script>

<Heading level="2" size="medium" spacing>Ingresses</Heading>

<List>
	{#each Object.entries(Object.groupBy(app.team.environment.application.ingresses, ({ type }) => type)) as [group, ingresses] (group)}
		{#each ingresses as ingress (ingress)}
			<ListItem>
				<IconLabel
					size="medium"
					label={ingress.url}
					href="/team/{page.params.team}/{page.params.env}/app/{page.params
						.app}/ingresses?ingress={encodeURIComponent(ingress.url)}"
				>
					{#snippet icon()}
						{#each app.team.environment.application.issues.edges as issue (issue.node.id)}
							{#if issue.node.__typename === 'DeprecatedIngressIssue'}
								<TooltipAlignHack content="Deprecated ingress: {ingress.url}"
									><WarningIcon /></TooltipAlignHack
								>
							{/if}
						{/each}

						<TooltipAlignHack
							content={group === 'UNKNOWN'
								? 'Ingress not found'
								: `${group[0]}${group.slice(1).toLowerCase()} ingress`}
						>
							{#if group === 'EXTERNAL'}
								<GlobeIcon />
							{:else if group === 'INTERNAL'}
								<HouseIcon />
							{:else if group === 'AUTHENTICATED'}
								<PadlockLockedIcon />
							{:else}
								<WarningIcon />
							{/if}
						</TooltipAlignHack>
					{/snippet}
				</IconLabel>
				<div>
					<div>
						<TooltipAlignHack content="Requests per second">
							<IconLabel
								size="small"
								icon={CloudDownIcon}
								label="{ingress.metrics.requestsPerSecond.toFixed(2)} req/s"
							/>
						</TooltipAlignHack>
					</div>
					<div>
						<TooltipAlignHack content="Errors per second">
							<IconLabel
								size="small"
								icon={ExclamationmarkTriangleIcon}
								label="{ingress.metrics.errorsPerSecond.toFixed(2)} err/s"
							/>
						</TooltipAlignHack>
					</div>
				</div>
			</ListItem>
		{/each}
	{:else}
		<BodyShort>No ingresses configured for this app.</BodyShort>
	{/each}
</List>

<style>
</style>
