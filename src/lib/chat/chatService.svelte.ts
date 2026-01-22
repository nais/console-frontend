import { page } from '$app/state';

export type MessageRole = 'user' | 'assistant';

export interface ToolUsed {
	name: string;
	description: string;
}

export interface Source {
	title: string;
	url: string;
}

export interface ChatMessage {
	id: string;
	role: MessageRole;
	content: string;
	isStreaming?: boolean;
	timestamp: Date;
	toolsUsed?: ToolUsed[];
	sources?: Source[];
}

export interface ChatContext {
	path: string;
	team: string;
	app: string;
	env: string;
}

// SSE Event types from the API
type StreamEventType =
	| 'metadata'
	| 'content'
	| 'tool_start'
	| 'tool_end'
	| 'sources'
	| 'done'
	| 'error';

interface StreamEvent {
	type: StreamEventType;
	conversation_id?: string;
	message_id?: string;
	content?: string;
	tool_name?: string;
	description?: string;
	tool_success?: boolean;
	sources?: Source[];
	error_code?: string;
	error_message?: string;
}

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getContextFromPage(): ChatContext {
	const params = page.params as Record<string, string | undefined>;
	return {
		path: page.url?.pathname ?? '',
		team: params.team ?? '',
		app: params.app ?? '',
		env: params.env ?? ''
	};
}

class ChatService {
	messages: ChatMessage[] = $state([]);
	isLoading = $state(false);
	error: string | null = $state(null);
	conversationId: string | null = $state(null);
	currentToolName: string | null = $state(null);

	private abortController: AbortController | null = null;

	/**
	 * Send a message and get a streaming response from the agent API.
	 */
	async sendMessage(content: string): Promise<void> {
		if (!content.trim() || this.isLoading) return;

		this.error = null;

		// Add user message
		const userMessage: ChatMessage = {
			id: generateId(),
			role: 'user',
			content: content.trim(),
			timestamp: new Date()
		};
		this.messages.push(userMessage);

		// Create placeholder for assistant response
		const assistantMessage: ChatMessage = {
			id: generateId(),
			role: 'assistant',
			content: '',
			isStreaming: true,
			timestamp: new Date(),
			toolsUsed: [],
			sources: []
		};
		this.messages.push(assistantMessage);

		this.isLoading = true;
		this.abortController = new AbortController();

		try {
			await this.streamResponse(content, assistantMessage);
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				// Request was cancelled, remove the incomplete message
				this.messages = this.messages.filter((m) => m.id !== assistantMessage.id);
			} else {
				this.error = err instanceof Error ? err.message : 'An error occurred';
				if (!assistantMessage.content) {
					assistantMessage.content = 'Sorry, an error occurred. Please try again.';
				}
				assistantMessage.isStreaming = false;
			}
		} finally {
			this.isLoading = false;
			this.abortController = null;
			this.currentToolName = null;
		}
	}

	/**
	 * Stream response from the agent API using Server-Sent Events.
	 */
	private async streamResponse(content: string, message: ChatMessage): Promise<void> {
		const context = getContextFromPage();

		const response = await fetch('/agent/chat/stream', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'text/event-stream'
			},
			body: JSON.stringify({
				message: content,
				conversation_id: this.conversationId,
				context
			}),
			signal: this.abortController?.signal
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || `Request failed with status ${response.status}`);
		}

		if (!response.body) {
			throw new Error('Response body is empty');
		}

		console.log('[SSE] Starting to read stream');

		// Use the streaming text decoder approach with async iteration
		for await (const line of this.readLines(response.body)) {
			console.log('[SSE] Received line:', line);
			if (line.startsWith('data: ')) {
				const jsonStr = line.slice(6).trim();
				console.log('[SSE] Parsed data:', jsonStr);
				if (jsonStr) {
					try {
						const event: StreamEvent = JSON.parse(jsonStr);
						console.log('[SSE] Parsed event:', event.type, event);
						this.handleStreamEvent(event, message);
					} catch (e) {
						console.error('[SSE] Failed to parse SSE event:', jsonStr, e);
					}
				}
			}
		}

		console.log('[SSE] Stream ended');

		message.isStreaming = false;
	}

	/**
	 * Async generator that yields lines from a ReadableStream.
	 */
	private async *readLines(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
		const reader = body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		console.log('[SSE readLines] Starting to read');

		try {
			while (true) {
				const { done, value } = await reader.read();
				console.log('[SSE readLines] Read chunk, done:', done, 'value length:', value?.length);
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				console.log('[SSE readLines] Decoded chunk:', chunk);
				buffer += chunk;

				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';
				console.log(
					'[SSE readLines] Split into',
					lines.length,
					'lines, buffer remaining:',
					buffer.length
				);

				for (const line of lines) {
					yield line;
				}
			}

			// Yield any remaining content
			if (buffer) {
				console.log('[SSE readLines] Yielding remaining buffer:', buffer);
				yield buffer;
			}
		} finally {
			console.log('[SSE readLines] Releasing reader lock');
			reader.releaseLock();
		}
	}

	/**
	 * Handle individual stream events from the API.
	 */
	private handleStreamEvent(event: StreamEvent, message: ChatMessage): void {
		console.log('[SSE handleStreamEvent] Handling event type:', event.type);

		// Find the message index for triggering reactivity
		const messageIndex = this.messages.findIndex((m) => m.id === message.id);

		switch (event.type) {
			case 'metadata':
				if (event.conversation_id) {
					this.conversationId = event.conversation_id;
				}
				if (event.message_id) {
					message.id = event.message_id;
				}
				break;

			case 'tool_start':
				this.currentToolName = event.tool_name ?? null;
				break;

			case 'tool_end':
				if (event.tool_name && message.toolsUsed) {
					message.toolsUsed = [
						...message.toolsUsed,
						{
							name: event.tool_name,
							description: event.description ?? ''
						}
					];
				}
				this.currentToolName = null;
				break;

			case 'content':
				if (event.content) {
					message.content += event.content;
				}
				break;

			case 'sources':
				if (event.sources && message.sources) {
					message.sources = [...message.sources, ...event.sources];
				}
				break;

			case 'done':
				message.isStreaming = false;
				break;

			case 'error':
				this.error = event.error_message ?? 'An unknown error occurred';
				message.isStreaming = false;
				break;
		}

		// Trigger Svelte 5 reactivity by reassigning the array element
		if (messageIndex !== -1) {
			this.messages[messageIndex] = { ...message };
		}
	}

	/**
	 * Cancel the current request if one is in progress.
	 */
	cancelRequest(): void {
		if (this.abortController) {
			this.abortController.abort();
		}
	}

	/**
	 * Clear all messages and reset the chat.
	 */
	clearMessages(): void {
		this.messages = [];
		this.error = null;
		this.conversationId = null;
		this.currentToolName = null;
		this.cancelRequest();
	}

	/**
	 * Start a new conversation (clears messages but keeps UI open).
	 */
	newConversation(): void {
		this.clearMessages();
	}

	/**
	 * Check if there are any messages (used to show/hide welcome screen).
	 */
	get hasMessages(): boolean {
		return this.messages.length > 0;
	}
}

export const chatService = new ChatService();
