# Overlevering: prioriteringsgrupper for team

Implementer API-støtte i `nais/api` for korrekte, paginerte prioriteringsgrupper av team i Console.

## Bakgrunn

Console henter i dag 20 team sortert etter KEV-antall og grupperer deretter denne siden i High/Elevated/Monitor. Det gir misvisende grupper og antall som bare gjelder den aktuelle siden. Vi ønsker å beholde den grupperte layouten, ikke gå over til en flat liste.

Frontend-koden som bruker dataene:

- [Team-query](<../src/routes/vulnerabilities/(single)/query.gql>)
- [Load-funksjon](<../src/routes/vulnerabilities/(single)/teams/+page.ts>)
- [Gruppering](../src/lib/domain/vulnerability/TeamsGroupedByUrgency.svelte)

## Ønsket kontrakt

Utvid helst eksisterende `teams`-connection med et valgfritt filter for teamets **høyeste operative sårbarhetsprioritet**. Et dedikert felt er også mulig dersom det passer API-arkitekturen bedre.

Gruppene skal være gjensidig utelukkende:

- **High:** `countsByPriority.highRisk > 0`.
- **Elevated:** ingen High-funn, men `elevatedRisk > 0`.
- **Monitor:** verken High eller Elevated, men `monitor > 0`.
- **Ingen prioriterte funn:** alle tre tellingene er null.

KEV-antall og CVSS-severity må ikke brukes som erstatning for operativ prioritet.

## Krav

- Filtrer og sorter **før** paginering.
- Hver gruppe må kunne hentes med egne cursors.
- `pageInfo.totalCount` skal telle alle team i gruppen, ikke bare gjeldende side.
- Behold `hasWorkloads: true` og eksisterende tilgangsregler.
- Tilby deterministisk sortering innen gruppen, gjerne etter gruppens finding-antall synkende, med team-slug som tie-breaker.
- Behold eksisterende oppførsel når det nye filteret ikke brukes.
- Unngå store `first`-verdier som løsning.

## Akseptansekriterier

- Test med flere enn 20 team og blandede prioriteringer.
- High-team skal kunne hentes uavhengig av deres KEV-antall.
- Et team med både High- og Elevated-funn skal bare inngå i High-gruppen.
- Totaltall skal være korrekte gjennom neste/forrige side.
- Test null/ingen sårbarhetsdata og team uten workloads etter eksisterende semantikk.

## Frontend-integrasjon

API-agenten skal levere schema-endringen, implementasjon, tester og eksempelquery. Console oppdaterer deretter generert schema og kobler hver gruppe til egen paginering. Ikke rediger frontendens genererte schema manuelt.

Houdini tillater bare én `@paginate` per dokument, så kontrakten må kunne brukes med separate queryer eller eksplisitte cursor-variabler.

Denne oppgaven gjelder **teamgrupperingen**, ikke den separate «Urgent»-metrikken.
