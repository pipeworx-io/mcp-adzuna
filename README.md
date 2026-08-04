# @pipeworx/adzuna

Adzuna MCP — global job-board aggregator (~1.5M live jobs across 16 countries). Free tier: 250 calls/month.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Adzuna data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
