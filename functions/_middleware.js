const CANONICAL_HOST = "qwertycoin.org";
const REDIRECT_HOSTS = new Set([
  "integration.qwertycoin.org",
  "www.qwertycoin.org"
]);

function canonicalPath(pathname) {
  if (pathname === "/index.html") return "/";
  if (pathname === "/de/index.html") return "/de/";
  return pathname;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const normalizedPath = canonicalPath(url.pathname);
  const needsHostRedirect = REDIRECT_HOSTS.has(url.hostname);
  const needsPathRedirect = normalizedPath !== url.pathname;

  if (needsHostRedirect || needsPathRedirect) {
    url.hostname = CANONICAL_HOST;
    url.pathname = normalizedPath;
    return Response.redirect(url.toString(), 308);
  }

  const response = await context.next();

  if (url.hostname.endsWith(".pages.dev")) {
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow, max-image-preview:large");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  return response;
}
