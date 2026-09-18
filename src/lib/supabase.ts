import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// `.env` ships with both keys empty until a real Supabase project exists (see .env.example).
// `createClient('', '')` throws immediately, so this only ever constructs a client once real
// values are present — every other module reads `supabase` as `null` and falls back to
// localStorage, exactly like today, until someone fills in the two env vars.
export const supabaseConfigured = Boolean(url && anonKey);

const DEVICE_KEY = 'sapie_device_id';
const DEVICE_SECRET_KEY = 'sapie_device_secret';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// A second, separate random value from `device_id` — sent as a header on every request so RLS
// (see supabase/migrations/20260917120000_secure_device_progress_rls.sql) can tell "the device
// that owns this row" apart from "anyone who has the public anon key". `device_id` alone can't
// serve as that credential: it's the row's own primary key, sent in every `.eq('device_id', …)`
// filter, so it's not a secret — nothing stops a request from swapping in a different device_id.
export function getDeviceSecret(): string {
  let secret = localStorage.getItem(DEVICE_SECRET_KEY);
  if (!secret) {
    secret = crypto.randomUUID();
    localStorage.setItem(DEVICE_SECRET_KEY, secret);
  }
  return secret;
}

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { 'x-device-secret': getDeviceSecret() } },
    })
  : null;
