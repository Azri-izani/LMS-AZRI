-- ================================================================
-- LMS Petrokimia — Supabase Database Schema
-- Jalankan SQL ini dalam Supabase SQL Editor
-- ================================================================

-- Enable pgvector untuk Cikgu AI (RAG)
create extension if not exists vector;

-- ================================================================
-- TABLE: course_settings (nama kursus & maklumat am)
-- ================================================================
create table if not exists course_settings (
  id uuid primary key default gen_random_uuid(),
  course_name text not null default 'Nama Kursus',
  course_code text default '',
  course_description text default '',
  lecturer_name text default '',
  updated_at timestamptz default now()
);

-- Insert satu baris default
insert into course_settings (course_name, course_code, lecturer_name)
values ('Kursus Saya', 'KOD001', 'Nama Pensyarah')
on conflict do nothing;

-- ================================================================
-- TABLE: topics
-- ================================================================
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  order_no integer not null default 0,
  created_at timestamptz default now()
);

-- ================================================================
-- TABLE: notes (PDF nota)
-- ================================================================
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  title text not null,
  file_url text not null,
  file_name text default '',
  created_at timestamptz default now()
);

-- ================================================================
-- TABLE: videos (YouTube links)
-- ================================================================
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  title text not null,
  youtube_url text not null,
  description text default '',
  created_at timestamptz default now()
);

-- ================================================================
-- TABLE: past_year (Soalan Past Year)
-- ================================================================
create table if not exists past_year (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  semester text not null,
  title text not null,
  question_pdf_url text not null,
  answer_pdf_url text default null,
  answer_visible boolean default false,
  created_at timestamptz default now()
);

-- ================================================================
-- TABLE: students (Pelajar berdaftar)
-- ================================================================
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  matric_no text unique not null,
  created_at timestamptz default now()
);

-- ================================================================
-- TABLE: note_chunks (untuk RAG — Cikgu AI)
-- Setiap chunk adalah bahagian kecil dari PDF nota
-- ================================================================
create table if not exists note_chunks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references notes(id) on delete cascade,
  topic_id uuid references topics(id) on delete cascade,
  content text not null,
  embedding vector(768),
  chunk_index integer default 0,
  created_at timestamptz default now()
);

-- Index untuk vector similarity search
create index if not exists note_chunks_embedding_idx
  on note_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ================================================================
-- FUNCTION: match_note_chunks
-- Cari chunks yang paling relevan dengan soalan pelajar
-- ================================================================
create or replace function match_note_chunks(
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  note_id uuid,
  topic_id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    note_chunks.id,
    note_chunks.note_id,
    note_chunks.topic_id,
    note_chunks.content,
    1 - (note_chunks.embedding <=> query_embedding) as similarity
  from note_chunks
  where 1 - (note_chunks.embedding <=> query_embedding) > match_threshold
  order by note_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
-- Jalankan ini dalam Supabase Storage atau uncomment jika guna SQL:
-- insert into storage.buckets (id, name, public) values ('notes', 'notes', true);
-- insert into storage.buckets (id, name, public) values ('pastyear', 'pastyear', true);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) — Public read, service role write
-- ================================================================
alter table course_settings enable row level security;
alter table topics enable row level security;
alter table notes enable row level security;
alter table videos enable row level security;
alter table past_year enable row level security;
alter table students enable row level security;
alter table note_chunks enable row level security;

-- Allow public read untuk semua table
create policy "Public read course_settings" on course_settings for select using (true);
create policy "Public read topics" on topics for select using (true);
create policy "Public read notes" on notes for select using (true);
create policy "Public read videos" on videos for select using (true);
create policy "Public read past_year" on past_year for select using (true);
create policy "Public read note_chunks" on note_chunks for select using (true);

-- Allow insert student
create policy "Public insert students" on students for insert with check (true);
create policy "Public read students" on students for select using (true);

-- Service role boleh buat semua (untuk admin actions)
create policy "Service role all course_settings" on course_settings using (auth.role() = 'service_role');
create policy "Service role all topics" on topics using (auth.role() = 'service_role');
create policy "Service role all notes" on notes using (auth.role() = 'service_role');
create policy "Service role all videos" on videos using (auth.role() = 'service_role');
create policy "Service role all past_year" on past_year using (auth.role() = 'service_role');
create policy "Service role all note_chunks" on note_chunks using (auth.role() = 'service_role');
