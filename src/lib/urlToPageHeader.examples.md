# urlToPageHeader Function Usage Examples

The `urlToPageHeader` function converts a URL into navigation header information including breadcrumbs, page heading, and optional environment tags.

## Function Signature

```typescript
export const urlToPageHeader = (
	url: URL
): {
	breadcrumbs: Result[];
	heading: string;
	tag?: { label: string; variant: TagProps['variant'] };
}
```

## URL Structure

The function expects URLs following this pattern:
```
/team/{teamName}[/{environment}/{resourceType}/{resourceName}[/{subpage}]]
```

## Behavior

The function uses different logic based on URL path length:

- **Length 3** (team only): `heading = teamName`, no tag
- **Length 4** (team + type): `heading = resourceTypeName`, no tag  
- **Length 6** (team + env + type + resource): `heading = resourceName`, includes environment tag
- **Length 7+** (resource subpages): `heading = subpageName`, includes environment tag

## Examples

### 1. Team Overview Page

```typescript
const url = new URL('http://localhost:5173/team/backend-services');
const result = urlToPageHeader(url);

// Output:
{
  breadcrumbs: [],
  heading: 'backend-services'
  // No tag property
}
```

**Use case**: Main team dashboard page

### 2. Resource Type Listing

```typescript
const url = new URL('http://localhost:5173/team/data-platform/applications');
const result = urlToPageHeader(url);

// Output:
{
  breadcrumbs: [
    { label: 'data-platform', href: '/team/data-platform' }
  ],
  heading: 'Applications'
  // No tag property
}
```

**Use case**: List all applications for a team

### 3. Specific Resource in Environment

```typescript
const url = new URL('http://localhost:5173/team/analytics/prod/postgres/user-database');
const result = urlToPageHeader(url);

// Output:
{
  breadcrumbs: [
    { label: 'analytics', href: '/team/analytics' },
    { label: 'Postgres Instances', href: '/team/analytics/postgres' }
  ],
  heading: 'user-database',
  tag: { label: 'prod', variant: 'info-moderate' }
}
```

**Use case**: View a specific database instance in production

### 4. Resource Detail/Subpage

```typescript
const url = new URL('http://localhost:5173/team/frontend/dev/app/user-portal/manifest');
const result = urlToPageHeader(url);

// Output:
{
  breadcrumbs: [
    { label: 'frontend', href: '/team/frontend' },
    { label: 'Applications', href: '/team/frontend/applications' },
    { label: 'user-portal', href: '/team/frontend/dev/app/user-portal' }
  ],
  heading: 'Manifest',
  tag: { label: 'dev', variant: 'neutral-filled' }
}
```

**Use case**: View application manifest file

## Resource Types

Supported resource types and their display names:

| URL Segment | Display Name |
|-------------|--------------|
| `app` | Applications |
| `job` | Jobs |
| `secret` | Secrets |
| `postgres` | Postgres Instances |
| `bucket` | Buckets |
| `valkey` | Valkey Instances |
| `opensearch` | OpenSearch Instances |
| `kafka` | Kafka Topics |
| `bigquery` | BigQuery Datasets |
| `deploy`/`deploys` | Deployments |
| `activity-log` | Activity Log |
| `vulnerability-report` | Vulnerability Report |

Unknown types are automatically capitalized (e.g., `custom-type` → `Custom-type`).

## Environment Tags

Environment tags are shown for URLs with more than 5 path segments. Tag variants:

| Environment | Variant |
|-------------|---------|
| `prod`, `prod-gcp` | `info-moderate` |
| `prod-fss` | `alt3-moderate` |
| `dev`, `dev-gcp`, `test`, `ci`, `sandbox` | `neutral-filled` |
| `dev-fss` | `neutral-moderate` |
| Any env containing "prod" | `info-moderate` |
| Other environments | `neutral-filled` |

## Testing

The function includes comprehensive tests covering:

- Basic URL patterns
- Heading logic for different path lengths
- Tag generation rules
- Edge cases (empty segments, special characters)
- Breadcrumb generation

Run tests with:
```bash
npm test urlToPageHeader
```

## Integration with UI Components

This function is typically used in page headers:

```typescript
import { urlToPageHeader } from '$lib/urlToPageHeader';
import { page } from '$app/stores';

// In your Svelte component
$: headerData = urlToPageHeader($page.url);
```

```svelte
<!-- In your template -->
<PageHeader 
  breadcrumbs={headerData.breadcrumbs}
  heading={headerData.heading}
  tag={headerData.tag}
/>
```