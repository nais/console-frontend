# Activity Log Domain

This domain handles the activity log entries, rendering different text components, icons, and tooltips based on the activity's GraphQL union `__typename`.

## How to Add a New Activity Type

To add a new activity type (e.g., `NewFeatureActivityLogEntry`):

### 1. Create the Text Component

Create your new Svelte component at `shared/texts/NewFeatureActivityLogEntryText.svelte`:

```svelte
<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'NewFeatureActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Feature <strong>{data.resourceName}</strong> was updated
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'NEW_FEATURE_UPDATED'
		}}
	/>
</div>
```

#### Optional Link in Meta Component

The `<Meta>` component supports an optional `link` property to render click-through navigation for the activity entry when displayed in sidebar mode. This allows users to easily jump to the detailed activity-log view of the resource.

Pass a `link` object with the following fields:

```typescript
link={{
	teamSlug?: string | null;            // e.g. data.teamSlug
	environmentName?: string | null;     // e.g. data.environmentName
	resourceType: ActivityLogEntryResourceType$options; // e.g. data.resourceType
	activityType: ActivityLogActivityType$options;     // The custom activity enum value
	id: string;                          // The activity log entry ID (data.id)
}}
```

### 2. Register the Text Component

In `activityTextComponents.ts`, import your new Svelte component and register it in `activityTextComponent`:

```typescript
case 'NewFeatureActivityLogEntry':
	return NewFeatureActivityLogEntryText as Component<textComponentProps>;
```

### 3. Register the Icon

In `activity-log-icons.ts`, map your entry type to the desired icon shape:

```typescript
NewFeatureActivityLogEntry: CogIcon,
```

### 4. Register the Tooltip

In `activity-log-tooltip.ts`, map your entry type to a user-friendly tooltip/category name:

```typescript
case 'NewFeatureActivityLogEntry':
	return 'Feature';
```

---

### Workload Specifics (Optional)

If the new activity type belongs to a workload (Application/Job) and should be rendered in the workload activity stream, map it in `workload/textComponent.ts` to `ApplicationActivityLogEntryText` or `JobActivityLogEntryText`.
