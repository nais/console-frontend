export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
	id: string;
	role: MessageRole;
	content: string;
	isStreaming?: boolean;
	timestamp: Date;
}

export interface StreamCallbacks {
	onToken: (token: string) => void;
	onComplete: (fullMessage: string) => void;
	onError: (error: Error) => void;
}

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

class ChatService {
	messages: ChatMessage[] = $state([]);
	isLoading = $state(false);
	error: string | null = $state(null);

	private abortController: AbortController | null = null;

	/**
	 * Send a message and get a response.
	 * Currently uses a mock implementation, but designed to support
	 * streaming responses via SSE or GraphQL subscriptions.
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
			timestamp: new Date()
		};
		this.messages.push(assistantMessage);

		this.isLoading = true;
		this.abortController = new AbortController();

		try {
			await this.mockStreamResponse(assistantMessage);
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				// Request was cancelled, remove the incomplete message
				this.messages = this.messages.filter((m) => m.id !== assistantMessage.id);
			} else {
				this.error = err instanceof Error ? err.message : 'An error occurred';
				assistantMessage.content = 'Sorry, an error occurred. Please try again.';
				assistantMessage.isStreaming = false;
			}
		} finally {
			this.isLoading = false;
			this.abortController = null;
		}
	}

	/**
	 * Mock streaming response for development.
	 * Replace this with actual SSE/GraphQL subscription when ready.
	 */
	private async mockStreamResponse(message: ChatMessage): Promise<void> {
		const mockResponses = [
			"I'm here to help you with your Nais applications. What would you like to know?",
			'I can assist you with deployments, monitoring, and troubleshooting your applications on the Nais platform.',
			"That's a great question! Let me help you understand how that works in Nais.",
			'Based on your query, here are some suggestions for your application configuration.'
		];

		const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
		const words = response.split(' ');

		for (let i = 0; i < words.length; i++) {
			// Check if request was aborted
			if (this.abortController?.signal.aborted) {
				throw new DOMException('Aborted', 'AbortError');
			}

			// Simulate streaming delay
			await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));

			message.content += (i > 0 ? ' ' : '') + words[i];
		}

		message.isStreaming = false;
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
		this.cancelRequest();
	}

	/**
	 * Check if there are any messages (used to show/hide welcome screen).
	 */
	get hasMessages(): boolean {
		return this.messages.length > 0;
	}
}

export const chatService = new ChatService();
