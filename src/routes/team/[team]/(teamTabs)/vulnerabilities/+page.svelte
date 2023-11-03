<script lang="ts">
    import {page} from '$app/stores';
    import {PendingValue} from '$houdini';
    import Card from '$lib/Card.svelte';
    import Loading from '$lib/Loading.svelte';
    import Pagination from '$lib/Pagination.svelte';
    import {Alert, Table, Tbody, Td, Th, Thead, Tr} from '@nais/ds-svelte-community';
    import type {PageData} from './$houdini';
    import Vulnerability from "$lib/components/Vulnerability.svelte";
    import {afterNavigate} from "$app/navigation";
    import {logEvent} from "$lib/amplitude";

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
            team.apps.edges.sort((a, b) => {
                    if (a.node.name !== PendingValue && b.node.name !== PendingValue) {
                        if (key === 'env') {
                            return (a.node[key].name > b.node[key].name ? 1 : -1) * (sortKey.reverse ? 1 : -1)
                        }
                        if (key === 'name'){
                            return (a.node[key] > b.node[key] ? 1 : -1) * (sortKey.reverse ? 1 : -1)
                        }
                        if (['critical', 'high', 'medium', 'low'].includes(key)){
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

    afterNavigate((nav) => {
        let props = {};
        if (nav.to?.route.id != null) {
            props = {routeID: nav.to.route.id};
        }
        logEvent('pageview', props);
    });


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
            <Table size="small">
                <Thead>
                <Th>
                    Name
                    <button on:click={() => sortData('name')} class="arrow {sortKey.reverse ? '' : 'up'}"></button>
                </Th>
                <Th>Env
                   <button on:click={() => sortData('env')} class="arrow {sortKey.reverse ? '' : 'up'}"></button>
                </Th>
                <Th>Findings</Th>
                <Th>Critical
                    <button on:click={() => sortData('critical')} class="arrow {sortKey.reverse ? '' : 'up'}"></button>
                </Th>
                <Th>High
                    <button on:click={() => sortData('high')} class="arrow {sortKey.reverse ? '' : 'up'}"></button>
                </Th>
                <Th>Medium
                    <button on:click={() => sortData('medium')} class="arrow {sortKey.reverse ? '' : 'up'}"></button>
                </Th>
                <Th>Low
                    <button on:click={() => sortData('low')} class="arrow {sortKey.reverse ? '' : 'up'}"></button>
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