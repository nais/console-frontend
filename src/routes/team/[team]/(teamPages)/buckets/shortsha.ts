function truncate(input: string, maxLength: number): string {
	return input.length > maxLength ? input.substring(0, maxLength) : input;
}

export async function slugHashPrefixTruncate(
	teamSlug: string,
	prefix: string,
	maxLength: number
): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(teamSlug);

	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

	const prefixLength = prefix.length;
	const hashLength = 4;
	const slugLength = maxLength - prefixLength - hashLength - 2; // 2 because we join parts with '-'

	const parts = [
		prefix,
		truncate(teamSlug, slugLength).replace(/-$/, ''),
		truncate(hashHex, hashLength)
	];

	return parts.join('-');
}
