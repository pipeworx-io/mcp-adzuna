# mcp-adzuna

Adzuna MCP — global job-board aggregator

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search jobs in a country. country is required (ISO-style: gb, us, ca, de, fr, ...). |
| `categories` | Adzuna's normalized job-category list for a country. |
| `salary_histogram` | Wage distribution for jobs matching a query. |
| `top_companies` | Companies posting the most jobs matching the filter. |
| `history` | Historical job-volume / mean-salary monthly time series. |
| `regional_stats` | Current job counts by region. |

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

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
