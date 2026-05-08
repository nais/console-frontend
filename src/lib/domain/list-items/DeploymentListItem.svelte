<script lang="ts">
	import type { DeploymentStatusState, ValueOf } from '$houdini';
	import DeploymentStatus from '$lib/ui/DeploymentStatus.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { isValidSha } from '$lib/utils/isValidSha';
	import { BodyShort } from '@nais/ds-svelte-community';

	const {
		deployment,
		showEnv
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
		showEnv?: boolean;
	} = $props();
</script>

<ListItem>
	<div>
		<BodyShort size="small" as="div">
			{#if deployment.commitSha && isValidSha(deployment.commitSha) && deployment.deployerUsername}
				Commit
				<ExternalLink
					href="https://github.com/{deployment.repository}/commit/{deployment.commitSha}"
					><code>{deployment?.commitSha.slice(0, 7)}</code>
				</ExternalLink>
				by {deployment.deployerUsername} triggered a
				{#if deployment.triggerUrl}
					<ExternalLink href={deployment.triggerUrl}>Github action</ExternalLink>
					<Time time={deployment.createdAt} distance={true} />
					{#if showEnv}
						to deploy to <strong>{deployment.environmentName}</strong>:
					{:else}
						to deploy:
					{/if}
				{/if}

				{#if deployment.resources.nodes.length > 0}
					<ul>
						{#each deployment.resources.nodes as r (r.id)}
							<li>
								{#if r.kind === 'Application'}
									<a href="/team/{deployment.teamSlug}/{deployment.environmentName}/app/{r.name}">
										{r.name}
									</a>
								{:else if r.kind === 'Naisjob'}
									<a href="/team/{deployment.teamSlug}/{deployment.environmentName}/job/{r.name}">
										{r.name}
									</a>
								{:else}
									{r.name}
								{/if}
								<span class="kind">({r.kind})</span>
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
										{r.name}
									</a>
								{:else if r.kind === 'Naisjob'}
									<a href="/team/{deployment.teamSlug}/{deployment.environmentName}/job/{r.name}">
										{r.name}
									</a>
								{:else}
									{r.name}
								{/if}
								<span class="kind">({r.kind})</span>
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
		font-family: monospace;
		font-size: var(--ax-font-size-small);
	}

	ul {
		margin: var(--ax-space-4) 0 0 0;
		padding-left: var(--ax-space-16);
	}

	.kind {
		color: var(--ax-text-neutral-subtle);
	}

	.status {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.status {
			align-items: flex-end;
			margin-top: var(--ax-space-6);
		}
	}
</style>
