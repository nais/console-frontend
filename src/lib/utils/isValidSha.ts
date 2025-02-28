export function isValidSha(sha: string): boolean {
	return /^[0-9a-f]{40}$/i.test(sha);
}
