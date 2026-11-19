# Pilot Plan (Client Engineering, 3 to 4 weeks)

Illustrative demo built with IBM Bob. Targets below are goals to prove, not results.

## Executive summary

Prove, on the bank's own estate, that a backup from three or more years ago can be located and validated in under 15 minutes with a complete evidence trail, without developer involvement. The mock demo shows the flow; the pilot connects it to real IBM Z systems.

## Objectives

1. **Time:** locate and validate an old Db2 backup in under 15 minutes (baseline: days).
2. **Traceability:** 100% of checks recorded with source system, timestamp and operator, accepted by internal audit.
3. **Capacity:** no developer time needed for the trace (baseline: developers lead the search today).

## Success criteria

| Metric | Baseline | Target | Method |
|---|---|---|---|
| Time to locate and validate a 3-year-old backup | Days (to be measured in Sprint 0) | Under 15 min | Timed runs on 10 agreed historical requests |
| Evidence completeness | Ad hoc | 100% of checks logged | Audit review of evidence packages |
| Developer hours per request | To be measured | 0 | Time log |
| Requests that end in a documented gap | Found late | Reported with evidence | Review of gap cases |

## Sprints

**Sprint 0 (2 to 3 days): environment and access.** Confirm ADDI scope and project, Db2 subsystem access (read-only), z/OS catalog, HSM and tape inventory access, security approvals, baseline measurement of the current process, the 10 test requests. Confirm Assistant for Z deployment prerequisites.

**Sprint 1 (weeks 1 to 2): discovery and lookup.** Scan the relevant applications in ADDI; build the lineage from batch jobs to Db2 objects; implement catalog and storage lookups; first end-to-end trace on non-production data.

**Sprint 2 (weeks 2 to 3): conversation, evidence, hardening.** Configure the conversational entry point; build the evidence package and its export; run the 10 test requests; review gap handling with audit.

**Sprint 3 (weeks 3 to 4): validation and handover.** End-to-end timed runs, security review, documentation, knowledge transfer, results readout against the criteria above.

## Team

Tech Sales (1), Client Engineers (1 to 2), Z / Db2 DBA from the bank (1), mainframe application owner (1), internal audit reviewer (1), PM (1).

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Backup metadata truly gone for some periods | Cannot prove some backups | Treat as findings; the evidence package documents the gap |
| ADDI coverage of older or unscanned applications | Incomplete lineage | Scope the first pilot to named applications |
| Access approvals on production Db2 and storage | Delay | Start in Sprint 0; read-only first |
| Product capability assumptions in this demo | Rework | Verify ADDI and Assistant for Z capabilities with product teams before commitments |

## Post-pilot roadmap

Extend to more subsystems and applications, scheduled evidence refresh, integration with the bank's audit tooling, and a review of backup metadata retention policy so the catalog problem does not recur.
