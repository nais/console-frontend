/**
 * Utility functions for handling GraphQL errors consistently across the application.
 */

export type GraphQLError = {
	message: string;
	extensions?: Record<string, unknown>;
	path?: (string | number)[];
};

/**
 * Extract all error messages from a GraphQL response.
 * Returns an array of error messages for display to the user.
 */
export function extractGraphQLErrorMessages(errors: GraphQLError[] | null | undefined): string[] {
	if (!errors || errors.length === 0) {
		return [];
	}

	return errors.map((error) => {
		// If the error has additional context in extensions, include it
		if (error.extensions?.code) {
			return `${error.message} (${error.extensions.code})`;
		}
		return error.message;
	});
}

/**
 * Format multiple error messages into a single user-friendly string.
 * Useful for server-side form actions that can only return one error string.
 */
export function formatGraphQLErrors(errors: GraphQLError[] | null | undefined): string {
	const messages = extractGraphQLErrorMessages(errors);
	if (messages.length === 0) {
		return 'An unknown error occurred';
	}
	if (messages.length === 1) {
		return messages[0];
	}
	// For multiple errors, format as a list
	return messages.map((msg, idx) => `${idx + 1}. ${msg}`).join('\n');
}

/**
 * Check if errors include a specific error code from the backend.
 */
export function hasErrorCode(
	errors: GraphQLError[] | null | undefined,
	code: string
): boolean {
	if (!errors) return false;
	return errors.some((error) => error.extensions?.code === code);
}

/**
 * Log GraphQL errors for debugging.
 * In production, this could be sent to an error tracking service.
 */
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
