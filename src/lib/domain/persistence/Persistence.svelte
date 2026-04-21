<script lang="ts">
	import { PersistenceFragment } from '$lib/domain/persistence/persistence';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import { useFragment, type FragmentType } from '$lib/urql/fragment';
	import { Heading } from '@nais/ds-svelte-community';

	interface Props {
		workload: FragmentType<typeof PersistenceFragment>;
	}

	let { workload }: Props = $props();

	const data = $derived(useFragment(PersistenceFragment, workload));

	const toIconLabel =
		(urlName: string) => (persistence: { node: { id: string; name: string } }) => ({
			id: persistence.node.id,
			label: persistence.node.name,
			href: `/team/${data.team.slug}/${data.teamEnvironment.environment.name}/${urlName}/${persistence.node.name}`,
			icon: urlName
		});

	const persistence = $derived({
		buckets: data.buckets.edges.map(toIconLabel('bucket')),
		bigQuery: data.bigQueryDatasets.edges.map(toIconLabel('bigquery')),
		cloudSql: data.sqlInstances.edges.map(toIconLabel('cloudsql')),
		postgres: data.postgresInstances.edges.map(toIconLabel('postgres')),
		kafka: data.kafkaTopicAcls.edges
			.filter((acl) => acl.node.teamName !== '*')
			.map((e) => e.node)
			.map((acl) => ({
				id: `${acl.topic.team.slug}/${acl.topic.teamEnvironment.environment.name}/${acl.topic.name}/${acl.workloadName}/${acl.access}`,
				label: acl.topic.name,
				href: `/team/${acl.topic.team.slug}/${acl.topic.teamEnvironment.environment.name}/kafka/${acl.topic.name}`,
				icon: 'kafka',
				description: acl.access
			})),
		openSearch: (data.openSearch ? [data.openSearch] : []).map((os) => ({
			id: os.id,
			label: os.name,
			href: `/team/${data.team.slug}/${data.teamEnvironment.environment.name}/opensearch/${os.name}`,
			icon: 'opensearch',
			description: os.access.edges.find((access) => access.node.workload.name == data.name)?.node
				.access
		})),
		valkey: data.valkeys.edges.map(toIconLabel('valkey'))
	});
</script>

{#if Object.values(persistence).some((p) => p.length)}
	<Heading as="h2" size="medium" spacing>Persistence</Heading>

	<div class="content">
		{#each Object.entries(persistence) as [type, list] (type)}
			{#each list as persistence (persistence.id)}
				<IconLabel {...persistence} />
			{/each}
		{/each}
	</div>
{/if}

<style>
	.content {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--ax-space-4);

		:global(.icon-label.icon-label--with-desc) {
			font-size: 1.25rem;
		}
	}
</style>
