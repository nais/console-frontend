<script lang="ts">
	import {
		Alert,
		Button,
		Heading,
		HelpText,
		Modal,
		ReadMore,
		Select,
		Skeleton,
		Table,
		Tag,
		Tbody,
		Td,
		TextField,
		Th,
		Thead,
		Theme,
		Tooltip,
		Tr,
		type ButtonProps,
		type ModalHeaderProps,
		type ModalProps,
		type TableSortState,
		type ThemeProps
	} from '@nais/ui';
	import './app.css';

	let open = $state(false);
	let clicks = $state(0);
	let submitted = $state(0);
	let buttonRef = $state<Element>();
	const header: ModalHeaderProps = { heading: 'Package dialog', label: 'Shared UI' };
	const theme: ThemeProps['theme'] = 'light';
	const variant: ButtonProps['variant'] = 'secondary-neutral';
	const width: ModalProps['width'] = 'small';
	let delay = $state<number | null>(2);
	let startTime = $state('09:00');
	let version = $state(1);
	let detailsOpen = $state(false);
	let shadeOnHover = $state(true);
	let tooltipOpen = $state(false);
	let undefinedTooltipOpen = $state<boolean>();
	let sort = $state<TableSortState>({ orderBy: 'name', direction: 'ascending' });
</script>

<main>
	<h1>UI package consumer</h1>
	<Theme theme="dark" data-testid="outer-dark">
		<Button>Dark button</Button>
		<Theme {theme} data-testid="inner-light">
			<Button onclick={() => (open = true)}>Open package dialog</Button>
			<Button {variant} bind:ref={buttonRef} onclick={() => (clicks += 1)}>Count clicks</Button>
			<Button loading>Loading button</Button>
			<Button disabled onclick={() => (clicks += 1)}>Disabled button</Button>
			<Button href="#destination">Link button</Button>
			<Button href="#disabled" disabled>Disabled link</Button>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					submitted += 1;
				}}
			>
				<Button type="submit">Submit button</Button>
			</form>
			<output aria-label="Clicks">{clicks}</output>
			<output aria-label="Submissions">{submitted}</output>
			<output aria-label="Button ref">{buttonRef?.tagName ?? ''}</output>
			<Tooltip content="Bound tooltip" bind:open={tooltipOpen}>
				<Button>Bound tooltip target</Button>
			</Tooltip>
			<output aria-label="Bound tooltip open">{String(tooltipOpen)}</output>
			<Button onclick={() => (tooltipOpen = !tooltipOpen)}>Toggle Bound tooltip</Button>
			<Tooltip content="Initially undefined tooltip" bind:open={undefinedTooltipOpen}>
				<Button>Initially undefined tooltip target</Button>
			</Tooltip>
			<output aria-label="Initially undefined tooltip open">{String(undefinedTooltipOpen)}</output>
			<Button onclick={() => (undefinedTooltipOpen = !undefinedTooltipOpen)}
				>Toggle Initially undefined tooltip</Button
			>
			<section aria-labelledby="package-fields">
				<Heading level="2" id="package-fields" size="medium">Upgrade settings</Heading>
				<TextField
					type="number"
					label="Upgrade delay"
					bind:value={delay}
					min={0}
					description="Days before upgrade"
					error="Choose a valid delay"
					aria-describedby="external-delay-help"
					id="package-delay"
				/>
				<p id="external-delay-help">External delay help</p>
				<TextField type="time" label="Start time" bind:value={startTime} />
				<TextField label="Disabled field" disabled value="Cannot edit" />
				<TextField label="Visually hidden label" hideLabel value="Still labelled" />
				<Select label="Target version" bind:value={version} size="small">
					<option value={1}>Version one</option>
					<option value={2}>Version two</option>
					<option value={3} disabled>Unavailable version</option>
				</Select>
				<output aria-label="Delay value"
					>{delay === null ? 'null' : typeof delay}:{delay ?? 'empty'}</output
				>
				<output aria-label="Start time value">{startTime}</output>
				<output aria-label="Version value">{typeof version}:{version}</output>
			</section>
			<section aria-labelledby="package-history">
				<Heading level="2" id="package-history" size="medium">Upgrade history</Heading>
				<Table
					size="small"
					zebraStripes
					stickyHeader
					{sort}
					onsortchange={(orderBy) => {
						sort = {
							orderBy,
							direction: sort.direction === 'ascending' ? 'descending' : 'ascending'
						};
					}}
				>
					<Thead>
						<Tr>
							<Th scope="col" sortable sortKey="name">Environment</Th>
							<Th scope="col">Status</Th>
						</Tr>
					</Thead>
					<Tbody>
						<Tr><Td>Development</Td><Td><Tag variant="success">Done</Tag></Td></Tr>
						<Tr {shadeOnHover}><Td colspan={2}>No other upgrades</Td></Tr>
					</Tbody>
				</Table>
				<Button onclick={() => (shadeOnHover = !shadeOnHover)}>Toggle row hover</Button>
				<Alert variant="error" size="small">Upgrade failed</Alert>
				<Alert variant="info" contentMaxWidth={false}>Upgrade information</Alert>
				<Skeleton
					variant="text"
					width="12ch"
					height="var(--nais-space-20)"
					data-testid="package-skeleton"
				/>
				<ReadMore header="Initially expanded" defaultOpen>Initial operation details</ReadMore>
				<ReadMore header="Operation details" bind:open={detailsOpen}
					>Bound operation details</ReadMore
				>
				<output aria-label="Details open">{String(detailsOpen)}</output>
			</section>
			<Modal bind:open {header} {width}>
				<label>Package draft <input /></label>
				<HelpText title="Maintenance help" strategy="fixed" placement="right">
					Maintenance times are UTC.
				</HelpText>
				<Tooltip content="Local maintenance time"><span>09:00 UTC</span></Tooltip>
				{#snippet footer()}
					<Button onclick={() => (open = false)}>Finish</Button>
				{/snippet}
			</Modal>
			<Theme theme="dark" data-testid="inner-dark">
				<Button>Nested dark button</Button>
				<HelpText title="Dark help">Dark themed explanation</HelpText>
				<Alert variant="warning">Dark warning</Alert>
			</Theme>
		</Theme>
	</Theme>
</main>
