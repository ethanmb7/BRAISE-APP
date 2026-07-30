/*
# Create progress persistence tables (single-tenant, no auth)

This app has no sign-in screen, so all data is single-tenant and shared.
We use a device_id (a UUID generated client-side and stored in localStorage)
to key each device's progress. RLS is enabled but policies allow anon+authenticated
full access since there is no user isolation requirement.

1. New Tables
- `device_progress` — one row per device, stores XP, streak, freezes, settings, profile.
  - `device_id` (uuid, primary key)
  - `xp` (int, default 0)
  - `streak` (int, default 0)
  - `freezes` (int, default 0)
  - `freeze_armed` (boolean, default false)
  - `daily_goal_met` (boolean, default false)
  - `dark_mode` (boolean, default false)
  - `dyslexia_mode` (boolean, default false)
  - `sound_on` (boolean, default true)
  - `profile` (jsonb, stores name/level/subjects/avatar/goal)
  - `completed_chapters` (text[], default '{}')
  - `session_date` (text, default '')
  - `session_cards_reviewed` (int, default 0)
  - `session_chapters_done` (int, default 0)
  - `updated_at` (timestamptz, auto-updated)

- `card_reviews` — one row per flashcard per device, stores SM-2 scheduling state.
  - `id` (uuid, primary key)
  - `device_id` (uuid, references device_progress)
  - `card_id` (text, the flashcard id)
  - `repetitions` (int)
  - `interval` (int)
  - `ease` (real)
  - `next_review_at` (bigint, epoch ms)
  - `last_confidence` (text)
  - UNIQUE constraint on (device_id, card_id)

2. Security
- RLS enabled on both tables.
- Policies allow anon+authenticated full CRUD (single-tenant, no user isolation).
*/

CREATE TABLE IF NOT EXISTS device_progress (
  device_id uuid PRIMARY KEY,
  xp int NOT NULL DEFAULT 0,
  streak int NOT NULL DEFAULT 0,
  freezes int NOT NULL DEFAULT 0,
  freeze_armed boolean NOT NULL DEFAULT false,
  daily_goal_met boolean NOT NULL DEFAULT false,
  dark_mode boolean NOT NULL DEFAULT false,
  dyslexia_mode boolean NOT NULL DEFAULT false,
  sound_on boolean NOT NULL DEFAULT true,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_chapters text[] NOT NULL DEFAULT '{}',
  session_date text NOT NULL DEFAULT '',
  session_cards_reviewed int NOT NULL DEFAULT 0,
  session_chapters_done int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE device_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_device_progress" ON device_progress;
CREATE POLICY "anon_select_device_progress" ON device_progress FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_device_progress" ON device_progress;
CREATE POLICY "anon_insert_device_progress" ON device_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_device_progress" ON device_progress;
CREATE POLICY "anon_update_device_progress" ON device_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_device_progress" ON device_progress;
CREATE POLICY "anon_delete_device_progress" ON device_progress FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS card_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES device_progress(device_id) ON DELETE CASCADE,
  card_id text NOT NULL,
  repetitions int NOT NULL DEFAULT 0,
  interval int NOT NULL DEFAULT 0,
  ease real NOT NULL DEFAULT 2.5,
  next_review_at bigint NOT NULL DEFAULT 0,
  last_confidence text NOT NULL DEFAULT 'not-sure',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_card_reviews_device_due
  ON card_reviews (device_id, next_review_at);

ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_card_reviews" ON card_reviews;
CREATE POLICY "anon_select_card_reviews" ON card_reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_card_reviews" ON card_reviews;
CREATE POLICY "anon_insert_card_reviews" ON card_reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_card_reviews" ON card_reviews;
CREATE POLICY "anon_update_card_reviews" ON card_reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_card_reviews" ON card_reviews;
CREATE POLICY "anon_delete_card_reviews" ON card_reviews FOR DELETE
  TO anon, authenticated USING (true);
