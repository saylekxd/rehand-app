// Supabase Edge Function: RevenueCat Webhook → upsert user_subscriptions
// Deploy: supabase functions deploy revenuecat-webhook
// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REVENUECAT_WEBHOOK_SECRET

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') ?? '';
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const authToken = Deno.env.get('REVENUECAT_AUTH_TOKEN') ?? '';

type UpsertPayload = {
  user_id: string;
  entitlement_id: string;
  product_id: string | null;
  purchase_platform: string | null;
  original_purchase_at: string | null;
  expiration_at: string | null;
  latest_event: unknown;
};

function toIsoFromMs(ms?: number | string | null): string | null {
  if (ms === null || ms === undefined) return null;
  const n = typeof ms === 'string' ? Number(ms) : ms;
  if (!Number.isFinite(n as number)) return null;
  try { return new Date(Number(n)).toISOString(); } catch { return null; }
}

async function verifySignature(raw: Uint8Array, signatureHeader?: string): Promise<boolean> {
  if (!webhookSecret) return true; // allow if secret not set
  if (!signatureHeader) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const expected = signatureHeader.trim();
  return await crypto.subtle.verify('HMAC', key, hexToBytes(expected), raw);
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const raw = new Uint8Array(await req.arrayBuffer());
  // Option A: simple Authorization header check if REVENUECAT_AUTH_TOKEN is set
  if (authToken) {
    const auth = req.headers.get('authorization') || '';
    if (auth.trim() !== `Bearer ${authToken}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  } else {
    // Option B: HMAC signature verification if webhook secret is set
    const signature = req.headers.get('X-Signature') || req.headers.get('X-RevenueCat-Signature') || undefined;
    const ok = await verifySignature(raw, signature);
    if (!ok) return new Response('Invalid signature', { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // RevenueCat can send v2 events under body.event, but handle both
  const event = body.event ?? body;
  const type: string = event.type ?? event.event_type ?? 'unknown';
  const appUserId: string | null = event.app_user_id ?? event.appUserId ?? event.app_user ?? null;
  if (!appUserId) return new Response('Missing app_user_id', { status: 400 });

  const entitlementId: string = event.entitlement_identifier ?? event.entitlement_id ?? 'premium';
  const productId: string | null = event.product_identifier ?? event.product_id ?? null;
  const platform: string | null = event.store ?? event.platform ?? null; // app_store / play_store
  const originalPurchaseAt: string | null =
    toIsoFromMs(event.original_purchase_date_ms ?? event.purchased_at_ms ?? event.event_timestamp_ms) ??
    (event.original_purchase_date ?? null);
  const expirationAt: string | null =
    toIsoFromMs(
      event.expires_date_ms ??
      event.expiration_at_ms ??
      event.current_period_end_ms ??
      event.expiration_ms ??
      event.expiry_at_ms
    ) ?? (event.expires_date ?? null);

  const payload: UpsertPayload = {
    user_id: appUserId,
    entitlement_id: entitlementId,
    product_id: productId,
    purchase_platform: platform,
    original_purchase_at: originalPurchaseAt,
    expiration_at: expirationAt,
    latest_event: event,
  };

  // For cancellation-like events, if no expiration provided, set to now()
  if (!payload.expiration_at && ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE'].includes(type)) {
    payload.expiration_at = new Date().toISOString();
  }

  // Ensure user exists in auth before upsert to satisfy FK
  try {
    const { data: userCheck } = await supabase.auth.admin.getUserById(appUserId);
    if (!userCheck?.user) {
      // Skip silently to avoid RC retries; the app should call Purchases.logIn(userId)
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'user_not_found' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (_) {
    // If admin lookup fails, still try upsert — let FK enforce integrity
  }

  const { error } = await supabase.from('user_subscriptions').upsert(payload, { onConflict: 'user_id,entitlement_id' });
  if (error) {
    return new Response(JSON.stringify({ ok: false, error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});


