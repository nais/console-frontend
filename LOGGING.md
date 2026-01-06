# JSON Logging Example

This document shows the expected JSON log output when the application runs in production (`NODE_ENV=production`).

## HTTP Request Logs

Example of an HTTP request log entry:

```json
{"level":30,"time":1704562800000,"pid":1234,"hostname":"console-frontend-abc123","method":"GET","url":"/team/my-team","status":200,"duration":45,"userAgent":"Mozilla/5.0...","msg":"HTTP Request"}
```

Parsed for readability:

```json
{
  "level": 30,
  "time": 1704562800000,
  "pid": 1234,
  "hostname": "console-frontend-abc123",
  "method": "GET",
  "url": "/team/my-team",
  "status": 200,
  "duration": 45,
  "userAgent": "Mozilla/5.0...",
  "msg": "HTTP Request"
}
```

### Log Levels

- `level: 20` - Debug
- `level: 30` - Info (default for 2xx/3xx responses)
- `level: 40` - Warning (4xx responses)
- `level: 50` - Error (5xx responses)
- `level: 60` - Fatal

## Application Error Logs

Example of an application error log:

```json
{"level":50,"time":1704562800000,"pid":1234,"hostname":"console-frontend-abc123","error":{"type":"Error","message":"GraphQL API health check failed"},"url":"http://nais-api/graphql","msg":"GraphQL API health check failed"}
```

Parsed for readability:

```json
{
  "level": 50,
  "time": 1704562800000,
  "pid": 1234,
  "hostname": "console-frontend-abc123",
  "error": {
    "type": "Error",
    "message": "GraphQL API health check failed"
  },
  "url": "http://nais-api/graphql",
  "msg": "GraphQL API health check failed"
}
```

## Development Mode

In development mode (`NODE_ENV` is not `production`), logs are formatted with `pino-pretty` for human readability:

```
[1704562800000] INFO (1234 on hostname): HTTP Request
    method: "GET"
    url: "/team/my-team"
    status: 200
    duration: 45
```

## Viewing Logs in Kubernetes

After deployment, JSON logs can be viewed in the NAIS log aggregation system. The structured format enables:

1. **Filtering by log level**: Filter to see only errors or warnings
2. **Searching by fields**: Search for specific URLs, status codes, or error messages
3. **Log aggregation**: Group and analyze logs by method, status, duration, etc.
4. **Alerting**: Set up alerts based on error rates or specific error patterns

The logs will no longer show as "unknown" severity - they will be properly categorized by their log level (info, warn, error, etc.).
