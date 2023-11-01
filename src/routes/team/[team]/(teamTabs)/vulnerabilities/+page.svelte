<script lang="ts">
    import {page} from '$app/stores';
    import {PendingValue} from '$houdini';
    import Card from '$lib/Card.svelte';
    import Loading from '$lib/Loading.svelte';
    import Pagination from '$lib/Pagination.svelte';
    import {Alert, Table, Tbody, Td, Th, Thead, Tr} from '@nais/ds-svelte-community';
    import type {PageData} from './$houdini';
    import Vulnerability from "$lib/components/Vulnerability.svelte";


    $: teamName = $page.params.team;
    export let data: PageData;
    $: ({TeamVulnerabilities} = data);
    $: team = $TeamVulnerabilities.data?.team;
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
                <Th>Name</Th>
                <Th>Env</Th>
                <Th>Findings</Th>
                <Th>Critical</Th>
                <Th>High</Th>
                <Th>Medium</Th>
                <Th>Low</Th>
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

    .vulnerabilities {
        margin-top: 0.5rem;
        grid-column: 1 / span 2;
        grid-row: 3;
    }

    .vulnerabilities h5 {
        margin-bottom: 0.5rem;
    }

    .na {
        padding-left: 10px;
        color: lightslategray;
    }
</style>