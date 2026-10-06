# Overlevering: prioriteringsgrupper for CVE-er

API-støtten i `nais/api` og integrasjonen i Console er implementert. Denne overleveringen dokumenterer kontrakten for tre globale CVE-grupper med egne totaler og uavhengig paginering: High, Elevated og Monitor.

## Bakgrunn

Frontend hentet tidligere 20 CVE-er, grupperte disse lokalt og sorterte dem etter alvorlighetsgrad. Det ga misvisende gruppetall og sortering mellom sider: MEDIUM på side 1 kunne komme før CRITICAL på side 2.

«High (20)» telte bare High-CVE-ene på gjeldende side, mens pagineringens totaltall gjaldt hele CVE-listen. Den grupperte layouten er bevart, men filtrering, sortering og totaltall kommer nå fra API-et.

Frontend-koden som bruker dataene:

- [CVE-query](<../src/routes/vulnerabilities/(single)/cves/query.gql>)
- [Load-funksjon](<../src/routes/vulnerabilities/(single)/cves/+page.ts>)
- [Gruppevisning og paginering](<../src/routes/vulnerabilities/(single)/cves/+page.svelte>)
- [Gruppering](../src/lib/domain/vulnerability/CvesGroupedByPriority.svelte)

## API-kontrakt

Eksisterende `cves`-connection har et valgfritt prioritetsfilter:

```graphql
input CVEFilter {
	priority: CVEPriority
}
```

`Query.cves` tar argumentet `filter: CVEFilter`.

Filteret bruker eksisterende `CVEPriority`. Globale CVE-er tildeles `HIGH`, `ELEVATED` eller `MONITOR`. `URGENT` krever workload-kontekst og gir derfor ingen treff ved global CVE-filtrering. Uten filter bevares eksisterende oppførsel og utvalg.

## Krav

- Filtrer etter beregnet `riskAssessment.priority` før paginering.
- `pageInfo.totalCount` skal telle hele det filtrerte utvalget, ikke bare siden.
- Støtt både `first/after` og `last/before`.
- Ved `PRIORITY` med `ASC` for globale CVE-er: High → Elevated → Monitor.
- Definer global sekundærsortering etter alvorlighetsgrad, høyest først, og en stabil unik tie-breaker. Frontend skal ikke ettersortere hver side.
- Behold eksisterende avgrensning til aktive CVE-er for tilgjengelige workloads og eksisterende tilgangskontroll.
- Tre aliaser i samme query skal fungere uten unødvendig gjentatt beregning av hele CVE-utvalget.
- Ikke bruk store `first`-verdier som løsning.

Eksempel på frontendens bruk:

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

Urgent krever workload-kontekst, inkludert internettilgjengelighet, og tildeles ikke CVE-er globalt. En KEV-oppføring alene betyr ikke Urgent; KEV-merkede CVE-er kan derfor vises under High. Frontend viser prioriteten fra API-et og beregner den ikke selv.

## Frontend-integrasjon

Console bruker det oppdaterte, genererte skjemaet og kobler tre serverfiltrerte grupper til API-totaler og separate cursors: High, Elevated og Monitor. Ingen global Urgent-gruppe hentes.

Houdini tillater bare én `@paginate` per dokument, så kontrakten må kunne brukes med separate queryer eller eksplisitte cursor-variabler per alias.

Ikke rediger frontendens genererte schema manuelt.
