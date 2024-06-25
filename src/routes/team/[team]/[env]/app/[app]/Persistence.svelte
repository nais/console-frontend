<script lang="ts">
	import { page } from '$app/stores';
	import type { App$result, PendingValue } from '$houdini';
	import BigQuery from '$lib/icons/BigQuery.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { BucketIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';

	export let persistence: App$result['app']['persistence'];

	$: env = $page.params.env;
	$: team = $page.params.team;

	const kafkaTopicAccess = (acls: { readonly access: string }[]) => {
		let access = 'read';
		if (acls && acls.length > 0) {
			acls.forEach((acl) => {
				if (acl.access === 'readwrite') {
					return 'readwrite';
				}
				if (acl.access === 'write') {
					access = 'write';
				}
			});
		}
		return access;
	};

	const toTypedData = (data: App$result['app']['persistence'][0][]) => {
		const hack = data as Exclude<
			App$result['app']['persistence'][0],
			{ readonly name: typeof PendingValue }
		>[];
		return Object.groupBy(hack, (p) => p.__typename as string);
	};
</script>

<div class="persistence">
	{#each Object.entries(toTypedData(persistence)) as [key, value]}
		<div class="persistenceContent">
			{#if key === 'Bucket'}
				<h5><BucketIcon />{key}</h5>
				<ul>
					{#each value || [] as item}
						<li>
							<a href={`/team/${team}/${env}/bucket/${item.name}`}>{item.name}</a>
						</li>
					{/each}
				</ul>
			{:else if key === 'BigQueryDataset'}
				<h5><BigQuery />{key}</h5>
				<ul>
					{#each value || [] as item}
						<li>
							<a href={`/team/${team}/${env}/bigquery/${item.name}`}>{item.name}</a>
						</li>
					{/each}
				</ul>
			{:else if key === 'SqlInstance'}
				<h5><DatabaseIcon />Postgres</h5>
				<ul>
					{#each value || [] as item}
						<li>
							<a href={`/team/${team}/${env}/postgres/${item.name}`}>{item.name}</a>
						</li>
					{/each}
				</ul>
			{:else if key === 'KafkaTopic'}
				<h5><Kafka />{key}</h5>
				<ul>
					{#each value || [] as item}
						{#if item.__typename === 'KafkaTopic'}
							<li>
								<a
									href={`/team/${item.team.slug}/${item.env.name === 'prod-fss' ? 'prod-gcp' : item.env.name === 'dev-fss' ? 'dev-gcp' : item.env.name}/kafka/${item.name}`}
									>{item.name}</a
								>
								<code>({kafkaTopicAccess(item.acl.nodes)})</code>
							</li>
						{/if}
					{/each}
				</ul>
			{:else if key === 'OpenSearch'}
				<h5><Opensearch />{key}</h5>
				<ul>
					{#each value || [] as item}
						<li>
							<a href={`/team/${team}/${env}/opensearch/${item.name}`}>{item.name}</a>
						</li>
					{/each}
				</ul>
			{:else if key === 'Redis'}
				<h5><Redis />{key}</h5>
				<ul>
					{#each value || [] as item}
						<li>
							<a href={`/team/${team}/${env}/redis/${item.name}`}>{item.name}</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{:else}
		<p>No persistence</p>
	{/each}
</div>

<style>
	.persistence {
		display: block;
	}
	.persistenceContent {
		padding: 1rem 0;
	}
	h5 {
		display: flex;
		align-items: center;
		margin-top: 0px;
		align-self: start;
		gap: 0.5rem;
		font-size: 1.2rem;
	}
	ul {
		margin: 0;
		list-style: none;
	}
	code {
		font-size: 0.8rem;
	}
</style>
