create table public.demo2_form_submissions (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(btrim(name)) between 2 and 80),
 email text not null check (char_length(email) between 3 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 message text not null check (char_length(btrim(message)) between 10 and 1000),
 created_at timestamptz not null default now()
);
alter table public.demo2_form_submissions enable row level security;
revoke all on table public.demo2_form_submissions from public, anon, authenticated;
grant insert (name,email,message) on public.demo2_form_submissions to anon;
create policy demo2_valid_submission_insert on public.demo2_form_submissions for insert to anon
with check (
 char_length(btrim(name)) between 2 and 80
 and char_length(email) between 3 and 254
 and email ~ '^demo-[a-z0-9-]+@example\.test$'
 and char_length(btrim(message)) between 10 and 1000
);
comment on table public.demo2_form_submissions is 'Isolated demonstration form; fictional submissions only. No public read or mutation access.';