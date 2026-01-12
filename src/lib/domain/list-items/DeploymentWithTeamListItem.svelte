<script lang="ts">
	import type { DeploymentStatusState, ValueOf } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import DeploymentStatus from '$lib/ui/DeploymentStatus.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { isValidSha } from '$lib/utils/isValidSha';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';

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
	<div class="grid">
		<IconLabel
			label={deployment.teamSlug}
			icon={PersonGroupIcon}
			size="large"
			as="h3"
			href="/team/{deployment.teamSlug}/deploy"
		/>
		<BodyLong size="small" as="div">
			{#if deployment.commitSha && isValidSha(deployment.commitSha) && deployment.deployerUsername}
				Commit
				<ExternalLink
					href="https://github.com/{deployment.repository}/commit/{deployment.commitSha}"
					><span style="font-family: monospace; font-size: var(--ax-font-size-small)"
						>{deployment?.commitSha.slice(0, 7)}</span
					>
				</ExternalLink>
				by {deployment.deployerUsername}
				{#if deployment.triggerUrl}
					· <Time time={deployment.createdAt} dateFormat="dd/MM/yyyy HH:mm" /> ·
					<ExternalLink href={deployment.triggerUrl}>GitHub action</ExternalLink>
					to deploy to
					<Tag size="small" variant={envTagVariant(deployment.environmentName)}>
						{deployment.environmentName}
					</Tag>:
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
				<Time time={deployment.createdAt} dateFormat="dd/MM/yyyy HH:mm" /> · Deploy to
				<Tag size="small" variant={envTagVariant(deployment.environmentName)}>
					{deployment.environmentName}
				</Tag>:
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
		margin: 0.25rem 0.5rem;
		line-height: 1.4;
	}

	.status {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-4);
		font-size: 16px;
	}

	.grid {
		display: grid;
		grid-template-columns: 50ch auto;
		align-items: start;
		gap: var(--ax-space-12);
	}
</style>
