export const joinAliases = (aliases: { name: string; source: string }[], vulnId: string) => {
	return aliases
		.filter((a) => a.name !== vulnId)
		.map((a) => a.name)
		.join(', ');
};

export const parseComment = (comment: string) => {
	const parts = comment.split('|');
	const parsed = parts.reduce(
		(acc, part) => {
			const [key, value] = part.split(':');
			acc[key] = value;
			return acc;
		},
		{} as Record<string, string>
	);
	return parsed;
};
