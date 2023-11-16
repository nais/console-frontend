<script lang="ts">
    import {type AppImage, fragment, graphql, PendingValue} from '$houdini';
    import Loading from '$lib/Loading.svelte';
    import Time from '$lib/Time.svelte';
    import {CopyButton, Tooltip} from '@nais/ds-svelte-community';
    import WarningIcon from "$lib/icons/WarningIcon.svelte";
    import {logEvent} from "$lib/amplitude";

    export let app: AppImage;
    $: data = fragment(
        app,
        graphql(`
			fragment AppImage on App {
				image @loading
				deployInfo @loading {
					timestamp @loading
					deployer
					url
				}
				vulnerabilities @loading {
					findingsLink
					hasBom
					summary {
						total
						critical
						high
						medium
						low
						unassigned
					}
				}
			}
		`)
    );

    const parseImage = (image: string) => {
        const tag = image.split(':')[1];
        const name = image.split(':')[0].split('/').pop();
        const registry = image.split('/')[0];
        const repository = image.split('/').slice(1, -1).join('/');
        return {registry, repository, name, tag};
    };

    $: image = $data?.image;
    $: deployInfo = $data?.deployInfo;
    const onClick = () => {
        let props = {};
        props = {
            routeID: '/dependencytrack/app/findings'
        };
        logEvent('pageview', props);
    };
</script>

<h4 class="imageHeader">
    Image
    {#if image !== PendingValue}
        <CopyButton
                size="xsmall"
                variant="action"
                text="Copy image name"
                activeText="Image name copied"
                copyText={image}
        />
    {/if}
</h4>
{#if deployInfo?.timestamp === PendingValue}
    <Loading/>
{:else if deployInfo.timestamp !== null}
    <p class="lastActivity">
        <a href={deployInfo.url}>Deployed</a>
        <Time time={deployInfo.timestamp} distance={true}/>
        {#if deployInfo.deployer && deployInfo.url}
            by
            <a href="https://github.com/{deployInfo.deployer}">{deployInfo.deployer}</a>.
        {/if}
    </p>
{/if}
{#if image === PendingValue}
    <Loading/>
{:else}
    {@const {registry, repository, name, tag} = parseImage(image)}
    <div class="imageGrid">
        <div class="registry">
            <h5>Registry</h5>
            <code>{registry}</code>
        </div>
        <div class="repository">
            <h5>Repository</h5>
            <code>{repository}</code>
        </div>
        <div class="imageName">
            <h5>Name</h5>
            <code>{name}</code>
        </div>
        <div class="tag">
            <h5>Tag</h5>
            <code>{tag}</code>
        </div>
        <div class="vulnerabilities">
            <h5>Vulnerabilities</h5>
            {#if $data?.vulnerabilities === PendingValue}
                <Loading/>
            {:else if $data?.vulnerabilities?.summary === null}
                <WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem"/>
                No data found in dependencytrack.
            {:else}
                {#if $data.vulnerabilities.summary}
                    {#if $data.vulnerabilities.summary.critical > 0 }
                        <Tooltip placement="right" content="severity: CRITICAL">
                            <span class="circle red"> {$data.vulnerabilities.summary.critical} </span>
                        </Tooltip>
                    {/if}
                    {#if $data.vulnerabilities.summary.high > 0 }
                        <Tooltip placement="right" content="severity: HIGH">
                            <span class="circle orange"> {$data.vulnerabilities.summary.high} </span>
                        </Tooltip>
                    {/if}
                    {#if $data.vulnerabilities.summary.medium > 0 }
                        <Tooltip placement="right" content="severity: MEDIUM">
                            <span class="circle yellow"> {$data.vulnerabilities.summary.medium} </span>
                        </Tooltip>
                    {/if}
                    {#if $data.vulnerabilities.summary.low > 0 }
                        <Tooltip placement="right" content="severity: LOW">
                            <span class="circle"> {$data.vulnerabilities.summary.low} </span>
                        </Tooltip>
                    {/if}
                    {#if $data.vulnerabilities.summary.total === 0 }
                        <Tooltip placement="right" content="No vulnerabilities found, keep up the good work!">
                            <span class="circle green">0</span>
                        </Tooltip>
                    {:else if !$data.vulnerabilities.hasBom }
                        <WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem"/>
                        <span class="small-text">Data was discovered, but the SBOM was not rendered. Please refer to the NAIS documentation for further assistance</span>
                    {:else if $data.vulnerabilities.summary.unassigned > 0}
                        <Tooltip placement="right" content="severity: UNASSIGNED">
                            <span class="circle"> {$data.vulnerabilities.summary.unassigned} </span>
                        </Tooltip>
                    {/if}
                    <p><a href="{$data.vulnerabilities.findingsLink}" on:click={onClick}>View findings in
                        DependencyTrack</a></p>
                {/if}
            {/if}
        </div>
    </div>
{/if}

<style>
    .lastActivity {
        margin-top: 0px;
    }

    .imageHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        gap: 0.5rem;
    }

    .imageGrid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        column-gap: 0rem;
        row-gap: 0rem;
    }

    .registry {
        grid-column: 1;
        grid-row: 1;
    }

    .repository {
        grid-column: 2;
        grid-row: 1;
    }

    .imageName {
        grid-column: 1;
        grid-row: 2;
    }

    .tag {
        grid-column: 2;
        grid-row: 2;
    }

    .vulnerabilities {
        margin-top: 0.5rem;
        grid-column: 1 / span 2;
        grid-row: 3;
    }

    .vulnerabilities h5 {
        margin-bottom: 0.5rem;
    }

    .circle {
        border-radius: 50%;
        -moz-border-radius: 50%;
        -webkit-border-radius: 50%;
        border: 4px solid #6e6e6e;
        color: #6e6e6e;
        display: inline-block;
        font-weight: bold;
        margin-right: 3px;
        text-align: center;
        width: 42px;
        height: 42px;
        padding: 4px;
    }

    .red {
        border-color: #f86c6b;
    }

    .orange {
        border-color: orange;
    }

    .yellow {
        border-color: #ffc107;
    }

    .green {
        border-color: #4dbd74;
    }

    code {
        font-size: 1rem;
    }

    .small-text {
        font-size: 0.8rem;
    }
</style>
