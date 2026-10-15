const GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories';
const STACK_EXCHANGE_SEARCH_URL = 'https://api.stackexchange.com/2.3/search/advanced';
const WIKIPEDIA_SEARCH_URL = 'https://en.wikipedia.org/w/api.php';

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function escapeHtml(text = '') {
  return new DOMParser().parseFromString(text, 'text/html').body.textContent || '';
}

export async function searchOnlineScenarios(query) {
  const searchTerm = query.trim();
  if (!searchTerm) throw new Error('Enter a topic to search online.');

  const requests = [
    {
      source: 'GitHub',
      search: async () => {
        const params = new URLSearchParams({
          q: `${searchTerm} low level design interview`,
          sort: 'stars',
          per_page: '5'
        });
        const data = await fetchJson(`${GITHUB_SEARCH_URL}?${params}`);
        return (data.items || []).map(item => ({
          title: item.name.replace(/[-_]/g, ' '),
          description: item.description || `Open-source project related to ${searchTerm}.`,
          url: item.html_url,
          source: 'GitHub',
          prompt: `${item.name.replace(/[-_]/g, ' ')}. ${item.description || ''}`.trim()
        }));
      }
    },
    {
      source: 'Stack Overflow',
      search: async () => {
        const params = new URLSearchParams({
          site: 'stackoverflow',
          q: searchTerm,
          tagged: 'design-patterns',
          pagesize: '5',
          order: 'desc',
          sort: 'votes'
        });
        const data = await fetchJson(`${STACK_EXCHANGE_SEARCH_URL}?${params}`);
        return (data.items || []).map(item => ({
          title: escapeHtml(item.title),
          description: `Community design discussion${item.answer_count ? ` · ${item.answer_count} answers` : ''}`,
          url: item.link,
          source: 'Stack Overflow',
          prompt: `${escapeHtml(item.title)}. Use this community design discussion as inspiration for a low-level design interview scenario.`
        }));
      }
    },
    {
      source: 'Wikipedia',
      search: async () => {
        const params = new URLSearchParams({
          action: 'query',
          list: 'search',
          srsearch: searchTerm,
          format: 'json',
          origin: '*',
          srlimit: '5'
        });
        const data = await fetchJson(`${WIKIPEDIA_SEARCH_URL}?${params}`);
        return (data.query?.search || []).map(item => ({
          title: item.title,
          description: escapeHtml(item.snippet),
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          source: 'Wikipedia',
          prompt: `${item.title}. ${escapeHtml(item.snippet)}`
        }));
      }
    }
  ];

  const outcomes = await Promise.all(requests.map(async request => {
    try {
      return { results: await request.search(), error: null };
    } catch (error) {
      return { results: [], error: `${request.source}: ${error.message}` };
    }
  }));
  const results = outcomes.flatMap(outcome => outcome.results);
  const errors = outcomes.map(outcome => outcome.error).filter(Boolean);

  if (results.length === 0 && errors.length > 0) {
    throw new Error(`Online search failed. ${errors.join(' ')}`);
  }

  return { results, errors };
}

async function fetchGithubRepository(url) {
  const match = url.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/tree\/[^/]+(?:\/.*)?)?\/?$/);
  if (!match) return null;

  const [, owner, repository] = match;
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
  const repo = await fetchJson(apiUrl);
  let readme = '';

  try {
    const data = await fetchJson(`${apiUrl}/readme`);
    const bytes = Uint8Array.from(atob(data.content.replace(/\s/g, '')), character => character.charCodeAt(0));
    readme = new TextDecoder().decode(bytes).slice(0, 6000);
  } catch (error) {
    if (!error.message.includes('HTTP 404')) throw error;
  }

  const title = repo.name.replace(/[-_]/g, ' ');
  return {
    title,
    description: [repo.description, readme].filter(Boolean).join('\n\n').slice(0, 6000),
    url: repo.html_url,
    source: 'GitHub URL',
    prompt: `${title}. ${repo.description || ''}\n\n${readme}`.trim()
  };
}

export async function fetchScenarioSource(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error('Enter a valid public URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only public HTTP and HTTPS URLs are supported.');
  }

  if (url.hostname === 'github.com') {
    const githubResult = await fetchGithubRepository(url);
    if (githubResult) return githubResult;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  let response;
  try {
    response = await fetch(url.toString(), { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) throw new Error(`The source returned HTTP ${response.status}.`);

  const contentType = response.headers.get('content-type') || '';
  const content = await response.text();
  const documentContent = contentType.includes('html')
    ? (() => {
      const parsed = new DOMParser().parseFromString(content, 'text/html');
      parsed.querySelectorAll('script, style, nav, footer, iframe, svg').forEach(element => element.remove());
      return {
        title: parsed.title || url.hostname,
        text: parsed.body?.innerText || parsed.body?.textContent || ''
      };
    })()
    : { title: url.hostname, text: content };
  const excerpt = documentContent.text.replace(/\s+/g, ' ').trim().slice(0, 6000);

  if (!excerpt) throw new Error('No readable text was found at that URL.');

  return {
    title: documentContent.title,
    description: excerpt,
    url: url.toString(),
    source: url.hostname,
    prompt: `${documentContent.title}. ${excerpt}`
  };
}
