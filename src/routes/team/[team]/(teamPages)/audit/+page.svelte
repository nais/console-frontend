<script lang="ts">
	import { page } from '$app/stores';
	import { AuditResourceType, PendingValue, type AuditResourceType$options } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Button, Skeleton } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ AuditEvents, viewerIsMember } = data);

	$: teamName = $page.params.team;

	const resourceLink = (
		environmentName: string,
		resourceType: AuditResourceType$options,
		resourceName: string
	) => {
		switch (resourceType) {
			/*case AuditResourceType.APP:
				return `/team/${teamName}/${env.name}/app/${resourceName}`;
			case AuditResourceType.NAISJOB:
				return `/team/${teamName}/${env.name}/job/${resourceName}`;*/
			case AuditResourceType.SECRET:
				return `/team/${teamName}/${environmentName}/secret/${resourceName}`;
			case AuditResourceType.TEAM:
				return `/team/${teamName}`;
			default:
				return null;
		}
	};
</script>

<div class="grid">
	<Card columns={12}>
		<h1>Audit</h1>
		{#if viewerIsMember}
			{#if $AuditEvents.data}
				{@const ae = $AuditEvents.data}

				{#each ae.team.auditEntries.edges as edge}
					{#if edge.node.createdAt === PendingValue}
						<div class="line">
							<BodyShort size="small" spacing>
								<Skeleton variant="rounded" />
							</BodyShort>
							<BodyShort size="small">
								<Skeleton variant="rounded" />
							</BodyShort>
						</div>
					{:else}
						<div class="line">
							<BodyShort size="small" spacing>
								{#if edge.node.__typename === 'TeamEnvironmentUpdatedAuditEntry'}
									{edge.node.message}
									{#if edge.node.teamEnvironmentUpdated.updatedFields.length > 0}
										{#each edge.node.teamEnvironmentUpdated.updatedFields as field}
											{field.field}. Changed from {field.oldValue} to {field.newValue}.
										{/each}
									{/if}
								{:else if edge.node.__typename === 'TeamMemberAddedAuditEntry'}
									{edge.node.message}
									{#if edge.node.teamMemberAdded}
										{edge.node.teamMemberAdded.user?.name} ({edge.node.teamMemberAdded.user?.email})
										was added as {edge.node.teamMemberAdded.role}.
									{/if}
								{:else if edge.node.__typename === 'TeamMemberRemovedAuditEntry'}
									{edge.node.message}
									{#if edge.node.teamMemberRemoved}
										{edge.node.teamMemberRemoved.user?.name} ({edge.node.teamMemberRemoved.user
											?.email}) was removed.
									{/if}
								{:else if edge.node.__typename === 'TeamMemberSetRoleAuditEntry'}
									{edge.node.message}
									{#if edge.node.teamMemberSetRole}
										{edge.node.teamMemberSetRole.user?.name} ({edge.node.teamMemberSetRole.user
											?.email}) was set to {edge.node.teamMemberSetRole.role}.
									{/if}
								{:else if edge.node.__typename === 'TeamUpdatedAuditEntry'}
									{edge.node.message}
									{#if edge.node.teamUpdated?.updatedFields.length}
										{#each edge.node.teamUpdated?.updatedFields as field}
											{field.field}. Changed from {field.oldValue} to {field.newValue}.
										{/each}
									{/if}
								{:else}
									{edge.node.message}
									{@const link = resourceLink(
										edge.node.environmentName ? edge.node.environmentName : '',
										edge.node.resourceType,
										edge.node.resourceName
									)}
									{#if link}
										<a href={link}>{edge.node.resourceName}</a>
									{/if}
								{/if}
								{#if edge.node.environmentName}
									in {edge.node.environmentName}
								{/if}

								{#if edge.node.environmentName}
									in {edge.node.environmentName}
								{/if}
							</BodyShort>
							<BodyShort size="small" style="color: var(--a-text-subtle)">
								{edge.node.actor}
							</BodyShort>
							<BodyShort
								size="small"
								style="color: var(--a-text-subtle); position: absolute; top: 0; right: 0"
							>
								<Time time={edge.node.createdAt} distance={true} />
							</BodyShort>
						</div>
					{/if}
				{:else}
					<p>No events</p>
				{/each}
				{#if ae.team.auditEntries.pageInfo !== PendingValue && (ae.team.auditEntries.pageInfo.hasPreviousPage || ae.team.auditEntries.pageInfo.hasNextPage)}
					<div class="pagination">
						<span>
							{#if ae.team.auditEntries.pageInfo.pageStart !== ae.team.auditEntries.pageInfo.pageEnd}
								{ae.team.auditEntries.pageInfo.pageStart} - {ae.team.auditEntries.pageInfo.pageEnd}
							{:else}
								{ae.team.auditEntries.pageInfo.pageStart}
							{/if}

							of {ae.team.auditEntries.pageInfo.totalCount}
						</span>

						<span style="padding-left: 1rem;">
							<Button
								size="small"
								variant="secondary"
								disabled={!ae.team.auditEntries.pageInfo.hasPreviousPage}
								on:click={async () => {
									return await AuditEvents.loadPreviousPage();
								}}><ChevronLeftIcon /></Button
							>
							<Button
								size="small"
								variant="secondary"
								disabled={!ae.team.auditEntries.pageInfo.hasNextPage}
								on:click={async () => {
									return await AuditEvents.loadNextPage();
								}}
							>
								<ChevronRightIcon /></Button
							>
						</span>
					</div>
				{/if}
			{/if}
		{/if}
	</Card>
</div>

<style>
	.line {
		position: relative;
	}

	.line:is(:not(:last-child)) {
		border-bottom: 1px solid var(--a-border-divider);
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
