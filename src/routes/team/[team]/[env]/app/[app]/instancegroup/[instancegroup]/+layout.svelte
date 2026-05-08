<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { InstanceGroupDetail$result } from '$houdini';
	import { Select } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';

	type InstanceGroup =
		InstanceGroupDetail$result['team']['environment']['application']['instanceGroups'][number];

	let { children, data }: LayoutProps = $props();
	let { InstanceGroupDetail } = $derived(data);

	const allGroups = $derived(
		$InstanceGroupDetail.data?.team.environment.application.instanceGroups ?? []
	);

	const incoming = $derived.by(() => {
		if (allGroups.length <= 1) return null;
		return allGroups.reduce((newest: InstanceGroup, g: InstanceGroup) =>
			new Date(g.created) > new Date(newest.created) ? g : newest
		);
	});

	function groupLabel(group: InstanceGroup) {
		const role = incoming && group.id === incoming.id ? 'Incoming' : 'Current';
		return allGroups.length > 1 ? `${group.image.tag} (${role})` : group.image.tag;
	}

	let selectedGroup = $derived(page.params.instancegroup);

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const name = target.value;
		if (name && name !== page.params.instancegroup) {
			goto(
				`/team/${page.params.team}/${page.params.env}/app/${page.params.app}/instancegroup/${name}`
			);
		}
	}
</script>

{#if allGroups.length > 1}
	<div class="group-selector">
		<Select label="Instance group" size="small" value={selectedGroup} onchange={handleChange}>
			{#each allGroups as group (group.id)}
				<option value={group.name}>{groupLabel(group)}</option>
			{/each}
		</Select>
	</div>
{/if}

{@render children()}

<style>
	.group-selector {
		max-width: 20rem;
		margin-bottom: var(--ax-space-16);
	}
</style>
