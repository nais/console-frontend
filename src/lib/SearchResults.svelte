<script lang="ts">
	import type { SearchQuery$result } from '$houdini';
	import {
		ArrowCirclepathIcon,
		BucketIcon,
		DatabaseIcon,
		PackageIcon,
		PersonGroupIcon
	} from '@nais/ds-svelte-community/icons';
	import BigQueryIcon from './icons/BigQueryIcon.svelte';
	import KafkaIcon from './icons/KafkaIcon.svelte';
	import OpenSearchIcon from './icons/OpenSearchIcon.svelte';
	import RedisIcon from './icons/RedisIcon.svelte';

	interface Props {
		data: SearchQuery$result;
		query: string;
		selected: number;
		showSearch: boolean;
		onSelected?: (
			node: SearchQuery$result['search']['nodes'][0],
			e: MouseEvent | KeyboardEvent
		) => void;
	}

	let {
		data,
		query = $bindable(),
		selected,
		showSearch = $bindable(),
		onSelected = () => {
			query = '';
			showSearch = false;
		}
	}: Props = $props();
</script>

<ul>
	{#if data.search.nodes.length === 0}
		<li class="nomatch">
			No results matching "{query}"
		</li>
	{/if}
	{#each data.search.nodes as node, i}
		{#if node.__typename === 'Application'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.slug}/{node.environment.name}/app/{node.name}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<PackageIcon height="1.5rem" />
						<div>App</div>
					</div>
					<div>
						<div>
							{node.name}
						</div>

						<div class="searchInfo">
							{node.environment.name} /
							{node.team.slug}
						</div>
					</div>
				</a>
			</li>
		{:else if node.__typename === 'Job'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.slug}/{node.environment.name}/job/{node.name}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<ArrowCirclepathIcon height="1.5rem" />
						<div>Job</div>
					</div>
					<div>
						<div>
							{node.name}
						</div>

						<div class="searchInfo">
							{node.environment.name} /
							{node.team.slug}
						</div>
					</div>
				</a>
			</li>
		{:else if node.__typename === 'Team'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.slug}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<PersonGroupIcon height="1.5rem" />
						<div>Team</div>
					</div>
					{node.slug}</a
				>
			</li>
		{:else if node.__typename === 'SqlInstance'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.slug}/{node.environment.name}/postgres/{node.name}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<DatabaseIcon height="1.5rem" />
						<div>SQL</div>
					</div>
					<div>
						<div>
							{node.name}
						</div>
						<div class="searchInfo">
							{node.environment.name} /
							{node.team.slug} - {node.__typename}
						</div>
					</div>
				</a>
			</li>
		{:else if node.__typename === 'Bucket'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.slug}/{node.environment.name}/bucket/{node.name}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<BucketIcon height="1.5rem" />
						<div>Bucket</div>
					</div>
					<div>
						<div>
							{node.name}
						</div>
						<div class="searchInfo">
							{node.environment.name} /
							{node.team.slug} - {node.__typename}
						</div>
					</div>
				</a>
			</li>
		{:else if node.__typename === 'OpenSearch'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.slug}/{node.environment.name}/opensearch/{node.name}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<OpenSearchIcon height="1.5rem" />
						<div></div>
					</div>
					<div>
						<div>
							{node.name}
						</div>
						<div class="searchInfo">
							{node.environment.name} /
							{node.team.slug} - {node.__typename}
						</div>
					</div>
				</a>
			</li>
		{:else if node.__typename === 'RedisInstance'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.slug}/{node.environment.name}/redis/{node.name}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<RedisIcon height="1.5rem" />
						<div>Redis</div>
					</div>
					<div>
						<div>
							{node.name}
						</div>
						<div class="searchInfo">
							{node.environment.name} /
							{node.team.slug} - {node.__typename}
						</div>
					</div>
				</a>
			</li>
		{:else if node.__typename === 'KafkaTopic'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.slug}/{node.environment.name}/kafka/{node.name}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<KafkaIcon height="1.5rem" />
						<div>Kafka</div>
					</div>
					<div>
						<div>
							{node.name}
						</div>
						<div class="searchInfo">
							{node.environment.name} /
							{node.team.slug} - {node.__typename}
						</div>
					</div>
				</a>
			</li>
		{:else if node.__typename === 'BigQueryDataset'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.slug}/{node.environment.name}/bigquery/{node.name}"
					onclick={onSelected.bind({}, node)}
				>
					<div class="typeIcon">
						<BigQueryIcon height="1.5rem" />
						<div>BQ</div>
					</div>
					<div>
						<div>
							{node.name}
						</div>
						<div class="searchInfo">
							{node.environment.name} /
							{node.team.slug} - {node.__typename}
						</div>
					</div>
				</a>
			</li>
		{/if}
	{/each}
</ul>

<style>
	.nomatch {
		padding: 1rem 1rem 0 1rem;
	}
	.searchInfo {
		font-size: 0.75rem;
		color: var(--a-text-subtle);
	}
	.typeIcon {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 30px;
		color: var(--a-text-subtle);
	}
	.typeIcon > div {
		font-size: 0.75rem;
	}
	ul {
		z-index: 1000;
		position: absolute;
		display: flex;
		flex-direction: column;
		top: 100%;
		white-space: nowrap;
		left: 0;
		background-color: var(--a-surface-default);
		outline: 1px solid black;
		border-top: none;
		border-radius: 0 0 0.25rem 0.25rem;
		padding: 0;
		margin: 0;
		color: var(--a-text-default);
		overflow: auto;
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
	}
	ul::after {
		content: '';
		display: block;
		height: 1rem;
	}

	ul li {
		height: 3.3rem;
		background-color: var(--a-surface-default);
		color: var(--a-text-default);
	}
	ul li a {
		display: flex;
		padding: 5px 0.75rem;
		background-color: var(--a-surface-default);
		color: black;
		gap: 0.75rem;
		width: 100%;
		min-width: 350px;
		text-decoration: none;
		align-items: center;
	}
	ul li a.selected {
		border: 1px dashed var(--a-blue-600);
		border-radius: 0.25rem;
		background-color: var(--a-gray-100);
	}

	ul li a:hover {
		background-color: var(--a-gray-100);
	}
	ul li a:hover .typeIcon {
		color: var(--a-gray-900);
	}
</style>
