# Agent Chat API - Client Documentation

This document describes the REST API for the Nais Agent chat service.

## Base Path

All agent endpoints are available under `/agent`.

## Authentication

The agent API uses the same authentication as the GraphQL API:
- Session cookies (OAuth2)
- JWT tokens via `Authorization: Bearer <token>` header
- API keys via `Authorization: Bearer <api-key>` header

All endpoints require authentication.

## Endpoints

### POST /agent/chat

Non-streaming chat endpoint. Sends a message and waits for the complete response.

**Request Body:**
```json
{
  "message": "How do I deploy my application?",
  "conversation_id": "optional-uuid-to-continue-conversation",
  "context": {
    "path": "/team/my-team/app/my-app",
    "team": "my-team",
    "app": "my-app",
    "env": "dev"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | The user's message |
| `conversation_id` | string | No | UUID of existing conversation to continue |
| `context` | object | No | Current UI context to help the assistant |
| `context.path` | string | No | Current page path |
| `context.team` | string | No | Current team slug |
| `context.app` | string | No | Current application name |
| `context.env` | string | No | Current environment |

**Response:**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "content": "To deploy your application, you need to...",
  "blocks": [
    {
      "type": "tool_use",
      "tool_name": "query_nais_api",
      "tool_success": true
    },
    {
      "type": "text",
      "text": "To deploy your application, you need to..."
    }
  ],
  "sources": [
    {
      "title": "Deploying Applications",
      "url": "https://docs.nais.io/deploy/"
    }
  ]
}
```

---

### POST /agent/chat/stream

Streaming chat endpoint using Server-Sent Events (SSE). Sends a message and streams the response in real-time.

**Request Body:** Same as `/agent/chat`

**Response:** `Content-Type: text/event-stream`

The response is a stream of SSE events. Each event has a `data` field containing a JSON object.

#### Event Types

**metadata** - Sent first, contains conversation info:
```json
{
  "type": "metadata",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

**content** - Streamed content chunks:
```json
{
  "type": "content",
  "content": "To deploy"
}
```

**tool_start** - Tool execution started:
```json
{
  "type": "tool_start",
  "tool_call_id": "call_123456",
  "tool_name": "query_nais_api",
  "description": "Executing query_nais_api..."
}
```

**tool_end** - Tool execution completed:
```json
{
  "type": "tool_end",
  "tool_call_id": "call_123456",
  "tool_name": "query_nais_api",
  "description": "Executed query_nais_api",
  "tool_success": true
}
```

**thinking** - Model's reasoning/thought process (only when thinking mode is enabled):
```json
{
  "type": "thinking",
  "thinking": "Let me analyze this request. The user wants to know about..."
}
```

**chart** - Prometheus chart to be rendered by the client:
```json
{
  "type": "chart",
  "chart": {
    "chart_type": "line",
    "title": "CPU Usage for my-app",
    "environment": "dev",
    "query": "sum(rate(container_cpu_usage_seconds_total{app=\"my-app\"}[5m])) by (pod)",
    "interval": "1h",
    "y_format": "cpu_cores",
    "label_template": "{pod}"
  }
}
```

**sources** - Documentation sources used:
```json
{
  "type": "sources",
  "sources": [
    {
      "title": "Deploying Applications",
      "url": "https://docs.nais.io/deploy/"
    }
  ]
}
```

**usage** - Token usage statistics:
```json
{
  "type": "usage",
  "usage": {
    "input_tokens": 150,
    "output_tokens": 75
  }
}
```

**done** - Stream complete:
```json
{
  "type": "done"
}
```

**error** - An error occurred:
```json
{
  "type": "error",
  "error_code": "stream_error",
  "error_message": "Description of the error"
}
```

#### Example SSE Stream

```
data: {"type":"metadata","conversation_id":"550e8400-e29b-41d4-a716-446655440000","message_id":"6ba7b810-9dad-11d1-80b4-00c04fd430c8"}

data: {"type":"tool_start","tool_call_id":"call_123","tool_name":"query_nais_api","description":"Executing query_nais_api..."}

data: {"type":"tool_end","tool_call_id":"call_123","tool_name":"query_nais_api","description":"Executed query_nais_api","tool_success":true}

data: {"type":"content","content":"Based on "}

data: {"type":"content","content":"the information"}

data: {"type":"content","content":" I found..."}

data: {"type":"sources","sources":[{"title":"Deploying Applications","url":"https://docs.nais.io/deploy/"}]}

data: {"type":"done"}
```

#### Example SSE Stream with Thinking (when enabled)

When thinking mode is enabled on the server, the model's reasoning process is streamed before or alongside the content:

```
data: {"type":"metadata","conversation_id":"550e8400-e29b-41d4-a716-446655440000","message_id":"6ba7b810-9dad-11d1-80b4-00c04fd430c8"}

data: {"type":"thinking","thinking":"The user is asking about deployment. I should check what applications they have access to first."}

data: {"type":"tool_start","tool_call_id":"call_123","tool_name":"query_nais_api","description":"Executing query_nais_api..."}

data: {"type":"tool_end","tool_call_id":"call_123","tool_name":"query_nais_api","description":"Executed query_nais_api","tool_success":true}

data: {"type":"thinking","thinking":"Now I have the information about their applications. I can provide deployment instructions."}

data: {"type":"content","content":"Based on "}

data: {"type":"content","content":"the information"}

data: {"type":"content","content":" I found..."}

data: {"type":"sources","sources":[{"title":"Deploying Applications","url":"https://docs.nais.io/deploy/"}]}

data: {"type":"usage","usage":{"input_tokens":120,"output_tokens":45}}

data: {"type":"done"}
```

#### Example SSE Stream with Chart

When the model decides to visualize metrics data, it will emit a chart event:

```
data: {"type":"metadata","conversation_id":"550e8400-e29b-41d4-a716-446655440000","message_id":"6ba7b810-9dad-11d1-80b4-00c04fd430c8"}

data: {"type":"tool_start","tool_call_id":"call_456","tool_name":"render_chart","description":"Executing render_chart..."}

data: {"type":"tool_end","tool_call_id":"call_456","tool_name":"render_chart","description":"Executed render_chart","tool_success":true}

data: {"type":"chart","chart":{"chart_type":"line","title":"CPU Usage for my-app","environment":"dev","query":"sum(rate(container_cpu_usage_seconds_total{app=\"my-app\"}[5m])) by (pod)","interval":"1h","y_format":"cpu_cores","label_template":"{pod}"}}

data: {"type":"content","content":"Here's the CPU usage for your application over the last hour. "}

data: {"type":"content","content":"As you can see, the usage has been fairly stable..."}

data: {"type":"done"}
```

---

### GET /agent/conversations

List all conversations for the authenticated user.

**Response:**
```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "How do I deploy my application?",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /agent/conversations/{conversationID}

Get a specific conversation with all messages.

**Response:**
```json
{
  "conversation": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "How do I deploy my application?",
    "messages": [
      {
        "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "role": "user",
        "content": "How do I deploy my application?",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        "role": "assistant",
        "content": "To deploy your application...",
        "blocks": [
          {
            "type": "thinking",
            "thinking": "The user wants to know about deployment. Let me check their applications."
          },
          {
            "type": "tool_use",
            "tool_call_id": "execute_graphql",
            "tool_name": "execute_graphql",
            "tool_success": true
          },
          {
            "type": "text",
            "text": "To deploy your application..."
          }
        ],
        "created_at": "2024-01-15T10:30:05Z"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:05Z"
  }
}
```

#### Content Blocks

Assistant messages contain a `blocks` array that represents the sequence of content in the response. This allows clients to render thinking, tool usage, text, and charts in the order they occurred.

**Block Types:**

| Type | Fields | Description |
|------|--------|-------------|
| `thinking` | `thinking` | Model's reasoning/thought process |
| `text` | `text` | Regular text output |
| `tool_use` | `tool_call_id`, `tool_name`, `tool_success` | A tool that was invoked |
| `chart` | `chart` | A Prometheus chart to render |

**Block Types Details:**

| Field | Type | Description |
|-------|------|-------------|
| `tool_call_id` | string | Unique identifier for the tool call. Important for providers that use unique IDs (e.g., OpenAI's `call_...` IDs). May be the same as `tool_name` for some providers. |

**Example with all block types:**
```json
{
  "blocks": [
    {
      "type": "thinking",
      "thinking": "The user is asking about CPU usage. I should visualize this."
    },
    {
      "type": "tool_use",
      "tool_call_id": "get_nais_context",
      "tool_name": "get_nais_context",
      "tool_success": true
    },
    {
      "type": "text",
      "text": "Here's the CPU usage for your application:"
    },
    {
      "type": "tool_use",
      "tool_call_id": "render_chart",
      "tool_name": "render_chart",
      "tool_success": true
    },
    {
      "type": "chart",
      "chart": {
        "chart_type": "line",
        "title": "CPU Usage for my-app",
        "environment": "dev",
        "query": "sum(rate(container_cpu_usage_seconds_total{app=\"my-app\"}[5m])) by (pod)",
        "interval": "1h",
        "y_format": "cpu_cores",
        "label_template": "{pod}"
      }
    },
    {
      "type": "text",
      "text": "The chart shows stable CPU usage around 0.5 cores."
    }
  ]
}
```

---

### DELETE /agent/conversations/{conversationID}

Delete a conversation.

**Response:**
```json
{
  "deleted": true
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Description of the error"
}
```

**HTTP Status Codes:**
- `400 Bad Request` - Invalid request body or parameters
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Conversation not found
- `500 Internal Server Error` - Server error

---

## Client Implementation Notes

### Handling SSE Streams

When consuming the streaming endpoint:

1. Set appropriate headers:
   ```
   Accept: text/event-stream
   Cache-Control: no-cache
   ```

2. Parse each `data:` line as JSON
3. Accumulate `content` events to build the full response
4. Handle `tool_start`/`tool_end` events for UI feedback
5. Handle `thinking` events to show the model's reasoning
6. Handle `chart` events to render Prometheus charts (see below)
7. Stop processing when you receive `done` or `error`

### Building Content Blocks from Stream Events

When streaming, events arrive in real-time. To build the blocks array for display:

1. **Accumulate content**: Buffer consecutive `content` events into a single text block
2. **Flush on transitions**: When you receive a `tool_start`, `thinking`, or `chart` event, flush any accumulated content as a text block first
3. **Map events to blocks**:
   - `thinking` → `{ type: "thinking", thinking: "..." }`
   - `tool_end` → `{ type: "tool_use", tool_call_id: "...", tool_name: "...", tool_success: true/false }`
   - `chart` → `{ type: "chart", chart: {...} }`
   - Accumulated content → `{ type: "text", text: "..." }`

This allows you to render the conversation thread with interleaved thinking, tool usage, and output in the correct order.

### Thinking Mode

When the server has thinking mode enabled (via `AGENT_VERTEX_AI_INCLUDE_THOUGHTS=true`), the model's reasoning process is streamed to clients as `thinking` events. This allows you to:

- Show users the model's thought process for transparency
- Display a "thinking" indicator while the model reasons
- Help users understand how the model arrived at its answer

Thinking blocks are persisted in the conversation history, so they can be displayed when a conversation is reloaded. Consider providing a UI toggle to show/hide thinking blocks based on user preference.

**Note:** Thinking events are only available when using Gemini 3+ models with thinking mode enabled on the server. If thinking mode is not enabled, no `thinking` events will be sent.

### Conversation Management

- Conversations are automatically created when you don't provide a `conversation_id`
- Each user can have up to 10 conversations; older ones are automatically deleted
- Conversation titles are generated from the first message

### Context

Providing `context` helps the assistant give more relevant answers:
- If the user is viewing a specific team/app page, include that information
- The assistant can use this to provide more targeted help

### Rendering Charts

When the model determines that metrics data would be better visualized as a chart, it will emit a `chart` event. The client should render a Prometheus chart component using the provided data.

#### Chart Event Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chart_type` | `"line"` | Yes | Type of chart (currently only `line` is supported) |
| `title` | string | Yes | Human-readable title for the chart |
| `environment` | string | Yes | Environment to query metrics from (e.g., `dev`, `prod`) |
| `query` | string | Yes | Prometheus query (PromQL) to execute |
| `interval` | string | No | Time interval: `1h`, `6h`, `1d`, `7d`, or `30d` (default: `1h`) |
| `y_format` | string | No | Y-axis format: `number`, `percentage`, `bytes`, `cpu_cores`, or `duration` |
| `label_template` | string | No | Template for formatting series labels, e.g., `{pod}` or `{pod}/{container}` |

#### Client Implementation

The chart data maps to a Prometheus chart component with the following props:

```typescript
type PrometheusChartProps = {
  environmentName: string;      // from chart.environment
  query: string;                // from chart.query
  height?: `${number}px`;       // client default, e.g., "300px"
  labelFormatter: (labels: { name: string; value: string }[]) => string;  // derived from chart.label_template
  colorizer?: (label: string, index: number) => string;  // client-side logic
  formatYValue?: (value: number) => string;  // derived from chart.y_format
  formatXValue?: (value: number) => string;  // client-side logic
  interval?: PrometheusChartQueryInterval;   // from chart.interval
};
```

#### Label Template Processing

The `label_template` field uses `{label_name}` syntax. Convert this to a label formatter function:

```typescript
function createLabelFormatter(template: string | undefined) {
  if (!template) {
    return (labels: { name: string; value: string }[]) => 
      labels.map(l => l.value).join('/');
  }
  
  return (labels: { name: string; value: string }[]) => {
    let result = template;
    for (const label of labels) {
      result = result.replace(`{${label.name}}`, label.value);
    }
    return result;
  };
}
```

#### Y-Axis Format Processing

Map `y_format` to appropriate formatting functions:

| y_format | Description | Example Output |
|----------|-------------|----------------|
| `number` | Plain numbers | `1,234.56` |
| `percentage` | Percentage values | `45.2%` |
| `bytes` | Byte sizes | `1.5 GiB` |
| `cpu_cores` | CPU core counts | `0.5 cores` |
| `duration` | Time durations | `2m 30s` |

#### Interval Values

Map `interval` to your `PrometheusChartQueryInterval` enum:

| interval | Description |
|----------|-------------|
| `1h` | Last 1 hour |
| `6h` | Last 6 hours |
| `1d` | Last 1 day |
| `7d` | Last 7 days |
| `30d` | Last 30 days |
