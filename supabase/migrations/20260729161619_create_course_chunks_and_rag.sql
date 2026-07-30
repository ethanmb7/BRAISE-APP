/*
# Create course_chunks table and match_course_chunks RPC for RAG

1. Extensions
- Enable `vector` (pgvector) for embedding storage and similarity search.

2. New Tables
- `course_chunks`: stores course content chunks for retrieval-augmented generation.
  - `id` (uuid, primary key)
  - `subject` (text, e.g. "maths", "francais")
  - `chapter_id` (text, e.g. "m3")
  - `chapter_title` (text, human-readable chapter name)
  - `level` (text, e.g. "3e", "2nde")
  - `content` (text, the actual course excerpt)
  - `embedding` (vector(768), Gemini text-embedding-004 dimension)
  - `created_at` (timestamp)

3. Indexes
- HNSW index on `embedding` for fast cosine similarity search.

4. Functions
- `match_course_chunks(embedding vector(768), match_count int)`: returns the closest
  course chunks to the query embedding using cosine distance. This is called by the
  Gemini edge function to retrieve relevant course context before generating a response.

5. Security
- Enable RLS on `course_chunks`.
- Allow anon + authenticated to SELECT (the app has no sign-in screen; course content
  is intentionally shared/public).
- Allow anon + authenticated to INSERT (for seeding content from the edge function).
- Allow anon + authenticated to UPDATE and DELETE for content management.

6. Important Notes
- The `vector` extension must be installed before creating the table.
- Embeddings use 768 dimensions (Google Gemini text-embedding-004).
- The match function uses cosine distance operator `<=>` which is the standard
  for semantic similarity search with normalized embeddings.
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create course_chunks table
CREATE TABLE IF NOT EXISTS course_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  chapter_id text NOT NULL,
  chapter_title text NOT NULL,
  level text NOT NULL DEFAULT '3e',
  content text NOT NULL,
  embedding vector(768),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_chunks ENABLE ROW LEVEL SECURITY;

-- Policies: course content is shared/public (no sign-in screen)
DROP POLICY IF EXISTS "anon_select_course_chunks" ON course_chunks;
CREATE POLICY "anon_select_course_chunks" ON course_chunks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_course_chunks" ON course_chunks;
CREATE POLICY "anon_insert_course_chunks" ON course_chunks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_course_chunks" ON course_chunks;
CREATE POLICY "anon_update_course_chunks" ON course_chunks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_course_chunks" ON course_chunks;
CREATE POLICY "anon_delete_course_chunks" ON course_chunks FOR DELETE
  TO anon, authenticated USING (true);

-- HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS course_chunks_embedding_idx
  ON course_chunks USING hnsw (embedding vector_cosine_ops);

-- Match function: retrieve closest course chunks by embedding
CREATE OR REPLACE FUNCTION match_course_chunks(
  embedding vector(768),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  subject text,
  chapter_id text,
  chapter_title text,
  level text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.id,
    c.subject,
    c.chapter_id,
    c.chapter_title,
    c.level,
    c.content,
    1 - (c.embedding <=> embedding) AS similarity
  FROM course_chunks c
  WHERE c.embedding IS NOT NULL
  ORDER BY c.embedding <=> embedding
  LIMIT match_count;
$$;
