/**
 * Proxies API requests to the backend. Use from the frontend as /api/proxy/qhse/...
 * so the browser hits same origin (avoids CORS). Server forwards to NEXT_PUBLIC_API_BASE_URL.
 */
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function GET(request, context) {
  const params = await context.params;
  return proxy(request, params);
}

export async function POST(request, context) {
  const params = await context.params;
  return proxy(request, params);
}

export async function PUT(request, context) {
  const params = await context.params;
  return proxy(request, params);
}

export async function PATCH(request, context) {
  const params = await context.params;
  return proxy(request, params);
}

export async function DELETE(request, context) {
  const params = await context.params;
  return proxy(request, params);
}

async function proxy(request, params) {
  if (!baseUrl) {
    return Response.json(
      { error: "NEXT_PUBLIC_API_BASE_URL is not set on the server." },
      { status: 500 }
    );
  }

  const path = params.path;
  const pathSegment = Array.isArray(path) ? path.join("/") : path;
  const url = `${baseUrl.replace(/\/$/, "")}/api/${pathSegment}`;

  try {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === "host" || lower === "connection") return;
      headers.set(key, value);
    });

    const options = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
      options.body = await request.text();
    }

    const backendRes = await fetch(url, options);
    const contentType = backendRes.headers.get("content-type") || "";
    const text = await backendRes.text();

    return new Response(text, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: {
        "Content-Type": contentType || "application/json",
      },
    });
  } catch (err) {
    console.error("[proxy] fetch error:", err.message, "url:", url);
    return Response.json(
      {
        error: "Backend request failed.",
        message: err.message,
        hint: "Check that NEXT_PUBLIC_API_BASE_URL in .env.local points to your running backend and restart the dev server.",
      },
      { status: 502 }
    );
  }
}
