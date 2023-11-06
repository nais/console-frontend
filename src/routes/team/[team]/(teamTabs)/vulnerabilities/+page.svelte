<script lang="ts">
    import {page} from '$app/stores';
    import {PendingValue} from '$houdini';
    import Card from '$lib/Card.svelte';
    import {Alert, Table, TableSortState, Tbody, Td, Th, Thead, Tr} from '@nais/ds-svelte-community';
    import type {PageData} from './$houdini';
    import Loading from "$lib/Loading.svelte";
    import Pagination from "$lib/Pagination.svelte";
    import Vulnerability from "$lib/components/Vulnerability.svelte";

    $: teamName = $page.params.team;
    export let data: PageData;
    $: ({TeamVulnerabilities} = data);
    $: team = $TeamVulnerabilities.data?.team;

    let sortKey = {
        key: 'name',
        reverse: true
    };

    const sortData = (key) => {
        console.log('sort:' + key)
        if (team !== undefined) {
            if (sortKey.key === key) {
                sortKey.reverse = !sortKey.reverse;
            } else {
                delete sortKey.reverse;
                sortKey.key = key;
            }
            sortState = {
                orderBy: key,
                direction: sortKey.reverse ? 'descending' : 'ascending'
            }
           /* TeamVulnerabilities.fetch({
				variables: {
					team: "aura",
				}
			})*/

            team.apps.edges.sort((a, b) => {
                    if (a.node.name !== PendingValue && b.node.name !== PendingValue) {
                        if (key === 'env') {
                            return (a.node[key].name > b.node[key].name ? 1 : -1) * (sortKey.reverse ? 1 : -1)
                        }
                        if (key === 'name') {
                            return (a.node[key] > b.node[key] ? 1 : -1) * (sortKey.reverse ? 1 : -1)
                        }
                        if (['critical', 'high', 'medium', 'low'].includes(key)) {
                            if (a.node.dependencyTrack !== null && b.node.dependencyTrack !== null) {
                                return (a.node.dependencyTrack.summary[key] > b.node.dependencyTrack.summary[key] ? 1 : -1) * (sortKey.reverse ? 1 : -1)
                            } else if (a.node.dependencyTrack !== null && b.node.dependencyTrack === null) {
                                return 1 * (sortKey.reverse ? 1 : -1);
                            } else if (a.node.dependencyTrack === null && b.node.dependencyTrack !== null) {
                                return -1 * (sortKey.reverse ? 1 : -1);
                            }
                        }
                    }
                    return 0;
                }
            );
            team = team
        }
    };


    let sortState: TableSortState = {
        orderBy: 'name',
        direction: 'ascending'
    }


</script>

{#if $TeamVulnerabilities.errors}
    <Alert variant="error">
        {#each $TeamVulnerabilities.errors as error}
            {error.message}
        {/each}
    </Alert>
{:else}
    <div class="grid">
        <Card columns={12}>
            <Table size="small" sort={sortState}
                   on:sortChange={(e) => {
		            const { key } = e.detail;
                    sortData(key);
                   }}>

                <Thead>
                <Th sortable={true} sortKey="name">
                    Name
                </Th>
                <Th sortable={true} sortKey="env">Env
                </Th>
                <Th>Findings</Th>
                <Th sortable={true} sortKey="critical">Critical
                </Th>
                <Th sortable={true} sortKey="high">High
                </Th>
                <Th sortable={true} sortKey="medium">Medium
                </Th>
                <Th sortable={true} sortKey="low">Low
                </Th>
                </Thead>
                <Tbody>
                {#if team !== undefined}
                    {#if team.id === PendingValue}
                        <Tr>
                            {#each new Array(team.apps.edges.length).fill('medium') as size}
                                <Td>
                                    <Loading {size}/>
                                </Td>
                            {/each}
                        </Tr>
                    {:else}

                        {#each team.apps.edges as edge}
                            <Tr>
                                <Td>
                                    <a href="/team/{teamName}/{edge.node.env.name}/app/{edge.node.name}"
                                    >{edge.node.name}</a
                                    >
                                </Td>
                                <Td>{edge.node.env.name}</Td>
                                {#if edge.node.dependencyTrack !== null}
                                    <Td>
                                        <a href="{ edge.node.dependencyTrack.findingsLink}">View</a>
                                    </Td>

                                    <Td>
                                        <Vulnerability severity="critical"
                                                       count={edge.node.dependencyTrack.summary.critical}/>
                                    </Td>
                                    <Td>
                                        <Vulnerability severity="high" count={edge.node.dependencyTrack.summary.high}/>
                                    </Td>
                                    <Td>
                                        <Vulnerability severity="medium"
                                                       count={edge.node.dependencyTrack.summary.medium}/>
                                    </Td>
                                    <Td>
                                        <Vulnerability severity="low" count={edge.node.dependencyTrack.summary.low}/>
                                    </Td>
                                {:else}
                                    <Td>
                                        <span style="color:lightslategray">No data found in dependencytrack</span>
                                    </Td>
                                    <Td><span class="na">-</span></Td>
                                    <Td><span class="na">-</span></Td>
                                    <Td><span class="na">-</span></Td>
                                    <Td><span class="na">-</span></Td>
                                {/if}
                            </Tr>
                        {:else}
                            <Tr>
                                <Td colspan={4}>No apps found</Td>
                            </Tr>
                        {/each}
                    {/if}
                {/if}
                </Tbody>
            </Table>
            {#if team !== undefined}
                {#if team.id !== PendingValue}
                    <Pagination
                            totalCount={team.apps.totalCount}
                            pageInfo={team.apps.pageInfo}
                            on:nextPage={() => {
							if (!$TeamVulnerabilities.pageInfo.hasNextPage) return;
							TeamVulnerabilities.loadNextPage();
						}}
                            on:previousPage={() => {
							if (!$TeamVulnerabilities.pageInfo.hasPreviousPage) return;
							TeamVulnerabilities.loadPreviousPage();
						}}
                    />
                {/if}
            {/if}
        </Card>
    </div>
{/if}

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        column-gap: 1rem;
        row-gap: 1rem;
    }

    .na {
        padding-left: 10px;
        color: lightslategray;
    }

    .arrow {
        margin-left: 5px;
        border: solid #6e6e6e;
        border-width: 0 3px 3px 0;
        display: inline-block;
        padding: 3px;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        line-height: 20px;
        background: transparent;
        cursor: pointer;
    }

    .up {
        transform: rotate(-135deg);
        -webkit-transform: rotate(-135deg);
    }

</style>