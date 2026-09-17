# @pipeworx/adzuna

Adzuna MCP — global job-board aggregator (~1.5M live jobs across 16 countries). Free tier: 250 calls/month.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

- `search(country, what?, where?, distance?, results_per_page?, page?, salary_min?, salary_max?, full_time?, permanent?, sort?, max_days_old?)`
- `categories(country)` — Adzuna's normalized job categories
- `salary_histogram(country, what?, where?, location_filter?)` — wage distribution
- `top_companies(country, what?, where?)` — companies posting most jobs matching the filter
- `history(country, months?, location?, category?)` — historical job-volume / mean-salary time series
- `regional_stats(country, location_filter?, category?)` — current jobs by region

## Auth

Adzuna uses two query params: `app_id` and `app_key`. Get both at https://developer.adzuna.com/.

- **Platform key:** gateway env `PLATFORM_ADZUNA_KEY` (format `<app_id>:<app_key>`)
- **BYO:** `?_apiKey=<app_id>:<app_key>`

## Country codes

`gb` (UK), `us`, `ca`, `de`, `fr`, `at`, `nl`, `pl`, `it`, `es`, `ru`, `br`, `in`, `mx`, `nz`, `au`, `sg`, `za`.

## Data source

`https://api.adzuna.com/v1/api/jobs/<country>/...`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "adzuna": {
      "url": "https://gateway.pipeworx.io/adzuna/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/adzuna/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Adzuna data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/adzuna_search \
  -H 'Content-Type: application/json' \
  -d '{"country":"gb","what":"python developer","where":"London","results_per_page":25}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/adzuna_search`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
