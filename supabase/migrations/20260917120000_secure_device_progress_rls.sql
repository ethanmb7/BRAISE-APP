/*
# Tighten device_progress / card_reviews RLS with a per-device secret

Problem: the policies from 20260730074908_create_progress_tables.sql grant `USING (true)` to
anon/authenticated on SELECT/UPDATE/DELETE for both tables. VITE_SUPABASE_ANON_KEY ships inside
the client bundle by design (it's meant to be public), so with those policies, anyone holding
that key can call `device_progress.select('*')` with no filter at all and read (or rewrite, or
delete) every device's XP/streak/name/subjects and every card's SM-2 state. There is no per-row
ownership check — only a client-side `.eq('device_id', ...)` convention, which any request made
outside the app entirely bypasses.

Fix: each device now also holds a `device_secret` — a second random UUID, generated client-side
and sent on every request as a custom `x-device-secret` header (never as a URL/query param).
Policies compare the row's stored secret against that header instead of trusting `USING (true)`.
INSERT stays open (a new device has to be able to register itself before any row exists to check
against), but its WITH CHECK requires the inserted secret to match the header, so a client can
only ever create a row it will later be able to prove ownership of.

Not yet verified against a live project: VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are still empty
in .env. `current_setting('request.headers', true)` is a standard, documented PostgREST/Supabase
mechanism for reading forwarded request headers, but confirm the exact RLS behaviour under
`upsert()`'s ON CONFLICT DO UPDATE path once real credentials exist, before relying on this in
production — in particular, an upsert attempt against an existing row with the wrong secret should
be checked to fail cleanly rather than surface a confusing constraint error.
*/

ALTER TABLE device_progress ADD COLUMN IF NOT EXISTS device_secret uuid NOT NULL DEFAULT gen_random_uuid();

CREATE OR REPLACE FUNCTION request_device_secret() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.headers', true)::json->>'x-device-secret', '')::uuid;
$$ LANGUAGE sql STABLE;

DROP POLICY IF EXISTS "anon_select_device_progress" ON device_progress;
CREATE POLICY "anon_select_device_progress" ON device_progress FOR SELECT
  TO anon, authenticated USING (device_secret = request_device_secret());

DROP POLICY IF EXISTS "anon_insert_device_progress" ON device_progress;
CREATE POLICY "anon_insert_device_progress" ON device_progress FOR INSERT
  TO anon, authenticated WITH CHECK (device_secret = request_device_secret());

DROP POLICY IF EXISTS "anon_update_device_progress" ON device_progress;
CREATE POLICY "anon_update_device_progress" ON device_progress FOR UPDATE
  TO anon, authenticated USING (device_secret = request_device_secret()) WITH CHECK (device_secret = request_device_secret());

DROP POLICY IF EXISTS "anon_delete_device_progress" ON device_progress;
CREATE POLICY "anon_delete_device_progress" ON device_progress FOR DELETE
  TO anon, authenticated USING (device_secret = request_device_secret());

DROP POLICY IF EXISTS "anon_select_card_reviews" ON card_reviews;
CREATE POLICY "anon_select_card_reviews" ON card_reviews FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM device_progress dp WHERE dp.device_id = card_reviews.device_id AND dp.device_secret = request_device_secret())
  );

DROP POLICY IF EXISTS "anon_insert_card_reviews" ON card_reviews;
CREATE POLICY "anon_insert_card_reviews" ON card_reviews FOR INSERT
  TO anon, authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM device_progress dp WHERE dp.device_id = card_reviews.device_id AND dp.device_secret = request_device_secret())
  );

DROP POLICY IF EXISTS "anon_update_card_reviews" ON card_reviews;
CREATE POLICY "anon_update_card_reviews" ON card_reviews FOR UPDATE
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM device_progress dp WHERE dp.device_id = card_reviews.device_id AND dp.device_secret = request_device_secret())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM device_progress dp WHERE dp.device_id = card_reviews.device_id AND dp.device_secret = request_device_secret())
  );

DROP POLICY IF EXISTS "anon_delete_card_reviews" ON card_reviews;
CREATE POLICY "anon_delete_card_reviews" ON card_reviews FOR DELETE
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM device_progress dp WHERE dp.device_id = card_reviews.device_id AND dp.device_secret = request_device_secret())
  );
