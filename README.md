# Console frontend

## Development

The following snippet contains the most important commands for development.

```bash
npm install
cp .env.example .env # Copy the example environment file
npm run dev # Starts a development server on port 5173

npm run check # Check for various issues
npm run lint # Lint the code
npm run format # Format the code (Or use a Prettier extension in  your editor)
```

## User

In production `api` uses oauth2 to authenticate users.
In developmen

### Local user override

When running locally, the frontend will proxy requests to the backend through a Vite Proxy.
This proxy will add a special header for local development to specify which user to run as.

There's two well known users:

| User                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `dev.usersen@example.com`   | A user with tenant wide permissions, but owns a team |
| `admin.usersen@example.com` | A user with all permissions                          |

You can specify which user to run as through `.env`.
See `.env.example` for an example.

### Using OAUTH

To use the oauth flow, you need to configure `api` with correct credentials, and the user has to exist in the database.
