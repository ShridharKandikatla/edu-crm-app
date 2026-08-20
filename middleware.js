const BOT_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'pinterestbot',
  'slackbot',
  'whatsapp',
  'applebot',
  'discordbot',
  'redditbot',
  'tumblr',
  'flipboard',
  'vkShare',
  'w3c_validator',
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',
  'claudebot',
  'anthropic-ai',
  'perplexitybot',
  'google-extended',
  'ccbot',
  'ia_archiver',
  'semrushbot',
  'ahrefsbot',
];

function isBot(ua) {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(function (bot) {
    return lower.includes(bot);
  });
}

function isPrerenderable(pathname) {
  if (pathname === '/' || pathname === '/apply') return true;
  return false;
}

export default async function middleware(request) {
  var ua = request.headers.get('user-agent') || '';
  var url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!isPrerenderable(url.pathname)) return;
  if (!isBot(ua)) return;

  var token = globalThis.process && globalThis.process.env && globalThis.process.env.PRERENDER_TOKEN;
  if (!token) return;

  var prerenderUrl =
    'https://service.prerender.io/' + url.origin + url.pathname + url.search;

  try {
    var res = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': token,
        'User-Agent': ua,
      },
    });

    if (res.ok) {
      var body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Prerendered': 'true',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }
  } catch {
    // Fall through to SPA on failure
  }
}

export const config = {
  matcher: ['/', '/apply', '/apply/:path*'],
};
