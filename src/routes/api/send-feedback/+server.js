import { SLACK_API_TOKEN, SLACK_FEEDBACK_CHANNEL_ID, TENANT_NAME } from '$app/env/private';
import { ServerGetUserStore } from '$houdini';
import { createFeedbackMessage } from './message';
import { WebClient } from '@slack/web-api';

const client = new WebClient(SLACK_API_TOKEN);
const channel = SLACK_FEEDBACK_CHANNEL_ID || '';
const tenant = TENANT_NAME || '';

export async function POST(event) {
	const { request } = event;

	const q = new ServerGetUserStore();
	const { data } = await q.fetch({ event });
	if (data?.me.__typename !== 'User') {
		return Response.json({ error: 'Not authenticated' }, { status: 401 });
	}
	if (!data?.me.email) {
		return Response.json({ error: 'Not authenticated' }, { status: 401 });
	}

	const email = data.me.email;

	const body = await request.json();
	const { anonymous, feedback, path, type } = body;

	let blocks;

	try {
		blocks = createFeedbackMessage(anonymous, email, feedback, path, tenant, type);
	} catch (error) {
		return Response.json({ error: 'Failed to create feedback message - ' + error }, { status: 500 });
	}

	try {
		const result = await client.chat.postMessage({
			channel: channel,
			blocks: blocks,
			text: `${type} feedback`,
			unfurl_links: false,
			unfurl_media: false
		});

		if (result.ok) {
			return Response.json({ message: 'Feedback sent successfully!' });
		} else {
			return Response.json({ error: 'Failed to send feedback' }, { status: 500 });
		}
	} catch (error) {
		return Response.json({ error: 'An error occurred - ' + error }, { status: 500 });
	}
}
