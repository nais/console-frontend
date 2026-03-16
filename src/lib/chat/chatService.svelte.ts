import { page } from '$app/state';

export type MessageRole = 'user' | 'assistant';

// Block types for structured content
export interface ThinkingBlock {
	type: 'thinking';
	thinking: string;
}

export interface TextBlock {
	type: 'text';
	text: string;
}

export interface ToolUseBlock {
	type: 'tool_use';
	tool_call_id: string;
	tool_name: string;
	tool_success: boolean;
}

export interface ChartBlock {
	type: 'chart';
	chart: ChartData;
}

export type ContentBlock = ThinkingBlock | TextBlock | ToolUseBlock | ChartBlock;

export interface ChartData {
	chart_type: 'line';
	title: string;
	environment: string;
	query: string;
	interval?: '1h' | '6h' | '1d' | '7d' | '30d';
	y_format?: 'number' | 'percentage' | 'bytes' | 'cpu_cores' | 'duration';
	label_template?: string;
}

export interface Source {
	title: string;
	url: string;
}

export interface TokenUsage {
	input_tokens: number;
	output_tokens: number;
}

export interface ChatMessage {
	id: string;
	role: MessageRole;
	blocks: ContentBlock[];
	isStreaming?: boolean;
	timestamp: Date;
	sources?: Source[];
	usage?: TokenUsage;
}

export interface ChatContext {
	path: string;
	team: string;
	app: string;
	env: string;
}

export interface ConversationSummary {
	id: string;
	title: string;
	updatedAt: Date;
}

export interface Conversation {
	id: string;
	title: string;
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
}

// SSE Event types from the API
type StreamEventType =
	| 'metadata'
	| 'content'
	| 'tool_start'
	| 'tool_end'
	| 'thinking'
	| 'chart'
	| 'sources'
	| 'usage'
	| 'done'
	| 'error';

interface StreamEvent {
	type: StreamEventType;
	conversation_id?: string;
	message_id?: string;
	content?: string;
	tool_call_id?: string;
	tool_name?: string;
	description?: string;
	tool_success?: boolean;
	thinking?: string;
	chart?: ChartData;
	sources?: Source[];
	usage?: TokenUsage;
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

// API response types for loading conversations
interface ApiContentBlock {
	type: 'thinking' | 'text' | 'tool_use' | 'chart';
	thinking?: string;
	text?: string;
	tool_call_id?: string;
	tool_name?: string;
	tool_success?: boolean;
	chart?: ChartData;
}

interface ApiMessage {
	id: string;
	role: MessageRole;
	content: string;
	blocks?: ApiContentBlock[];
	created_at: string;
}

function parseApiBlocks(apiBlocks: ApiContentBlock[]): ContentBlock[] {
	return apiBlocks.flatMap((block): ContentBlock[] => {
		switch (block.type) {
			case 'thinking':
				// A single stored thinking block may contain multiple sections separated by
				// a blank line before a ** heading. Split them into individual ThinkingBlocks.
				if (!block.thinking) return [];
				return block.thinking
					.split(/\n\n(?=\*\*)/)
					.map((section) => section.trim())
					.filter(Boolean)
					.map((section): ContentBlock => ({ type: 'thinking', thinking: section }));
			case 'text':
				return block.text ? [{ type: 'text', text: block.text }] : [];
			case 'tool_use':
				return block.tool_name
					? [
							{
								type: 'tool_use',
								tool_call_id: block.tool_call_id ?? block.tool_name,
								tool_name: block.tool_name,
								tool_success: block.tool_success ?? true
							}
						]
					: [];
			case 'chart':
				return block.chart ? [{ type: 'chart', chart: block.chart }] : [];
			default:
				return [];
		}
	});
}

function parseApiMessage(msg: ApiMessage): ChatMessage {
	let blocks: ContentBlock[];

	if (msg.blocks && msg.blocks.length > 0) {
		blocks = parseApiBlocks(msg.blocks);
	} else {
		// Fallback for messages without blocks - just use content as text
		blocks = msg.content ? [{ type: 'text', text: msg.content }] : [];
	}

	return {
		id: msg.id,
		role: msg.role,
		blocks,
		timestamp: new Date(msg.created_at),
		sources: []
	};
}

class ChatService {
	messages = $state<ChatMessage[]>([]);
	isLoading = $state(false);
	error: string | null = $state(null);
	conversationId: string | null = $state(null);
	currentToolName: string | null = $state(null);

	// Conversation history state
	conversations: ConversationSummary[] = $state([]);
	isLoadingConversations = $state(false);
	conversationsError: string | null = $state(null);
	showHistory = $state(false);

	private abortController: AbortController | null = null;

	// Streaming state for building blocks incrementally
	private pendingTextContent = '';
	private streamingMessageIndex = -1;
	private contentUpdateScheduled = false;

	/**
	 * Fetch all conversations for the current user.
	 */
	async fetchConversations(): Promise<void> {
		this.isLoadingConversations = true;
		this.conversationsError = null;

		try {
			const response = await fetch('/agent/conversations');

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `Failed to fetch conversations: ${response.status}`);
			}

			const data = await response.json();
			this.conversations = (data.conversations || []).map(
				(conv: { id: string; title: string; updated_at: string }) => ({
					id: conv.id,
					title: conv.title,
					updatedAt: new Date(conv.updated_at)
				})
			);
		} catch (err) {
			this.conversationsError = err instanceof Error ? err.message : 'Failed to load conversations';
			this.conversations = [];
		} finally {
			this.isLoadingConversations = false;
		}
	}

	/**
	 * Load a specific conversation by ID.
	 */
	async loadConversation(conversationId: string): Promise<void> {
		this.isLoading = true;
		this.error = null;

		try {
			const response = await fetch(`/agent/conversations/${conversationId}`);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `Failed to load conversation: ${response.status}`);
			}

			const data = await response.json();
			const conversation = data.conversation;

			this.conversationId = conversation.id;
			this.messages = (conversation.messages || []).map((msg: ApiMessage) => parseApiMessage(msg));
			this.showHistory = false;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load conversation';
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Delete a conversation by ID.
	 */
	async deleteConversation(conversationId: string): Promise<boolean> {
		try {
			const response = await fetch(`/agent/conversations/${conversationId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `Failed to delete conversation: ${response.status}`);
			}

			// Remove from local list
			this.conversations = this.conversations.filter((c) => c.id !== conversationId);

			// If the deleted conversation was the current one, clear messages
			if (this.conversationId === conversationId) {
				this.clearMessages();
			}

			return true;
		} catch (err) {
			this.conversationsError =
				err instanceof Error ? err.message : 'Failed to delete conversation';
			return false;
		}
	}

	/**
	 * Toggle conversation history view.
	 */
	toggleHistory(): void {
		this.showHistory = !this.showHistory;
		if (this.showHistory) {
			this.fetchConversations();
		}
	}

	/**
	 * Send a message and get a streaming response from the agent API.
	 */
	async sendMessage(content: string): Promise<void> {
		if (!content.trim() || this.isLoading) return;

		this.error = null;
		this.showHistory = false;

		// Add user message with a single text block
		const userMessage: ChatMessage = {
			id: generateId(),
			role: 'user',
			blocks: [{ type: 'text', text: content.trim() }],
			timestamp: new Date()
		};
		this.messages.push(userMessage);

		// Create placeholder for assistant response
		const assistantMessage: ChatMessage = {
			id: generateId(),
			role: 'assistant',
			blocks: [],
			isStreaming: true,
			timestamp: new Date(),
			sources: []
		};
		this.messages.push(assistantMessage);

		this.isLoading = true;
		this.abortController = new AbortController();
		this.pendingTextContent = '';
		this.streamingMessageIndex = this.messages.length - 1;

		try {
			await this.streamResponse(content);
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				// Request was cancelled, remove the incomplete message
				this.messages = this.messages.filter((m) => m.id !== assistantMessage.id);
			} else {
				this.error = err instanceof Error ? err.message : 'An error occurred';
				if (assistantMessage.blocks.length === 0) {
					assistantMessage.blocks = [
						{ type: 'text', text: 'Sorry, an error occurred. Please try again.' }
					];
				}
				const msg = this.messages[this.streamingMessageIndex];
				if (msg) {
					msg.isStreaming = false;
					this.triggerReactivity();
				}
			}
		} finally {
			this.isLoading = false;
			this.abortController = null;
			this.currentToolName = null;
			this.pendingTextContent = '';
			this.streamingMessageIndex = -1;
		}
	}

	/**
	 * Stream response from the agent API using Server-Sent Events.
	 */
	private async streamResponse(content: string): Promise<void> {
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

		for await (const line of this.readLines(response.body)) {
			if (line.startsWith('data: ')) {
				const jsonStr = line.slice(6).trim();
				if (jsonStr) {
					try {
						const event: StreamEvent = JSON.parse(jsonStr);
						this.handleStreamEvent(event);
					} catch {
						// Ignore malformed events
					}
				}
			}
		}

		// Flush any remaining pending text content
		this.flushPendingText();
		const message = this.messages[this.streamingMessageIndex];
		if (message) {
			message.isStreaming = false;
			this.triggerReactivity();
		}
	}

	/**
	 * Async generator that yields lines from a ReadableStream.
	 */
	private async *readLines(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
		const reader = body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					yield line;
				}
			}

			if (buffer) {
				yield buffer;
			}
		} finally {
			reader.releaseLock();
		}
	}

	/**
	 * Get the current streaming message from the messages array.
	 */
	private getStreamingMessage(): ChatMessage | undefined {
		return this.messages[this.streamingMessageIndex];
	}

	/**
	 * Flush accumulated text content as a text block.
	 */
	private flushPendingText(): void {
		if (this.pendingTextContent) {
			const message = this.getStreamingMessage();
			if (message) {
				message.blocks.push({ type: 'text', text: this.pendingTextContent });
				this.pendingTextContent = '';
				this.triggerReactivity();
			}
		}
	}

	/**
	 * Trigger Svelte 5 reactivity by reassigning the messages array.
	 * This is needed because mutations to nested objects may not be detected.
	 */
	private triggerReactivity(): void {
		this.messages = [...this.messages];
	}

	/**
	 * Handle individual stream events from the API.
	 */
	private handleStreamEvent(event: StreamEvent): void {
		const message = this.getStreamingMessage();
		if (!message) return;

		switch (event.type) {
			case 'metadata':
				if (event.conversation_id) {
					this.conversationId = event.conversation_id;
				}
				if (event.message_id) {
					message.id = event.message_id;
				}
				break;

			case 'thinking':
				// Flush any pending text before adding thinking block
				this.flushPendingText();
				if (event.thinking) {
					message.blocks.push({ type: 'thinking', thinking: event.thinking });
					this.triggerReactivity();
				}
				break;

			case 'tool_start':
				// Flush any pending text before tool starts
				this.flushPendingText();
				this.currentToolName = event.tool_name ?? null;
				this.triggerReactivity();
				break;

			case 'tool_end':
				if (event.tool_name) {
					message.blocks.push({
						type: 'tool_use',
						tool_call_id: event.tool_call_id ?? event.tool_name,
						tool_name: event.tool_name,
						tool_success: event.tool_success ?? true
					});
				}
				this.currentToolName = null;
				this.triggerReactivity();
				break;

			case 'chart':
				// Flush any pending text before adding chart
				this.flushPendingText();
				if (event.chart) {
					message.blocks.push({ type: 'chart', chart: event.chart });
					this.triggerReactivity();
				}
				break;

			case 'content':
				if (event.content) {
					this.pendingTextContent += event.content;
					// Throttle UI updates during streaming to avoid excessive re-renders
					this.scheduleContentUpdate();
				}
				break;

			case 'sources':
				if (event.sources) {
					if (!message.sources) {
						message.sources = [];
					}
					message.sources.push(...event.sources);
					this.triggerReactivity();
				}
				break;

			case 'usage':
				console.log(event);
				if (event.usage) {
					message.usage = event.usage;
					this.triggerReactivity();
				}
				break;

			case 'done':
				this.flushPendingText();
				message.isStreaming = false;
				this.triggerReactivity();
				break;

			case 'error':
				this.error = event.error_message ?? 'An unknown error occurred';
				message.isStreaming = false;
				this.triggerReactivity();
				break;
		}
	}

	/**
	 * Schedule a throttled content update to batch rapid content events.
	 */
	private scheduleContentUpdate(): void {
		if (this.contentUpdateScheduled) return;
		this.contentUpdateScheduled = true;

		requestAnimationFrame(() => {
			this.contentUpdateScheduled = false;
			this.updateStreamingText();
		});
	}

	/**
	 * Update streaming text display by extending or creating a text block.
	 */
	private updateStreamingText(): void {
		const message = this.getStreamingMessage();
		if (!message || !this.pendingTextContent) return;

		const lastBlock = message.blocks.at(-1);

		if (lastBlock?.type === 'text') {
			// Update existing text block in place
			lastBlock.text += this.pendingTextContent;
		} else {
			// Add new text block
			message.blocks.push({ type: 'text', text: this.pendingTextContent });
		}
		this.pendingTextContent = '';
		this.triggerReactivity();
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
		this.showHistory = false;
		this.pendingTextContent = '';
		this.streamingMessageIndex = -1;
		this.contentUpdateScheduled = false;
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
