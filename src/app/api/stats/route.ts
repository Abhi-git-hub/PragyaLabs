import { NextResponse } from "next/server";

/**
 * GET /api/stats — server-side Cloudflare proxy (TRD v2 §3.4).
 * The API token lives in env vars and NEVER reaches the browser.
 * Without CF_API_TOKEN + CF_ZONE_ID configured, responds 503 and the
 * LiveStats component renders nothing (progressive enhancement).
 */
export const revalidate = 300;

type StatsPayload =
  | { ok: true; requests7d: number; fetchedAt: string }
  | { ok: false };

export async function GET(): Promise<NextResponse<StatsPayload>> {
  const token = process.env.CF_API_TOKEN;
  const zone = process.env.CF_ZONE_ID;
  if (!token || !zone) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  try {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query ($zone: String!, $since: Time!) {
          viewer {
            zones(filter: { zoneTag: $zone }) {
              httpRequests1dGroups(limit: 7, filter: { datetime_gt: $since }) {
                sum { requests }
              }
            }
          }
        }`,
        variables: { zone, since },
      }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 503 });
    const json = await res.json();
    const groups: Array<{ sum?: { requests?: number } }> =
      json?.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];
    const requests7d = groups.reduce((n, g) => n + (g.sum?.requests ?? 0), 0);
    if (!Number.isFinite(requests7d) || requests7d <= 0) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json({ ok: true, requests7d, fetchedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
