<script lang="ts">
	import type { DeploymentStatusState, ValueOf } from '$houdini';
	import DeploymentStatus from '$lib/ui/DeploymentStatus.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { isValidSha } from '$lib/utils/isValidSha';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';

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
		<BodyLong size="small" as="div">
			{#if deployment.commitSha && isValidSha(deployment.commitSha) && deployment.deployerUsername}
				Commit
				<ExternalLink
					href="https://github.com/{deployment.repository}/commit/{deployment.commitSha}"
					><span style="font-family: monospace; font-size: var(--ax-font-size-small)"
						>{deployment?.commitSha.slice(0, 7)}</span
					>
				</ExternalLink>
				by {deployment.deployerUsername} triggered a
				{#if deployment.triggerUrl}
					{#if showEnv}
						<ExternalLink href={deployment.triggerUrl}>Github action</ExternalLink>
						<Time time={deployment.createdAt} distance={true} /> to deploy to
						<Tag size="small" variant={envTagVariant(deployment.environmentName)}>
							{deployment.environmentName}
						</Tag>:
					{:else}
						<ExternalLink href={deployment.triggerUrl}>Github action</ExternalLink>
						<Time time={deployment.createdAt} distance={true} /> to deploy:
					{/if}
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
		</BodyLong>
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
		gap: var(--ax-space-4);
		font-size: 16px;
	}
</style>
