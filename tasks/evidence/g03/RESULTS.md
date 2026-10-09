# G03 assisted agent proxy results

Dependency G02 was independently verified and shipped PR33 at `5555b04`. The user explicitly substituted three separate agent personas because no unfamiliar human developers were available. [Protocol](PROTOCOL.md) records the packet, assistance and limits; separate receipts preserve all three runs.

| Persona                          | Install/ingest/query                             |                                Elapsed including cleanup | Answer |
| -------------------------------- | ------------------------------------------------ | -------------------------------------------------------: | ------ |
| JavaScript application developer | Completed with general agent protocol assistance |                                            236.2 seconds | Invite |
| Python backend developer         | Completed with general agent protocol assistance | 216 seconds from timestamps; first answer at 192 seconds | Invite |
| Platform engineer                | Completed with general agent protocol assistance |                                              196 seconds | Invite |

All verified the same private tarball SHA256 `92c15a0430ed9081bb91d9d967ed7157bb64b27d53e7c36d9d1aca5dd4224082`, used Node24, separately installed/rebuilt SQLite, initialized, ingested the supplied fixture and retrieved scoped stored evidence within ten minutes. All closed their stdio processes, removed their private prefixes/caches and reported verified absence. Independent review checked the packet and receipt consistency; per-run IDs/times are the trial agents' bounded observations, not later live database attestation after deletion.

The fixture date is 7 October 2026; all reports correctly classify it stale/requires_check. These observations establish the supplied fixture's Invite label, not current application behavior. No separate service or browser was needed. A doctor browser-existence result is not launch qualification.

Friction was consistent: restricted-network installation stalls/ENOTFOUND followed by successful authorized escalation; native allowScripts warnings; `--help` returning INVALID_CONFIG; schema inspection and general MCP/JSON-RPC knowledge needed to construct external fixture ingest/query calls; README source-doc links absent from the tarball; control IDs not accepted by capture/annotation-only `wg_evidence`. The JavaScript persona also encountered an unavailable MCP-client import and a redundant install retry. The platform persona tried an unsuccessful lexical synonym and a sandbox-refused auxiliary process check. These were preserved, not edited into an effortless installation narrative.

**Amended proxy procedure completed; original human-adoption gate remains unmet.** Agents received valid settings, a fixture, the Node path and setup constraints, and used protocol expertise beyond the packaged guide. Simulated personas are not three unfamiliar humans, an unaided clean-machine trial, host discovery, application mapping, browser use or second-host/second-application evidence. The exact final artifact is independently reviewed in `independent-review.json` and bound by `artifact-sha256.json`. No publication occurred.
