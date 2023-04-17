<script lang="ts">
	import { appSpec } from '$lib/mock/appSpec';
</script>

<div class="accessories">
	<div class="accessoriesContent">
		<h5>KafkaTopics</h5>
		<a href="/">{appSpec.kafka.pool}</a>
	</div>
	<div class="accessoriesContent">
		<h5>Buckets</h5>
		{#each appSpec.gcp.buckets as bucket}
			<a href="/">{bucket.name}</a>
		{/each}
	</div>
	<div class="accessoriesContent">
		<h5>BigQuery</h5>
		{#each appSpec.gcp.bigQueryDatasets as bq}
			<a href="/">{bq.name}</a>
		{/each}
	</div>
	<div class="accessoriesContent">
		<h5>Database</h5>
		{#each appSpec.gcp.sqlInstances as db}
			<a href="/">{db.name}</a>
		{/each}
	</div>
	<div class="accessoriesContent">
		<h5>Opensearch</h5>
		<a href="/">{appSpec.openSearch.instance}</a>
	</div>
</div>

<style>
	.accessories {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 2rem;
	}
	.accessoriesContent {
		display: flex;
		flex-direction: column;
	}
	.accessoriesContent,
	h5 {
		margin-top: 0px;
		align-self: start;
	}
</style>
