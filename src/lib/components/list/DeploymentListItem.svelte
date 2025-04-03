<script lang="ts">
	import type { DeploymentStatusState, ValueOf } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { isValidSha } from '$lib/utils/isValidSha';
	import { BodyShort } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import ListItem from './ListItem.svelte';

	const {
		deployment
	}: {
		deployment: {
			id: string;
			statuses: {
				nodes: {
					state: ValueOf<typeof DeploymentStatusState>;
					message: string;
					createdAt: Date;
				}[];
			};
			resources: {
				nodes: {
					id: string;
					kind: string;
					name: string;
				}[];
			};
			environmentName: string;
			createdAt: Date;
			teamSlug: string;
			repository: string | null;
			commitSha: string | null;
			deployerUsername: string | null;
			triggerUrl: string | null;
		};
	} = $props();
</script>

<ListItem>
	<div>
		<BodyShort size="small">
			{#if deployment.commitSha && isValidSha(deployment.commitSha) && deployment.deployerUsername}
				Commit <span style="font-family: monospace; font-size: var(--a-font-size-small)">
					<a href="https://github.com/{deployment.repository}/commit/{deployment.commitSha}"
						>{deployment?.commitSha.slice(0, 7)} <ExternalLinkIcon /></a
					>
				</span>
				by {deployment.deployerUsername} triggered a
				{#if deployment.triggerUrl}
					<a href={deployment.triggerUrl}>Github action <ExternalLinkIcon /></a>
					<Time time={deployment.createdAt} distance={true} /> to deploy:
				{/if}

				{#if deployment.resources.nodes.length > 0}
					<ul>
						{#each deployment.resources.nodes as r (r.id)}
							<li>
								{#if r.kind === 'Application'}
									<a href="/team/{deployment.teamSlug}/{deployment.environmentName}/app/{r.name}">
										<strong>{r.name}</strong>
									</a>
								{:else if r.kind === 'Naisjob'}
									<a href="/team/{deployment.teamSlug}/{deployment.environmentName}/job/{r.name}">
										<strong>{r.name}</strong>
									</a>
								{:else}
									<strong>{r.name}</strong>
								{/if}
								(<code>{r.kind}</code>)
							</li>
						{/each}
					</ul>
				{/if}
			{:else}
				Something triggered a deploy <Time time={deployment.createdAt} distance={true} /> of:
				{#if deployment.resources.nodes.length > 0}
					<ul>
						{#each deployment.resources.nodes as r (r.id)}
							<li>
								{#if r.kind === 'Application'}
									<a href="/team/{deployment.teamSlug}/{deployment.environmentName}/app/{r.name}">
										<strong>{r.name}</strong>
									</a>
								{:else if r.kind === 'Naisjob'}
									<a href="/team/{deployment.teamSlug}/{deployment.environmentName}/job/{r.name}">
										<strong>{r.name}</strong>
									</a>
								{:else}
									<strong>{r.name}</strong>
								{/if}
								(<code>{r.kind}</code>)
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</BodyShort>
	</div>
	<div class="status">
		{#if deployment.statuses.nodes.length === 0}
			<DeploymentStatus status="UNKNOWN" />
		{:else}<DeploymentStatus status={deployment.statuses.nodes[0].state} />{/if}
	</div>
</ListItem>

<style>
	code {
		font-size: 14px;
	}

	ul {
		margin: 0.5rem;
	}

	.status {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--a-spacing-1);
		font-size: 16px;
	}
</style>
