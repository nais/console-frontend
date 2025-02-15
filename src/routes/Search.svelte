<script lang="ts">
	import { goto } from '$app/navigation';
	import { graphql } from '$houdini';
	import { logEvent } from '$lib/amplitude';
	import SearchResults from '$lib/SearchResults.svelte';
	import { Search } from '@nais/ds-svelte-community';
	import { InformationSquareIcon } from '@nais/ds-svelte-community/icons';

	const store = graphql(`
		query SearchQuery($query: String!, $type: SearchType) {
			search(first: 20, filter: { query: $query, type: $type }) {
				nodes {
					__typename
					... on Application {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on Team {
						slug
					}
					... on Job {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on SqlInstance {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on RedisInstance {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on ValkeyInstance {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on OpenSearch {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on BigQueryDataset {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on Bucket {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
					... on KafkaTopic {
						name
						team {
							slug
						}
						environment {
							name
						}
					}
				}
			}
		}
	`);

	let query = $state('');
	let showSearch = $state(false);
	let showHelpText = $state(false);
	let selected = $state(-1);
	let unsupportedFilter = $state(false);
	let timeout: ReturnType<typeof setTimeout> | null = $state(null);

	function search() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		if (query.length > 0) {
			showSearch = true;
			timeout = setTimeout(() => {
				if (query.startsWith('app:')) {
					store.fetch({
						variables: { query: query.slice(4).trim(), type: 'APPLICATION' }
					});
					unsupportedFilter = false;
				} else if (query.startsWith('team:')) {
					store.fetch({ variables: { query: query.slice(5).trim(), type: 'TEAM' } });
					unsupportedFilter = false;
				} else if (query.startsWith('job:')) {
					store.fetch({ variables: { query: query.slice(4).trim(), type: 'JOB' } });
					unsupportedFilter = false;
				} else if (query.startsWith('sql:')) {
					store.fetch({
						variables: { query: query.slice(4).trim(), type: 'SQL_INSTANCE' }
					});
					unsupportedFilter = false;
				} else if (query.startsWith('redis:')) {
					store.fetch({
						variables: { query: query.slice(6).trim(), type: 'REDIS_INSTANCE' }
					});
					unsupportedFilter = false;
				} else if (query.startsWith('valkey:')) {
					store.fetch({
						variables: { query: query.slice(7).trim(), type: 'VALKEY_INSTANCE' }
					});
					unsupportedFilter = false;
				} else if (query.startsWith('bq:')) {
					store.fetch({
						variables: { query: query.slice(3).trim(), type: 'BIGQUERY_DATASET' }
					});
					unsupportedFilter = false;
				} else if (query.startsWith('bucket:')) {
					store.fetch({ variables: { query: query.slice(7).trim(), type: 'BUCKET' } });
					unsupportedFilter = false;
				} else if (query.startsWith('kafka:')) {
					store.fetch({
						variables: { query: query.slice(6).trim(), type: 'KAFKA_TOPIC' }
					});
					unsupportedFilter = false;
				} else if (query.startsWith('os:')) {
					store.fetch({ variables: { query: query.slice(3).trim(), type: 'OPENSEARCH' } });
					unsupportedFilter = false;
				} else if (query.lastIndexOf(':') >= 0) {
					unsupportedFilter = true;
				} else {
					store.fetch({ variables: { query, type: null } });
					unsupportedFilter = false;
				}
				logEvent('search');
			}, 500);
		}
	}

	function on_key_up(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				selected += 1;
				selected = Math.min(($store.data?.search.nodes.length || 0) - 1, Math.max(-1, selected));
				event.preventDefault();
				break;
			case 'ArrowUp':
				selected -= 1;
				selected = Math.min(($store.data?.search.nodes.length || 0) - 1, Math.max(-1, selected));
				event.preventDefault();
				break;
			case 'Enter':
				showHelpText = false;
				if (selected >= 0) {
					const node = $store.data?.search.nodes[selected];
					if (!node) return;
					query = '';
					selected = -1;
					if (node.__typename === 'Application') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/app/${node.name}`);
					} else if (node.__typename === 'Team') {
						query = '';
						showSearch = false;
						goto(`/team/${node.slug}`);
					} else if (node.__typename === 'Job') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/job/${node.name}`);
					} else if (node.__typename === 'SqlInstance') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/postgres/${node.name}`);
					} else if (node.__typename === 'RedisInstance') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/redis/${node.name}`);
					} else if (node.__typename === 'ValkeyInstance') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/valkey/${node.name}`);
					} else if (node.__typename === 'OpenSearch') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/opensearch/${node.name}`);
					} else if (node.__typename === 'KafkaTopic') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/kafka/${node.name}`);
					} else if (node.__typename === 'BigQueryDataset') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/bigquery/${node.name}`);
					} else if (node.__typename === 'Bucket') {
						query = '';
						showSearch = false;
						goto(`/team/${node.team.slug}/${node.environment.name}/bucket/${node.name}`);
					}
				}
				break;
			case 'Escape':
				showHelpText = false;
				showSearch = false;
				query = '';
				break;
		}
	}
</script>

<div class="search">
	<Search
		placeholder="Search for apps, jobs, teams and more"
		bind:value={query}
		label="search"
		variant="simple"
		size="small"
		onblur={() => {
			setTimeout(() => {
				showSearch = false;
				showHelpText = false;
			}, 200);
		}}
		onclear={() => {
			query = '';
			showSearch = false;
			showHelpText = false;
		}}
		onfocus={() => {
			if (query.length > 0) {
				showSearch = true;
			} else {
				showHelpText = true;
			}
		}}
		onkeyup={on_key_up}
		oninput={search}
		autocomplete="off"
	/>
	{#if $store.data && showSearch && !unsupportedFilter}
		<SearchResults {showSearch} data={$store.data} bind:query {selected} />
	{:else if showHelpText || unsupportedFilter}
		<ul class="helpText">
			<li>
				<div class="typeIcon">
					<InformationSquareIcon height="1.5rem" />
				</div>
				<div>
					You can filter your searches with prefixes. Try one of the following:<br />
					<code>app:myApp</code><br />
					<code>job:myJob</code><br />
					<code>team:myTeam</code><br />
					<code>sql:mySqlinstance</code>
					<code>redis:myRedisinstance</code>
					<code>os:myOpenSearchInstance</code>
					<code>kafka:myKafkaTopic</code>
					<code>bq:myBigQueryDataSet</code>
					<code>bucket:myBucket</code>
				</div>
			</li>
		</ul>
	{/if}
</div>

<style>
	.search {
		position: relative;
		width: 320px;
		color: black;
	}

	.helpText {
		z-index: 1000;
		position: absolute;
		display: flex;
		flex-direction: column;
		top: 100%;
		white-space: inherit;
		left: 0;
		background-color: var(--a-surface-default);
		outline: 1px solid black;
		border-top: none;
		border-radius: 0 0 0.25rem 0.25rem;
		padding: 0.5rem 0;
		margin: 0;
		color: var(--a-text-default);
		overflow: auto;
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
		min-height: 300px;
		width: 350px;

		> li {
			height: 3rem;
			background-color: var(--a-surface-default);
			color: var(--a-text-default);
		}
	}

	.typeIcon {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 3rem;
		color: var(--a-text-subtle);
	}
</style>
