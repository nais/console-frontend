# Overlevering: prioriteringsgrupper for CVE-er

Implementer API-støtte i `nais/api` slik at Console kan vise prioritetsgrupper av CVE-er med egne totaler og uavhengig paginering.

## Bakgrunn

Frontend henter 20 CVE-er, grupperer disse lokalt og sorterer dem etter alvorlighetsgrad. Det gir misvisende gruppetall og sortering mellom sider: MEDIUM på side 1 kan komme før CRITICAL på side 2.

«High (20)» teller bare High-CVE-ene på gjeldende side, mens pagineringens totaltall gjelder hele CVE-listen. Vi ønsker å beholde den grupperte layouten.

Frontend-koden som bruker dataene:

- [CVE-query](<../src/routes/vulnerabilities/(single)/cves/query.gql>)
- [Load-funksjon](<../src/routes/vulnerabilities/(single)/cves/+page.ts>)
- [Lokal sortering og paginering](<../src/routes/vulnerabilities/(single)/cves/+page.svelte>)
- [Gruppering](../src/lib/domain/vulnerability/CvesGroupedByPriority.svelte)

## Ønsket kontrakt

Behold eksisterende `cves`-connection, og legg til et valgfritt prioritetsfilter. Forslag:

```graphql
input CVEFilter {
	priority: CVEPriority
}
```

Legg til `filter: CVEFilter` som argument på eksisterende `Query.cves`.

Bruk eksisterende `CVEPriority`: `URGENT`, `HIGH`, `ELEVATED`, `MONITOR`. Uten filter skal eksisterende oppførsel og utvalg bevares.

## Krav

- Filtrer etter beregnet `riskAssessment.priority` før paginering.
- `pageInfo.totalCount` skal telle hele det filtrerte utvalget, ikke bare siden.
- Støtt både `first/after` og `last/before`.
- Ved `PRIORITY` med `ASC`: Urgent → High → Elevated → Monitor.
- Definer global sekundærsortering etter alvorlighetsgrad, høyest først, og en stabil unik tie-breaker. Frontend skal ikke ettersortere hver side.
- Behold eksisterende avgrensning til aktive CVE-er for tilgjengelige workloads og eksisterende tilgangskontroll.
- Fire aliaser i samme query skal fungere uten unødvendig gjentatt beregning av hele CVE-utvalget.
- Ikke bruk store `first`-verdier som løsning.

Eksempel på frontendens bruk etter API-endringen:

```graphql
query HighPriorityCves {
	high: cves(first: 20, filter: { priority: HIGH }, orderBy: { field: PRIORITY, direction: ASC }) {
		pageInfo {
			totalCount
			endCursor
			hasNextPage
		}
		edges {
			node {
				identifier
			}
		}
	}
}
```

## Akseptansekriterier

- Test med mer enn 20 CVE-er i én prioritet, blandet med andre prioriteter.
- Riktige globale totaler for hvert filter, inkludert tomme grupper.
- Fremover og bakover gir sammenhengende sider uten duplikater eller utelatelser når datasettet er uendret.
- Mange like prioriteringer og alvorlighetsgrader gir deterministisk rekkefølge.
- Eksisterende kall uten filter fungerer fortsatt.

## Avklaring: KEV og Urgent

Skjermbildene fra Console viser KEV-merkede CVE-er under High, mens schema beskriver Urgent som aktivt utnyttede sårbarheter. Undersøk om klassifiseringen er korrekt og konsistent med kontrakten. Frontend skal ikke kompensere ved å beregne prioritet selv.

## Frontend-integrasjon

API-agenten skal levere schema-endringen, implementasjon, tester og eksempelquery. Console oppdaterer deretter generert schema og kobler fire serverfiltrerte grupper til API-totaler og separate cursors.

Houdini tillater bare én `@paginate` per dokument, så kontrakten må kunne brukes med separate queryer eller eksplisitte cursor-variabler per alias.

Ikke rediger frontendens genererte schema manuelt.
