# Activity Log Icon Colors

## Resource-Based Color Scheme

The activity log icons now use **resource-based colors** instead of operation-based colors. This aligns with the chart color palette and provides consistent visual identity for each resource type.

### Color Mapping

| Resource Type          | Color             | Hex (Primary) | Notes                                           |
| ---------------------- | ----------------- | ------------- | ----------------------------------------------- |
| **Applications**       | Soft Blue-Gray    | `#6b9ac4`     | All app operations (scaled, restarted, deleted) |
| **Jobs**               | Warm Amber        | `#d4a574`     | Job triggered, deleted                          |
| **Deployments**        | Vibrant Purple    | `#8e44ad`     | Special event color (deploys, restarts)         |
| **Secrets**            | Dusty Rose Pink   | `#c48fb1`     | Matches "Secret Manager" chart color            |
| **Repositories**       | Teal Green        | `#4db8a6`     | Repository added, removed                       |
| **Team & Members**     | Coral Pink        | `#e89a8a`     | All team operations                             |
| **OpenSearch**         | Muted Blue Violet | `#a18bc6`     | **Matches chart color**                         |
| **Valkey**             | Muted Magenta     | `#ba8fc1`     | **Matches chart color**                         |
| **Unleash**            | Soft Lime Green   | `#a4c88f`     | Unleash instance operations                     |
| **Vulnerabilities**    | Yellow            | `#f1c40f`     | High visibility (dark text)                     |
| **Kubernetes/Cluster** | Deep Pink         | `#b76d9a`     | Matches "Kubernetes Engine" chart color         |
| **System/Reconciler**  | Neutral Gray      | `#7f8c8d`     | System operations                               |
| **Maintenance**        | Orange            | `#e67e22`     | Service maintenance                             |
| **Neutral**            | Theme Default     | --            | Fallback for unknown types                      |

## Benefits

✅ **Consistency**: Icons match chart colors (OpenSearch, Valkey, Kubernetes, Secrets)
✅ **Scanability**: Easy to find all operations for a specific resource type
✅ **Reduced Cognitive Load**: No need to remember "green = create, red = delete"
✅ **Cohesive Design**: Unified color language across the application

## Icon Components

Icons are defined in `activity-log-icons.ts` and map to specific icon components:

- Applications → `PackageIcon`
- Jobs → `BriefcaseClockIcon`
- Deployments → `RocketIcon`
- Secrets → `PadlockLockedIcon`
- Repositories → `BranchingIcon`
- Team/Members → `PersonGroupIcon`
- OpenSearch → `OpenSearchIcon` (custom)
- Valkey → `ValkeyIcon` (custom)
- Unleash → `UnleashIcon` (custom)
- Vulnerabilities → `VirusIcon`
- Kubernetes/Cluster → `ShieldLockIcon`
- System → `CogIcon`

## Usage

The `activityIconClassFromEntry()` function automatically assigns the correct resource color based on the `__typename` of the activity log entry:

```typescript
// Automatically returns 'activity-icon resource-opensearch'
activityIconClassFromEntry({ __typename: 'OpenSearchCreatedActivityLogEntry' });

// Automatically returns 'activity-icon resource-application'
activityIconClassFromEntry({ __typename: 'ApplicationScaledActivityLogEntry' });
```

No manual color selection needed - the system determines the color from the resource type!
