interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Adzuna MCP — global job-board aggregator
 *
 * Auth: app_id + app_key both required, passed as query params.
 * Free tier: 250 calls/mo.
 *
 * Docs: https://developer.adzuna.com/docs/search
 */


const BASE = 'https://api.adzuna.com/v1/api/jobs';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search jobs in a country. country is required (ISO-style: gb, us, ca, de, fr, ...).',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'gb, us, ca, de, fr, ...' },
        what: { type: 'string', description: 'Free-text query (title + description)' },
        what_phrase: { type: 'string', description: 'Exact-phrase variant of `what`' },
        where: { type: 'string', description: 'Location (city, region)' },
        distance: { type: 'number', description: 'Search radius from `where`, in km' },
        results_per_page: { type: 'number', description: '1-50 (default 20)' },
        page: { type: 'number', description: '1-based page (default 1)' },
        salary_min: { type: 'number', description: 'Lower bound, in local currency' },
        salary_max: { type: 'number', description: 'Upper bound' },
        full_time: { type: 'boolean' },
        permanent: { type: 'boolean' },
        sort: { type: 'string', description: 'default | hybrid | date | salary | relevance' },
        max_days_old: { type: 'number', description: 'Restrict to jobs posted in the last N days' },
      },
      required: ['country'],
    },
  },
  {
    name: 'categories',
    description: "Adzuna's normalized job-category list for a country.",
    inputSchema: {
      type: 'object',
      properties: { country: { type: 'string' } },
      required: ['country'],
    },
  },
  {
    name: 'salary_histogram',
    description: 'Wage distribution for jobs matching a query.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        what: { type: 'string' },
        where: { type: 'string' },
        location_filter: { type: 'string', description: 'Adzuna location id (e.g. "London")' },
      },
      required: ['country'],
    },
  },
  {
    name: 'top_companies',
    description: 'Companies posting the most jobs matching the filter.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        what: { type: 'string' },
        where: { type: 'string' },
      },
      required: ['country'],
    },
  },
  {
    name: 'history',
    description: 'Historical job-volume / mean-salary monthly time series.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        months: { type: 'number', description: '1-100 (default 12)' },
        location: { type: 'string' },
        category: { type: 'string', description: 'Adzuna category tag (from `categories` tool)' },
      },
      required: ['country'],
    },
  },
  {
    name: 'regional_stats',
    description: 'Current job counts by region.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        location_filter: { type: 'string' },
        category: { type: 'string' },
      },
      required: ['country'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) {
    throw new Error(
      'Adzuna requires app_id and app_key. Contact the operator about platform credentials, or BYO via ?_apiKey=<app_id>:<app_key> after registering at https://developer.adzuna.com/.',
    );
  }
  const colon = apiKey.indexOf(':');
  if (colon < 1 || colon === apiKey.length - 1) {
    throw new Error('Adzuna _apiKey must be "<app_id>:<app_key>".');
  }
  const appId = apiKey.slice(0, colon);
  const appKey = apiKey.slice(colon + 1);
  const country = reqStr(args, 'country', '"us"').toLowerCase();

  const auth = new URLSearchParams({ app_id: appId, app_key: appKey, 'content-type': 'application/json' });

  switch (name) {
    case 'search': {
      const page = String(Math.max(1, (args.page as number) ?? 1));
      const params = new URLSearchParams(auth);
      params.set('results_per_page', String(Math.min(50, Math.max(1, (args.results_per_page as number) ?? 20))));
      if (args.what) params.set('what', String(args.what));
      if (args.what_phrase) params.set('what_phrase', String(args.what_phrase));
      if (args.where) params.set('where', String(args.where));
      if (args.distance !== undefined) params.set('distance', String(args.distance));
      if (args.salary_min !== undefined) params.set('salary_min', String(args.salary_min));
      if (args.salary_max !== undefined) params.set('salary_max', String(args.salary_max));
      if (args.full_time === true) params.set('full_time', '1');
      if (args.permanent === true) params.set('permanent', '1');
      if (args.sort) params.set('sort_by', String(args.sort));
      if (args.max_days_old !== undefined) params.set('max_days_old', String(args.max_days_old));
      return adzunaGet(`/${country}/search/${page}?${params}`);
    }
    case 'categories':
      return adzunaGet(`/${country}/categories?${auth}`);
    case 'salary_histogram': {
      const params = new URLSearchParams(auth);
      if (args.what) params.set('what', String(args.what));
      if (args.where) params.set('where', String(args.where));
      if (args.location_filter) params.set('location0', String(args.location_filter));
      return adzunaGet(`/${country}/histogram?${params}`);
    }
    case 'top_companies': {
      const params = new URLSearchParams(auth);
      if (args.what) params.set('what', String(args.what));
      if (args.where) params.set('where', String(args.where));
      return adzunaGet(`/${country}/top_companies?${params}`);
    }
    case 'history': {
      const params = new URLSearchParams(auth);
      params.set('months', String(Math.min(100, Math.max(1, (args.months as number) ?? 12))));
      if (args.location) params.set('location0', String(args.location));
      if (args.category) params.set('category', String(args.category));
      return adzunaGet(`/${country}/history?${params}`);
    }
    case 'regional_stats': {
      const params = new URLSearchParams(auth);
      if (args.location_filter) params.set('location0', String(args.location_filter));
      if (args.category) params.set('category', String(args.category));
      return adzunaGet(`/${country}/geodata?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function adzunaGet(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (res.status === 401) throw new Error('Adzuna: unauthorized — check app_id/app_key');
  if (res.status === 429) throw new Error('Adzuna: rate-limit / quota exhausted');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Adzuna error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
