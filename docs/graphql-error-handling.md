# GraphQL Error Handling Guide

This document describes how GraphQL errors from the nais API are properly propagated to end users in the console-frontend application.

## Architecture Overview

```
nais API (GraphQL) → Vite Proxy → SvelteKit Server → Houdini Client → UI Components
                                                            ↓
                                                    GraphErrors Component
```

## Error Flow

### 1. Server-Side (Proxy)

**File**: `vite.config.ts`, `src/hooks.server.ts`

The Vite dev server proxies GraphQL requests to the nais API. The `handleFetch` hook in `hooks.server.ts` ensures cookies are forwarded for authentication.

```typescript
// vite.config.ts
proxy: {
  '/graphql': {
    target: targetProxy,
    headers: headers(),
    changeOrigin: targetProxy.indexOf('127.0.0.1') < 0
  }
}
```

**Error handling**: Network-level errors are handled by the proxy. GraphQL errors in the response body are passed through transparently.

### 2. Houdini Client

**File**: `src/client.ts`

The Houdini client handles all GraphQL operations. It includes plugins for error handling:

```typescript
export default new HoudiniClient({
	url: browser || !graphqlEndpoint ? '/graphql' : graphqlEndpoint,
	plugins: [subscription(sseSockets), handleMissingLogin('UserInfo')]
});
```

The `handleMissingLogin` plugin specifically handles `Unauthorized` errors by setting `isAuthenticated.set(false)`.

### 3. Client-Side Mutations

**Pattern**: Direct mutation calls in Svelte components

When making mutations from the client:

```typescript
const mutation = graphql(`
  mutation UpdateUnleashInstance($input: UpdateUnleashInstanceInput!) {
    updateUnleashInstance(input: $input) {
      unleash { name }
    }
  }
`);

// Call the mutation
await mutation.mutate({ input: { ... } });

// Errors are available in the store
if ($mutation.errors) {
  // Errors are automatically displayed using GraphErrors component
}
```

Display errors using the `GraphErrors` component:

```svelte
<GraphErrors errors={$mutation.errors} dismissable operation="UpdateUnleashInstance" />
```

### 4. Server-Side Form Actions

**Pattern**: Server-side mutations with form submissions

When handling mutations in `+page.server.ts` files, use the utility functions to properly format errors:

```typescript
import { formatGraphQLErrors } from '$lib/graphql-errors';
import { fail, redirect } from '@sveltejs/kit';

const res = await mutation.mutate({ input }, { event });

if (res.errors?.length ?? 0 > 0) {
	return fail(400, {
		success: false,
		error: formatGraphQLErrors(res.errors) // Formats ALL errors with additional context
		// ... other form data
	});
}

if (!res.data) {
	return fail(500, {
		success: false,
		error: 'Failed to perform operation'
	});
}

return redirect(303, '/success-url');
```

## Utility Functions

**File**: `src/lib/graphql-errors.ts`

### `extractGraphQLErrorMessages(errors)`

Extracts all error messages from a GraphQL response, including error codes from extensions.

```typescript
const messages = extractGraphQLErrorMessages(res.errors);
// ["Invalid input: name is required", "Field 'tier' must be one of: BASIC, PREMIUM"]
```

### `formatGraphQLErrors(errors)`

Formats multiple error messages into a single user-friendly string suitable for form error displays.

```typescript
const errorString = formatGraphQLErrors(res.errors);
// "1. Invalid input: name is required\n2. Field 'tier' must be one of: BASIC, PREMIUM"
```

### `hasErrorCode(errors, code)`

Checks if errors include a specific error code from the backend.

```typescript
if (hasErrorCode(res.errors, 'RESOURCE_ALREADY_EXISTS')) {
	// Handle duplicate resource error
}
```

### `logGraphQLErrors(operation, errors, context)`

Logs errors for debugging. In production, this should be connected to an error tracking service.

```typescript
logGraphQLErrors('CreateValkey', res.errors, { teamSlug: team, env });
```

## GraphErrors Component

**File**: `src/lib/ui/GraphErrors.svelte`

The `GraphErrors` component is a reusable error display component that:

- De-duplicates error messages
- Extracts error codes from extensions
- Optionally allows users to dismiss errors
- Automatically logs errors for debugging

**Props**:

- `errors`: Array of GraphQL error objects
- `size`: 'small' | 'medium' (default: 'small')
- `dismissable`: boolean (default: false) - Shows a dismiss button
- `operation`: string (optional) - Name of the operation for logging

**Usage examples**:

```svelte
<!-- Query errors -->
<GraphErrors errors={$query.errors} operation="FetchTeamData" />

<!-- Dismissable mutation errors -->
<GraphErrors errors={$createValkey.errors} dismissable operation="CreateValkey" />

<!-- Medium size for prominent display -->
<GraphErrors errors={$mutation.errors} size="medium" />
```

## Best Practices

### ✅ DO

1. **Always check for errors after mutations**:

   ```typescript
   const res = await mutation.mutate(variables, { event });
   if (res.errors) {
   	return fail(400, { error: formatGraphQLErrors(res.errors) });
   }
   ```

2. **Use GraphErrors component for displaying errors**:

   ```svelte
   <GraphErrors errors={$store.errors} operation="MyOperation" />
   ```

3. **Include operation names for better debugging**:

   ```svelte
   <GraphErrors errors={$errors} operation="UpdateUnleashInstance" />
   ```

4. **Handle both GraphQL errors and missing data**:

   ```typescript
   if (res.errors) {
   	/* handle errors */
   } else if (!res.data) {
   	/* handle missing data */
   }
   ```

5. **Return formatted errors from server actions**:
   ```typescript
   return fail(400, {
   	error: formatGraphQLErrors(res.errors),
   	...formData
   });
   ```

### ❌ DON'T

1. **Don't only show the first error**:

   ```typescript
   // ❌ BAD: Only shows one error
   error: res.errors![0].message;

   // ✅ GOOD: Shows all errors with context
   error: formatGraphQLErrors(res.errors);
   ```

2. **Don't ignore error extensions**:

   ```typescript
   // ❌ BAD: Loses error code information
   message: error.message;

   // ✅ GOOD: Includes error code
   message: extractGraphQLErrorMessages([error])[0];
   ```

3. **Don't forget to check for null errors**:

   ```typescript
   // ❌ BAD: Could cause null reference error
   if (res.errors.length > 0)

   // ✅ GOOD: Safely checks
   if (res.errors?.length ?? 0 > 0)
   ```

## Error Types

### Network Errors

Network errors (connection refused, timeout, etc.) are handled by the fetch layer and typically result in no response. These should be caught with try/catch blocks.

### Authentication Errors

Authentication errors (`Unauthorized`) are caught by the `handleMissingLogin` plugin and trigger the login flow.

### GraphQL Errors

GraphQL errors are returned in the `errors` array of the response. They may include:

- `message`: Human-readable error message
- `path`: GraphQL path where the error occurred
- `extensions.code`: Machine-readable error code (e.g., `VALIDATION_ERROR`, `NOT_FOUND`)
- `extensions`: Additional error metadata

### Validation Errors

Input validation errors are returned as GraphQL errors with detailed messages about which fields are invalid.

## Testing Error Handling

When testing error handling:

1. Test with actual GraphQL errors from the API
2. Verify all error messages are displayed to the user
3. Check that error codes are included when present
4. Test dismissable errors can be dismissed
5. Verify errors are logged for debugging

## Example: Complete Error Handling Flow

```typescript
// src/routes/team/[team]/resource/create/+page.server.ts
import { graphql } from '$houdini';
import { formatGraphQLErrors } from '$lib/graphql-errors';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation CreateResource($input: CreateResourceInput!) {
		createResource(input: $input) {
			resource {
				id
				name
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { request, params } = event;
		const data = await request.formData();

		const name = data.get('name') as string | null;

		if (!name) {
			return fail(400, {
				success: false,
				error: 'Name is required',
				name
			});
		}

		const res = await mutation.mutate({ input: { name, teamSlug: params.team } }, { event });

		// Handle GraphQL errors - includes ALL errors with error codes
		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				success: false,
				error: formatGraphQLErrors(res.errors),
				name
			});
		}

		// Handle unexpected missing data
		if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to create resource',
				name
			});
		}

		// Success - redirect to the created resource
		return redirect(303, `/team/${params.team}/resource/${res.data.createResource.resource.id}`);
	}
};
```

```svelte
<!-- src/routes/team/[team]/resource/create/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Alert, Button, TextField } from '@nais/ds-svelte-community';

	let { form } = $props();
</script>

{#if form?.error}
	<Alert variant="error" style="margin-bottom: 1rem;">
		{form.error}
	</Alert>
{/if}

<form method="POST" use:enhance>
	<TextField name="name" label="Resource Name" value={form?.name || ''} error={form?.error} />
	<Button type="submit">Create Resource</Button>
</form>
```

## Monitoring and Debugging

The `logGraphQLErrors` function logs all errors to the console in development with detailed information. In production, this should be integrated with an error tracking service like Sentry.

### Enhanced Error Logging

The error logging is structured to provide maximum debugging information:

```typescript
// src/lib/graphql-errors.ts
export function logGraphQLErrors(
	operation: string,
	errors: GraphQLError[] | null | undefined,
	context?: Record<string, unknown>
): void {
	if (!errors || errors.length === 0) return;

	// Log detailed error information for debugging
	console.group(`GraphQL errors in ${operation}`);
	errors.forEach((err, index) => {
		console.error(`Error ${index + 1}:`, {
			message: err.message,
			path: err.path,
			extensions: err.extensions,
			// Log the full error object for debugging
			fullError: err
		});
	});
	if (context) {
		console.log('Context:', context);
	}
	console.groupEnd();
}
```

### Mutation Error Handling with Logging

When calling mutations, log the full result for debugging:

```typescript
const updateResource = async () => {
	try {
		const result = await mutation.mutate({ input });

		// Log the full result for debugging
		console.log('Mutation result:', {
			data: result.data,
			errors: result.errors,
			hasErrors: !!result.errors
		});

		if (!result.errors) {
			// Success - refetch or redirect
			await refetchData();
		}
	} catch (error) {
		console.error('Network error during mutation:', error);
	}
};
```

## Troubleshooting

### Generic Error Messages

If you see generic error messages like "The server errored out while processing your request", check the browser console for detailed error logs:

1. **Open browser DevTools** (F12)
2. **Check the Console tab** for grouped error logs
3. **Look for the operation name** in the error group
4. **Examine the error details**:
   - `message`: The error message from the API
   - `path`: Where in the GraphQL query the error occurred
   - `extensions`: Additional error metadata including error codes
   - `fullError`: Complete error object for debugging

**Common causes:**

- API validation errors (check `extensions.code` for specific error codes)
- Missing required fields in the mutation input
- Authorization errors (insufficient permissions)
- Backend service errors

### Handling Network Errors

If mutations fail without GraphQL errors, check for network errors:

```typescript
try {
	const result = await mutation.mutate({ input });
	if (!result.errors) {
		// Success
	}
} catch (error) {
	// Network error (connection refused, timeout, etc.)
	console.error('Network error:', error);
}
```

### Debugging Steps

1. **Check browser console** for detailed error logs
2. **Verify the GraphQL operation** matches the schema
3. **Check network tab** to see the actual request/response
4. **Look for error codes** in `extensions.code`
5. **Test with GraphQL playground** to isolate API vs frontend issues

## Summary

✅ **GraphQL errors from the nais API are now properly propagated through:**

1. Vite proxy passes errors transparently
2. Houdini client stores errors in `$store.errors`
3. `GraphErrors` component displays all errors with codes
4. `formatGraphQLErrors()` utility formats all errors for server actions
5. Error logging provides detailed debugging information

All error information including messages, paths, and extension data (like error codes) is preserved and can be displayed to end users.
