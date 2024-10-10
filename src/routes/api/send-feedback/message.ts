import type { Block, DividerBlock, HeaderBlock, SectionBlock } from '@slack/types';

export function createFeedbackMessage(
	anonymous: boolean,
	author: string,
	feedback: string,
	path: string,
	tenant: string,
	type: string
): Block[] {
	let headerText: string;

	if (anonymous) {
		author = 'Anonymous';
	}

	switch (type) {
		case 'BUG':
			headerText = ':bug: Bug report';
			break;
		case 'CHANGE_REQUEST':
			headerText = ':bulb: Change request';
			break;
		case 'OTHER':
			headerText = ':speech_balloon: Other feedback';
			break;
		case 'QUESTION':
			headerText = ':question: Question';
			break;
		default:
			throw new Error('Invalid feedback type');
	}

	const details = [
		`*From:* ${author}`,
		`*URL:* https://console.${tenant}.cloud.nais.io${path}`,
		`*Tenant:* ${tenant}`
	];

	return [
		{
			type: 'header',
			text: {
				type: 'plain_text',
				text: headerText,
				emoji: true
			}
		} as HeaderBlock,
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: details.join('\n')
			}
		} as SectionBlock,
		{
			type: 'divider'
		} as DividerBlock,
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: feedback
			}
		} as SectionBlock
	];
}
