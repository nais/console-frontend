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


    function sortBy(type: string, multiplier: number) {
        if (team !== undefined) {
            team.apps.edges.sort((a, b) => {
                if (a.node.name !== PendingValue && b.node.name !== PendingValue) {
                    if (a.node.dependencyTrack !== null && b.node.dependencyTrack !== null) {
                        if (type === "critical") {
                            if (a.node.dependencyTrack.summary.critical > b.node.dependencyTrack.summary.critical) {
                                return 1 * multiplier;
                            }
                            if (a.node.dependencyTrack.summary.critical < b.node.dependencyTrack.summary.critical) {
                                return -1 * multiplier;
                            }
                        }
                        if (type === "high") {
                            if (a.node.dependencyTrack.summary.high > b.node.dependencyTrack.summary.high) {
                                return 1 * multiplier;
                            }
                            if (a.node.dependencyTrack.summary.high < b.node.dependencyTrack.summary.high) {
                                return -1 * multiplier;
                            }
                        }
                        if (type === "medium") {
                            if (a.node.dependencyTrack.summary.medium > b.node.dependencyTrack.summary.medium) {
                                return 1 * multiplier;
                            }
                            if (a.node.dependencyTrack.summary.medium < b.node.dependencyTrack.summary.medium) {
                                return -1 * multiplier;
                            }
                        }
                        if (type === "low") {
                            if (a.node.dependencyTrack.summary.low > b.node.dependencyTrack.summary.low) {
                                return 1 * multiplier;
                            }
                            if (a.node.dependencyTrack.summary.low < b.node.dependencyTrack.summary.low) {
                                return -1 * multiplier;
                            }
                        }

                    } else if (a.node.dependencyTrack !== null && b.node.dependencyTrack === null) {
                        return 1 * multiplier;
                    } else if (a.node.dependencyTrack === null && b.node.dependencyTrack !== null) {
                        return -1 * multiplier;
                    }
                    if (type === "name") {
                        if (a.node.name > b.node.name) {
                            return 1 * multiplier;
                        }
                        if (a.node.name < b.node.name) {
                            return -1 * multiplier;
                        }
                    }
                    if (type === "env") {
                        if (a.node.env.name > b.node.env.name) {
                            return 1 * multiplier;
                        }
                        if (a.node.env.name < b.node.env.name) {
                            return -1 * multiplier;
                        }
                    }
                }
                return 0;
            })
            team = team;
        }
    }

    afterNavigate((nav) => {
        let props = {};
        if (nav.to?.route.id != null) {
            props = {routeID: nav.to.route.id};
        }
        console.log('page')
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
                    <!-- Sort by name LOW to HIGH -->
                    <button class="triangle_upp" on:click={() => {sortBy("name", 1)}}></button>
                    <!-- Sort by name HIGH to LOW -->
                    <button class="triangle_down" on:click={() => {sortBy("name", -1)}}></button>
                </Th>
                <Th>Env
                    <button class="triangle_upp" on:click={() => {sortBy("env", 1)}}></button>
                    <button class="triangle_down" on:click={() => {sortBy("env", -1)}}></button>
                </Th>
                <Th>Findings</Th>
                <Th>Critical
                    <button class="triangle_upp" on:click={() => {sortBy("critical", 1)}}></button>
                    <button class="triangle_down" on:click={() => {sortBy("critical", -1)}}></button>
                </Th>
                <Th>High
                    <button class="triangle_upp" on:click={() => {sortBy("high", 1)}}></button>
                    <button class="triangle_down" on:click={() => {sortBy("high", -1)}}></button>
                </Th>
                <Th>Medium
                    <button class="triangle_upp" on:click={() => {sortBy("medium", 1)}}></button>
                    <button class="triangle_down" on:click={() => {sortBy("medium", -1)}}></button>
                </Th>
                <Th>Low
                    <button class="triangle_upp" on:click={() => {sortBy("low", 1)}}></button>
                    <button class="triangle_down" on:click={() => {sortBy("low", -1)}}></button>
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

    .triangle_upp {
        padding: 0px;
        padding-top: 1px;
        border-left: solid 5px transparent;
        border-right: solid 5px transparent;
        border-bottom: solid 10px lightslategray;
        border-top: none;
    }

    .triangle_down {
        padding: 0px;
        padding-top: 1px;
        border-left: solid 5px transparent;
        border-right: solid 5px transparent;
        border-bottom: solid 10px lightslategray;
        border-top: none;
    }
</style>