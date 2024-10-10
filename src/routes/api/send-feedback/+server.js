import { env } from '$env/dynamic/private';
import { createFeedbackMessage } from './message';
import { WebClient } from '@slack/web-api';
import { json } from '@sveltejs/kit';

const client = new WebClient(env.SLACK_API_TOKEN);
const channel = env.SLACK_FEEDBACK_CHANNEL_ID || '';
const tenant = env.TENANT || '';

export async function POST({ request }) {
    const body = await request.json();
    const { anonymous, author, feedback, path, type } = body;

    try {
      // Create the feedback message blocks
      const blocks = createFeedbackMessage(anonymous, author, feedback, path, tenant, type);

      // Send the message to Slack using the WebClient
      const result = await client.chat.postMessage({
        channel: channel,
        blocks: blocks,
        text: `${type} feedback from ${author}`
      });

      console.log('Failed to send feedback:', result);

      if (result.ok) {
        return json({ message: 'Feedback sent successfully!' });
      } else {
        return json({ error: 'Failed to send feedback' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error sending feedback to Slack:', error);
      return json({ error: 'An error occurred' }, { status: 500 });
    }
  };
