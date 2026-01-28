# AGENTS.md - Console Frontend

Kjøreregler for AI-agenter som jobber med dette prosjektet.

## Prosjektstruktur

- **SvelteKit** med Svelte 5 og TypeScript
- **Houdini** for GraphQL klient
- **Tailwind CSS** for styling
- Komponenter i `src/lib/`
- Ruter i `src/routes/`
- GraphQL queries i `*.gql` filer ved siden av komponenter

## Vanlige kommandoer

| Oppgave                 | Kommando            |
| ----------------------- | ------------------- |
| Installer avhengigheter | `npm install`       |
| Kjør lokalt             | `npm run dev`       |
| Bygg                    | `npm run build`     |
| Typesjekk               | `npm run check`     |
| Lint                    | `npm run lint`      |
| Formater kode           | `npm run format`    |
| Kjør tester             | `npm run test`      |
| Storybook               | `npm run storybook` |

## Arbeidsflyt

1. **Før du endrer kode**: Les relevante filer for å forstå eksisterende mønstre
2. **Etter endringer i `.gql`**: Houdini genererer automatisk, men kjør `npm run check` for å verifisere
3. **Etter alle endringer**: Kjør `npm run check` og `npm run format`
4. **Ved TypeScript-feil**: Sjekk at Houdini-typer er generert

## GraphQL

- Queries/mutations ligger i `.gql` filer ved siden av komponentene som bruker dem
- Houdini genererer metoder automatisk ved `npm run dev`
- **Bruk alltid de genererte metodene** - ikke lag egne
- Schema hentes fra endpoint konfigurert i `.env` (`VITE_SCHEMA_ENDPOINT`)

### Schema endpoint

Konfigurer i `.env`:

```bash
# Mot lokal API
VITE_SCHEMA_ENDPOINT="http://localhost:3000/graphql"

# Mot API via nais proxy
VITE_SCHEMA_ENDPOINT="http://localhost:4242/graphql"
```

### Arbeidsflyt for nye queries/mutations

1. Legg til query/mutation i en `.gql` fil
2. Kjør `npm run dev` (eller `npx houdini generate`)
3. Bruk de genererte metodene i koden

## Viktige konvensjoner

- **Svelte 5**: Bruk runes (`$state`, `$derived`, `$effect`) - ikke legacy reactive statements
- **Komponenter**: PascalCase filnavn (f.eks. `MyComponent.svelte`)
- **Formattering**: Prettier med svelte og tailwind plugins
- **Styling**: Tailwind CSS klasser, unngå inline styles

## Testbrukere (lokal utvikling)

Settes i `.env` fil:

| Bruker                      | Beskrivelse            |
| --------------------------- | ---------------------- |
| `dev.usersen@example.com`   | Vanlig bruker med team |
| `admin.usersen@example.com` | Administrator          |

## Lokal utvikling

```bash
npm install
cp .env.example .env
npm run dev
```

For å koble til lokal API, kjør `nais alpha api proxy` på host-maskinen.
