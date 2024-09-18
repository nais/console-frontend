<script lang="ts">
    import {page} from '$app/stores';
    import {PendingValue} from '$houdini';
    import {OrderByField, type OrderByField$options} from '$houdini/graphql';
    import Card from '$lib/Card.svelte';
    import Pagination from '$lib/Pagination.svelte';
    import {logEvent} from '$lib/amplitude';
    import Vulnerability from '$lib/components/Vulnerability.svelte';
    import {docURL} from '$lib/doc';
    import {
        changeParams,
        sortTable,
        tableGraphDirection,
        tableStateFromVariables
    } from '$lib/pagination';
    import {
        Alert,
        HelpText,
        Select,
        Skeleton,
        Table,
        Tbody,
        Td,
        Th,
        Thead,
        Tooltip,
        Tr
    } from '@nais/ds-svelte-community';
    import {
        ArrowCirclepathIcon,
        ExclamationmarkTriangleFillIcon, SandboxIcon,
        SealXMarkIcon,
        ShieldIcon,
        ShieldLockIcon
    } from '@nais/ds-svelte-community/icons';
    import type {PageData} from './$houdini';
    import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
    import Nais from '$lib/icons/Nais.svelte';
    import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
    import {severityToColor} from '$lib/utils/vulnerabilities';

    export let data: PageData;
    $: ({TeamVulnerabilities} = data);
    $: team = $TeamVulnerabilities.data?.team;

    $: teamName = $page.params.team;

    let defaultSortCol: OrderByField$options = OrderByField.RISK_SCORE;
    let defaultSortDir: 'descending' | 'ascending' = 'descending';

    $: ({sortState, limit, offset} = tableStateFromVariables(
        $TeamVulnerabilities.variables,
        defaultSortCol,
        defaultSortDir
    ));

    const onClick = () => {
        let props = {};
        props = {
            routeID: '/dependencytrack/team/findings'
        };
        logEvent('pageview', props);
    };

    const sortChange = (e: CustomEvent<{ key: string }>) => {
        const {key} = e.detail;
        const ss = sortTable(key, sortState);
        defaultSortCol = ss.orderBy as OrderByField$options;
        defaultSortDir = ss.direction;
        changeParams({col: ss.orderBy, dir: tableGraphDirection[ss.direction]});
    };

    let selectedEnvironment: string = '';
</script>

{#if $TeamVulnerabilities.errors}
    <Alert variant="error">
        {#each $TeamVulnerabilities.errors as error}
            {error.message}
        {/each}
    </Alert>
{:else}
    <div class="grid">
        <Card columns={3}>
            <div class="summaryCard">
                <div>
                    <SealXMarkIcon font-size="66px" style="color: var(--a-icon-danger)"/>
                </div>
                <div class="summary">
                    <h4>
                        Vulnerability status
                        <HelpText title="Current team vulnerability status"
                        >The current status of the team's vulnerabilities.
                        </HelpText>
                    </h4>
                </div>
            </div>
        </Card>
        <Card columns={3}>
            <div class="summaryCard">
                {#if team !== undefined && team.id !== PendingValue}
                    <div>
                        {#if team.vulnerabilitiesSummary.coverage >= 100}
                            <Nais
                                    size="66px"
                                    style="color: var(--a-icon-success)"
                                    aria-label="Application is nais"
                                    role="image"
                            />
                        {:else}
                            <CircleProgressBar
                                    size="66px"
                                    progress={team.vulnerabilitiesSummary.coverage / 100}
                                    startColor="red"
                                    endColor="green"
                            />
                        {/if}
                    </div>
                    <div class="summary">
                        <h4>
                            SBOM coverage
                            <HelpText title="Current SBOM coverage">Workloads with an SBOM.</HelpText>
                        </h4>
                        <p class="metric">
                            {team.vulnerabilitiesSummary.bomCount} of {team.vulnerabilitiesSummary.totalWorkloads}
                            workload(s)
                        </p>
                    </div>
                {/if}
            </div>
        </Card>
        <Card columns={3}>
            <div class="summaryCard">
                {#if team !== undefined && team.id !== PendingValue}
                    <div>
                        <Tooltip placement="right" content="severity: CRITICAL">
                            <VulnerabilityBadge
                                    text={String(team.vulnerabilitiesSummary.critical)}
                                    color={severityToColor('critical')}
                                    size={'66px'}
                            />
                        </Tooltip>
                    </div>
                    <div class="summary">
                        <h4>Critical vulnerabilities</h4>
                        <p class="metric"></p>
                    </div>
                {/if}
            </div>
        </Card>
        <Card columns={3}>
            <div class="summaryCard">
                {#if team !== undefined && team.id !== PendingValue}
                    <div class="summaryIcon" style="--bg-color: #C8C8C8">
                        <ShieldLockIcon title="RiskScore" font-size="80" style={'color:lightgrey;'}/>
                    </div>
                    <div class="summary">
                        <h4>
                            Total risk score
                            <HelpText title="Current team risk trend"
                            >The total risk score for the team's vulnerabilities.
                            </HelpText>
                        </h4>
                        <p class="metric">
                            {team.vulnerabilitiesSummary.riskScore}
                        </p>
                    </div>
                {/if}
            </div>
        </Card>
        <Card columns={12}>
            {#if team !== undefined && team.id !== PendingValue}
                <div class="env-filter">
                    <Select
                            size="small"
                            hideLabel={true}
                            bind:value={selectedEnvironment}
                            on:change={() => {
							changeParams({ env: selectedEnvironment });
						}}
                            label="Environment"
                    >
                        <option value="">All environments</option>
                        {#each team.environments as env}
                            <option value={env.name}>{env.name}</option>
                        {/each}
                    </Select>
                </div>
            {/if}

            <Table size="small" sort={sortState} on:sortChange={sortChange}>
                <Thead>
                <Th></Th>
                <Th sortable={true} sortKey={OrderByField.NAME}>Workload</Th>
                <Th sortable={true} sortKey={OrderByField.ENV}>Env</Th>
                <Th sortable={true} sortKey={OrderByField.SEVERITY_CRITICAL}>Critical</Th>
                <Th sortable={true} sortKey={OrderByField.SEVERITY_HIGH}>High</Th>
                <Th sortable={true} sortKey={OrderByField.SEVERITY_MEDIUM}>Medium</Th>
                <Th sortable={true} sortKey={OrderByField.SEVERITY_LOW}>Low</Th>
                <Th sortable={true} sortKey={OrderByField.SEVERITY_UNASSIGNED}>Unassigned</Th>
                <Th sortable={true} sortKey={OrderByField.RISK_SCORE}>Risk Score</Th>
                </Thead>
                <Tbody>
                {#if team !== undefined}
                    {#each team.vulnerabilities.nodes as node}
                        {#if node === PendingValue}
                            <Tr>
                                {#each new Array(8).fill('text') as variant}
                                    <Td>
                                        <Skeleton height="32px" {variant}/>
                                    </Td>
                                {/each}
                            </Tr>
                        {:else}
                            <Tr>
                                <Td>
                                    {#if node.workloadType === 'app'}
                                        <span style="color:var(--a-gray-600)"><SandboxIcon {...$$restProps}/> </span>
                                    {:else if node.workloadType === 'job'}
                                        <span style="color:var(--a-gray-600)"
                                        ><ArrowCirclepathIcon {...$$restProps}/>
                                        </span>
                                    {/if}
                                </Td>
                                <Td>
                                    {#if node.workloadType === 'app'}
                                        <a href="/team/{teamName}/{node.env}/app/{node.workloadName}/image"
                                        >{node.workloadName}</a
                                        >
                                    {:else if node.workloadType === 'job'}
                                        <a href="/team/{teamName}/{node.env}/job/{node.workloadName}/image">{node.workloadName}</a>
                                    {/if}
                                </Td>
                                <Td>{node.env}</Td>
                                {#if node.summary !== null}
                                    {#if !node.hasBom}
                                        <Td colspan={8}>
                                            <div style="display: flex; align-items: center">
                                                <div class="sbom">
                                                    <Tooltip
                                                            placement="right"
                                                            content="SBOM could not be parsed. Check NAIS Salsa documentation"
                                                    >
                                                        <ExclamationmarkTriangleFillIcon
                                                                style="color: var(--a-icon-warning)"
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </Td>
                                    {:else}
                                        <Td>
                                            <div class="vulnerability">
                                                <Vulnerability severity="critical" count={node.summary.critical}/>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div class="vulnerability">
                                                <Vulnerability severity="high" count={node.summary.high}/>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div class="vulnerability">
                                                <Vulnerability severity="medium" count={node.summary.medium}/>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div class="vulnerability">
                                                <Vulnerability severity="low" count={node.summary.low}/>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div class="vulnerability">
                                                <Vulnerability severity="unassigned" count={node.summary.unassigned}/>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div class="vulnerability">
                                                {#if node.summary.riskScore === -1}
                                                    <Vulnerability severity="low" count={node.summary.riskScore}/>
                                                {:else}
                                                    <Tooltip
                                                            placement="left"
                                                            content="Calculated based on the number of vulnerabilities, includes unassigned"
                                                    >
                                                        <span class="na">{node.summary.riskScore}</span>
                                                    </Tooltip>
                                                {/if}
                                            </div>
                                        </Td>
                                    {/if}
                                {:else}
                                    <Td>
                                        No data found in dependencytrack.
                                        <a href={docURL('/services/salsa/#slsa-in-nais')} on:click={onClick}
                                        >How to fix</a
                                        >
                                    </Td>
                                    <Td>
                                        <div class="na">-</div>
                                    </Td>
                                    <Td>
                                        <div class="na">-</div>
                                    </Td>
                                    <Td>
                                        <div class="na">-</div>
                                    </Td>
                                    <Td>
                                        <div class="na">-</div>
                                    </Td>
                                    <Td>
                                        <div class="na">-</div>
                                    </Td>
                                    <Td>
                                        <div class="na">-</div>
                                    </Td>
                                {/if}
                            </Tr>
                        {/if}
                    {:else}
                        <Tr>
                            <Td colspan={9}>No applications with vulnerability data found</Td>
                        </Tr>
                    {/each}
                {/if}
                </Tbody>
            </Table>
            {#if team?.vulnerabilities.pageInfo !== PendingValue}
                <Pagination
                        style="padding-top: 1rem;"
                        pageInfo={team?.vulnerabilities.pageInfo}
                        {limit}
                        {offset}
                        changePage={(e) => {
						changeParams({ page: e.toString() });
					}}
                />
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

    .vulnerability {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 0.6;
    }

    .na {
        text-align: center;
    }

    .sbom {
        margin-left: 0.5rem;
    }

    .env-filter {
        display: flex;
        margin-bottom: 1rem;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        column-gap: 1rem;
        row-gap: 1rem;
        margin-bottom: 1rem;
    }

    .summaryIcon {
        display: flex;
        justify-content: center;
        align-items: center;
        /*width: 66px;
        height: 66px;*/
        /*border: 1px solid var(--bg-color);
        border-radius: 5px;*/
    }

    .summary {
        width: 100%;
    }

    .summary > h4 {
        display: flex;
        justify-content: space-between;
        margin: 0;
        font-size: 1rem;
        color: var(--color-text-secondary);
    }

    .metric {
        font-size: 1.3rem;
        margin: 0;
    }

    .summaryCard {
        display: flex;
        align-items: center;
        gap: 20px;
    }
</style>
